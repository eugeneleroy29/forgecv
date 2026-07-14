import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Fallback chain: best quality first, then higher-limit models
const MODEL_CHAIN = [
  'llama-3.3-70b-versatile',   // Best quality, 1,000 RPD
  'llama-3.1-8b-instant',      // Highest RPD (14,400), lower quality
  'allam-2-7b',                // Middle ground, 7,000 RPD
]

async function tryModels(groq, messages, maxTokens) {
  for (let i = 0; i < MODEL_CHAIN.length; i++) {
    const model = MODEL_CHAIN[i]
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      })
      return completion
    } catch (error) {
      // If it's a rate limit (429) and we have more fallbacks, try next
      const isRateLimit = error.status === 429 || 
        error.message?.includes('429') ||
        error.message?.includes('RateLimit') ||
        error.message?.includes('rate limit')
      
      if (isRateLimit && i < MODEL_CHAIN.length - 1) {
        console.warn(`Groq model ${model} rate limited, trying fallback ${MODEL_CHAIN[i + 1]}`)
        continue
      }
      
      // If it's the last model or not a rate limit, throw
      throw error
    }
  }
}

export async function POST(request) {
  try {
    const { type, data } = await request.json()

    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'summary') {
      systemPrompt = 'You are a professional resume writer. Return ONLY the summary text, no explanations or extra text.'
      userPrompt = `Write a concise, ATS-friendly professional summary for a ${data.jobTitle} with the following experience: ${data.experience}.

Requirements:
- 3-4 sentences maximum
- Start with a strong action or descriptor
- Include key skills and years of experience if provided
- Make it ATS-friendly with relevant keywords
- Professional and confident tone
- Do not use "I" — write in third person or omit the subject`
    }

    if (type === 'skills') {
      systemPrompt = 'You are a career coach. Return ONLY a comma-separated list of skills, nothing else.'
      userPrompt = `Suggest 10 relevant professional skills for a ${data.jobTitle}.

Requirements:
- Mix of technical and soft skills
- ATS-friendly keywords
- Relevant to the job title

Example format: Project Management, Microsoft Office, Customer Service, Data Entry, Communication`
    }

    if (type === 'ats_score') {
      systemPrompt = 'You are an ATS expert. Respond ONLY in the exact JSON format requested, no other text.'
      userPrompt = `Analyze this resume content and give an ATS score.

Resume data:
- Name: ${data.personalInfo?.fullName}
- Summary: ${data.summary}
- Experience: ${JSON.stringify(data.experience)}
- Education: ${JSON.stringify(data.education)}
- Skills: ${data.skills?.join(', ')}

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
}`
    }

    if (type === 'job_optimizer') {
      systemPrompt = 'You are an ATS optimization expert. Respond ONLY in the exact JSON format requested, no other text.'
      userPrompt = `Analyze this job description and suggest improvements to the resume.

Job Description: ${data.jobDescription}

Current Resume Skills: ${data.skills?.join(', ')}
Current Summary: ${data.summary}

Respond in this EXACT JSON format only, no other text:
{
  "matchScore": 65,
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": [
    "Add these keywords to your skills section",
    "Update your summary to mention X"
  ]
}`
    }

    if (!userPrompt) {
      return Response.json({ success: false, error: 'Unknown AI tool type' }, { status: 400 })
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]

    const completion = await tryModels(groq, messages, 1000)

    return Response.json({
      success: true,
      result: completion.choices[0].message.content,
    })

  } catch (error) {
    console.error('AI API error:', error)
    
    // Friendly error messages for common issues
    let userMessage = error.message
    if (error.status === 429 || error.message?.includes('429')) {
      userMessage = 'Our AI service is temporarily busy. Please wait a moment and try again.'
    } else if (error.status === 401 || error.message?.includes('401')) {
      userMessage = 'AI service authentication failed. Please contact support.'
    } else if (error.status >= 500) {
      userMessage = 'AI service temporarily unavailable. Please try again shortly.'
    }
    
    return Response.json({ success: false, error: userMessage }, { status: error.status || 500 })
  }
}
