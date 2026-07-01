import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { type, data } = await request.json()

    let prompt = ''

    if (type === 'summary') {
      prompt = `You are a professional resume writer. Write a concise, ATS-friendly professional summary for a ${data.jobTitle} with the following experience: ${data.experience}. 
      
      Requirements:
      - 3-4 sentences maximum
      - Start with a strong action or descriptor
      - Include key skills and years of experience if provided
      - Make it ATS-friendly with relevant keywords
      - Professional and confident tone
      - Do not use "I" — write in third person or omit the subject
      
      Return ONLY the summary text, no explanations or extra text.`
    }

    if (type === 'skills') {
      prompt = `You are a career coach. Suggest 10 relevant professional skills for a ${data.jobTitle}.
      
      Requirements:
      - Mix of technical and soft skills
      - ATS-friendly keywords
      - Relevant to the job title
      - Return ONLY a comma-separated list of skills, nothing else
      
      Example format: Project Management, Microsoft Office, Customer Service, Data Entry, Communication`
    }

    if (type === 'ats_score') {
      prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume content and give an ATS score.

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
      prompt = `You are an ATS optimization expert. Analyze this job description and suggest improvements to the resume.

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

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    return Response.json({ 
      success: true, 
      result: message.content[0].text 
    })

  } catch (error) {
    console.error('AI API error:', error)
    return Response.json({ success: false, error: error.message }, { status: 500 })
  }
}