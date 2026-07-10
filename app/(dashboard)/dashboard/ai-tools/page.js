'use client'

import { useRouter } from 'next/navigation'

const AI_TOOLS = [
  {
    icon: '',
    name: 'Professional Summary Generator',
    description: 'Generate a polished, ATS-friendly professional summary tailored to your experience and target role.',
  },
  {
    icon: '',
    name: 'Skills Suggester',
    description: 'Get relevant skill suggestions based on your job title and experience, so you never miss a keyword recruiters search for.',
  },
  {
    icon: '',
    name: 'ATS Score Checker',
    description: 'Check how well your resume is likely to score with Applicant Tracking Systems, with specific suggestions to improve it.',
  },
  {
    icon: '',
    name: 'Job Description Optimizer',
    description: 'Paste a job description and get a match score plus suggestions to tailor your resume for that specific role.',
  },
]

export default function AiTools() {
  const router = useRouter()

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">AI Tools</h1>
      <p className="text-foreground/60 text-sm mb-8">
        These AI-powered tools are built right into the resume builder — open any resume to use them.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {AI_TOOLS.map((tool) => (
          <div key={tool.name} className="border border-border rounded-xl p-6">
            <div className="text-2xl mb-3">{tool.icon}</div>
            <h2 className="font-semibold mb-1.5">{tool.name}</h2>
            <p className="text-foreground/60 text-sm">{tool.description}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/dashboard/resumes')}
        className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
      >
        Go to Resumes →
      </button>
    </div>
  )
}
