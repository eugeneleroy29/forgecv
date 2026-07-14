import Groq from 'groq-sdk'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const MODEL_CHAIN = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'allam-2-7b',
]

async function tryModels(groq, messages, maxTokens) {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i]
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.3,
      })
      return completion
    } catch (error) {
      const isRateLimit = error.status === 429 || 
        error.message?.includes('429') ||
        error.message?.includes('RateLimit') ||
        error.message?.includes('rate limit')
      
      if (isRateLimit && i < MODEL_CHAIN.length - 1) {
        console.warn(`Groq model ${model} rate limited, trying fallback ${MODEL_CHAIN[i + 1]}`)
        continue
      }
      throw error
    }
  }
}

async function checkAndIncrementAiUsage(userId) {
  const { data: profile, error: fetchError } = await supabaseAdmin
  .from('profiles')
  .select('ai_generations_used, ai_generations_reset_date, subscription_tier, is_admin')
  .eq('id', userId)
  .single()

if (fetchError || !profile) {
  throw new Error('Failed to fetch user profile')
}

// Admins get unlimited AI
if (profile.is_admin) {
  return { allowed: true, limit: Infinity, used: 0, plan: 'admin' }
}

const plan = profile.subscription_tier || 'free'
const limits = { free: 0, starter: 30, pro: 60 }
const limit = limits[plan] || 0

  const now = new Date()
  const resetDate = profile.ai_generations_reset_date 
    ? new Date(profile.ai_generations_reset_date) 
    : null

  let currentUsed = profile.ai_generations_used || 0

  if (!resetDate || (now - resetDate) > (30 * 24 * 60 * 60 * 1000)) {
    currentUsed = 0
    await supabaseAdmin
      .from('profiles')
      .update({ 
        ai_generations_used: 0, 
        ai_generations_reset_date: now.toISOString() 
      })
      .eq('id', userId)
  }

  if (currentUsed >= limit) {
    return { allowed: false, limit, used: currentUsed, plan }
  }

  await supabaseAdmin
    .from('profiles')
    .update({ ai_generations_used: currentUsed + 1 })
    .eq('id', userId)

  return { allowed: true, limit, used: currentUsed + 1, plan }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { extractedText, targetPosition } = await request.json()

    if (!extractedText?.trim()) {
      return Response.json({ success: false, error: 'No resume text provided' }, { status: 400 })
    }

    const usageCheck = await checkAndIncrementAiUsage(user.id)
    if (!usageCheck.allowed) {
      return Response.json({ 
        success: false, 
        error: `AI generation limit reached. You've used ${usageCheck.used}/${usageCheck.limit} generations this month on your ${usageCheck.plan} plan. Upgrade to get more.`,
        limitReached: true,
        used: usageCheck.used,
        limit: usageCheck.limit,
        plan: usageCheck.plan
      }, { status: 403 })
    }

    const systemPrompt = `You are an expert resume parser and ATS optimizer. Extract structured resume data from the provided text and optimize it for the target position. Return ONLY valid JSON, no markdown, no explanations.`

    const userPrompt = `Parse this resume text and extract structured information. Optimize everything for a ${targetPosition || 'professional'} position.

Resume text:
${extractedText}

Return ONLY this exact JSON structure (no markdown, no extra text):
{
  "personalInfo": {
    "fullName": "string",
    "email": "string or empty",
    "phone": "string or empty",
    "location": "string or empty",
    "linkedin": "string or empty"
  },
  "summary": "Professional summary paragraph, 3-4 sentences, ATS-optimized for target position",
  "experience": [
    {
      "jobTitle": "string",
      "company": "string",
      "startDate": "YYYY-MM or empty",
      "endDate": "YYYY-MM or empty",
      "current": false,
      "description": "Bullet points or paragraph describing responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string",
      "startDate": "YYYY-MM or empty",
      "endDate": "YYYY-MM or empty",
      "current": false
    }
  ],
  "skills": ["skill1", "skill2", "skill3"]
}

Rules:
- If dates are unclear, use best guess or empty string
- If information is missing, use empty string or empty array
- Summary must be ATS-friendly with relevant keywords for the target position
- Experience descriptions should include quantifiable achievements where possible
- Skills should be relevant to the target position`

    const completion = await tryModels(groq, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], 2000)

    let resultText = completion.choices[0].message.content

    // Clean up markdown code blocks if present
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim()

    const parsedData = JSON.parse(resultText)

    return Response.json({
      success: true,
      data: parsedData,
      used: usageCheck.used,
      limit: usageCheck.limit,
    })

  } catch (error) {
    console.error('Transform resume error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}
