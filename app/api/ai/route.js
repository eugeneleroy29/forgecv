import Groq from "groq-sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Fallback chain: best quality first, then higher-limit models
const MODEL_CHAIN = [
  "llama-3.3-70b-versatile", // Best quality, 1,000 RPD
  "llama-3.1-8b-instant", // Highest RPD (14,400), lower quality
  "allam-2-7b", // Middle ground, 7,000 RPD
];

// Plan limits for AI generations
const AI_LIMITS = {
  free: 0,
  starter: 30,
  pro: 60,
};

async function tryModels(groq, messages, maxTokens) {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i];
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      });
      return completion;
    } catch (error) {
      const isRateLimit =
        error.status === 429 ||
        error.message?.includes("429") ||
        error.message?.includes("RateLimit") ||
        error.message?.includes("rate limit");

      if (isRateLimit && i < MODEL_CHAIN.length - 1) {
        console.warn(
          `Groq model ${model} rate limited, trying fallback ${MODEL_CHAIN[i + 1]}`,
        );
        continue;
      }

      throw error;
    }
  }
}

async function checkAndIncrementAiUsage(userId) {
  // 1. Fetch profile
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select(
      "ai_generations_used, ai_generations_reset_date, subscription_tier, is_admin",
    )
    .eq("id", userId)
    .single();

  if (fetchError || !profile) {
    throw new Error("Failed to fetch user profile");
  }

  // Admins get unlimited AI
  if (profile.is_admin) {
    return { allowed: true, limit: Infinity, used: 0, plan: "admin" };
  }

  // 2. VALIDATE against subscriptions table (source of truth)
  const { data: subscription } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .in("status", ["active", "trialing"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Use subscription table as source of truth, fallback to profiles
  const effectivePlan =
    subscription?.plan || profile.subscription_tier || "free";
  const limit = AI_LIMITS[effectivePlan] || 0;

  // Check if subscription is actually valid (not expired)
  if (effectivePlan !== "free" && subscription?.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end);
    if (periodEnd < new Date()) {
      return {
        allowed: false,
        limit: 0,
        used: profile.ai_generations_used || 0,
        plan: "free",
      };
    }
  }

  // 3. Check monthly counter reset
  const now = new Date();
  const resetDate = profile.ai_generations_reset_date
    ? new Date(profile.ai_generations_reset_date)
    : null;

  let currentUsed = profile.ai_generations_used || 0;

  // Reset if it's been more than a month since last reset
  if (!resetDate || now - resetDate > 30 * 24 * 60 * 60 * 1000) {
    currentUsed = 0;
    await supabaseAdmin
      .from("profiles")
      .update({
        ai_generations_used: 0,
        ai_generations_reset_date: now.toISOString(),
      })
      .eq("id", userId);
  }

  // Check limit
  if (currentUsed >= limit) {
    return { allowed: false, limit, used: currentUsed, plan: effectivePlan };
  }

  // Increment counter
  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ ai_generations_used: currentUsed + 1 })
    .eq("id", userId);

  if (updateError) {
    throw new Error("Failed to increment AI usage counter");
  }

  return { allowed: true, limit, used: currentUsed + 1, plan: effectivePlan };
}

export async function POST(request) {
  try {
    // Get user from Supabase auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { type, data } = await request.json();

    // Check AI generation limits
    const usageCheck = await checkAndIncrementAiUsage(user.id);
    if (!usageCheck.allowed) {
      return Response.json(
        {
          success: false,
          error: `AI generation limit reached. You've used ${usageCheck.used}/${usageCheck.limit} generations this month on your ${usageCheck.plan} plan. Upgrade to get more.`,
          limitReached: true,
          used: usageCheck.used,
          limit: usageCheck.limit,
          plan: usageCheck.plan,
        },
        { status: 403 },
      );
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "summary") {
      systemPrompt =
        "You are a professional resume writer. Return ONLY the summary text, no explanations or extra text.";
      userPrompt = `Write a concise, ATS-friendly professional summary for a ${data.jobTitle} with the following experience: ${data.experience}.

Requirements:
- 3-4 sentences maximum
- Start with a strong action or descriptor
- Include key skills and years of experience if provided
- Make it ATS-friendly with relevant keywords
- Professional and confident tone
- Do not use "I" — write in third person or omit the subject`;
    }

    if (type === "skills") {
      systemPrompt =
        "You are a career coach. Return ONLY a comma-separated list of skills, nothing else.";
      userPrompt = `Suggest 10 relevant professional skills for a ${data.jobTitle}.

Requirements:
- Mix of technical and soft skills
- ATS-friendly keywords
- Relevant to the job title

Example format: Project Management, Microsoft Office, Customer Service, Data Entry, Communication`;
    }

    if (type === "ats_score") {
      systemPrompt =
        "You are an ATS expert. Respond ONLY in the exact JSON format requested, no other text.";
      userPrompt = `Analyze this resume content and give an ATS score.

Resume data:
- Name: ${data.personalInfo?.fullName}
- Summary: ${data.summary}
- Experience: ${JSON.stringify(data.experience)}
- Education: ${JSON.stringify(data.education)}
- Skills: ${data.skills?.join(", ")}

Respond in this EXACT JSON format only, no other text:
{
  "score": 75,
  "feedback": [
    "Has a professional summary",
    "Missing quantifiable achievements in experience",
    "Good skills section"
  ],
  "improvements": [
    "Add numbers to your achievements (e.g. 'Managed 50+ clients')",
    "Include more industry keywords"
  ]
}`;
    }

    if (type === "job_optimizer") {
      systemPrompt =
        "You are an ATS optimization expert. Respond ONLY in the exact JSON format requested, no other text.";
      userPrompt = `Analyze this job description and suggest improvements to the resume.

Job Description: ${data.jobDescription}

Current Resume Skills: ${data.skills?.join(", ")}
Current Summary: ${data.summary}

Respond in this EXACT JSON format only, no other text:
{
  "matchScore": 65,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": [
    "Add these keywords to your skills section",
    "Update your summary to mention X"
  ]
}`;
    }

    if (type === "cover_letter") {
      systemPrompt =
        "You are a professional cover letter writer. Return ONLY the cover letter body text, no explanations, no extra text, no markdown formatting.";
      userPrompt = `Write a professional cover letter for the following job application.

      Job Title: ${data.jobTitle}
      Company: ${data.company}
      Hiring Manager: ${data.hiringManager || "Hiring Manager"}
      Tone: ${data.tone || "professional"}

      Candidate Information:
      - Name: ${data.personalInfo?.fullName || "Candidate"}
      - Current/Recent Role: ${data.currentRole || "Professional"}
      - Key Skills/Experience: ${data.keySkills || "Relevant experience in the field"}
      - Job Description: ${data.jobDescription || "Not provided"}

      Requirements:
      - 3-4 paragraphs maximum
      - Professional and confident tone
      - Mention why the candidate is a good fit for the role
      - Include a call to action in the closing paragraph
      - Do not use placeholders like [Your Name] — use the actual name provided
      - Do not include the date, company address, or signature block — only the body paragraphs
- If a job description is provided, reference specific requirements and responsibilities from it`;
    }

    if (!userPrompt) {
      return Response.json(
        { success: false, error: "Unknown AI tool type" },
        { status: 400 },
      );
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const completion = await tryModels(groq, messages, 1000);

    return Response.json({
      success: true,
      result: completion.choices[0].message.content,
      used: usageCheck.used,
      limit: usageCheck.limit,
    });
  } catch (error) {
    console.error("AI API error:", error);

    let userMessage = error.message;
    if (error.status === 429 || error.message?.includes("429")) {
      userMessage =
        "Our AI service is temporarily busy. Please wait a moment and try again.";
    } else if (error.status === 401 || error.message?.includes("401")) {
      userMessage = "AI service authentication failed. Please contact support.";
    } else if (error.status >= 500) {
      userMessage =
        "AI service temporarily unavailable. Please try again shortly.";
    }

    return Response.json(
      { success: false, error: userMessage },
      { status: error.status || 500 },
    );
  }
}
