'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const FEATURE_SECTIONS = [
  {
    title: 'ATS-Friendly Resume Builder',
    description: 'Build a professional resume with 5 distinct templates - two Harvard-style ATS-optimized layouts and three premium designs with photo support. Customize accent color, font, and section order.',
    points: [
      'Live preview as you edit',
      'Reorder sections to fit your story',
      'Export directly to PDF',
      'Conditional fields - empty sections never show up in your final resume',
    ],
  },
  {
    title: 'Portfolio Website Builder',
    description: 'Publish a live portfolio website in minutes, tailored to your niche - from virtual assistants to graphic designers.',
    points: [
      '9 niche-specific templates',
      'Custom accent color and font style',
      'Showcase your skills and tools with a visual icon grid',
      'Get a shareable public link (yourname.forgecv.com/p/yourname)',
    ],
  },
  {
    title: 'AI-Powered Tools',
    description: 'Built-in AI features to help you stand out and get past applicant tracking systems.',
    points: [
      'Professional Summary Generator',
      'Skills Suggester based on your role',
      'ATS Score Checker with actionable suggestions',
      'Job Description Optimizer - paste a job posting, get a match score',
    ],
  },
]

export default function Features() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Everything you need to land your next role</h1>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
          ForgeCV combines resume building, portfolio websites, and AI tools in one place - built for freelancers and remote workers.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="flex flex-col gap-12">
          {FEATURE_SECTIONS.map((section) => (
            <div key={section.title} className="border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-3">{section.title}</h2>
              <p className="text-foreground/60 mb-6">{section.description}</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {section.points.map((point) => (
                  <li key={point} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">&#10003;</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <button
          onClick={() => router.push(user ? '/dashboard' : '/signup')}
          className="bg-accent text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {user ? 'Go to Dashboard' : 'Get Started Free'}
        </button>
      </section>

      <Footer />
    </main>
  )
}
