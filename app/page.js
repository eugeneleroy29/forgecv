'use client'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-background text-foreground">

      <Navbar />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Build your resume and portfolio
          <span className="text-accent"> in minutes</span>
        </h1>
        <p className="text-lg text-foreground/60 mb-10 max-w-2xl mx-auto">
          ATS-friendly resumes and stunning portfolio websites for freelancers and remote workers worldwide. Powered by AI.
        </p>
        <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => router.push(user ? '/dashboard' : '/signup')}
              className="bg-accent text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              {user ? 'Go to Dashboard' : 'Get Started Free'}
            </button>
            <button
              onClick={() => router.push('/templates')}
              className="border border-border text-foreground px-8 py-3 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
            >
              View Templates
            </button>
          </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors">
            <div className="text-accent text-2xl mb-4">📄</div>
            <h3 className="font-semibold text-lg mb-2">ATS-Friendly Resumes</h3>
            <p className="text-sm text-foreground/60">
              Beat applicant tracking systems with optimized resume templates built to get you noticed.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors">
            <div className="text-accent text-2xl mb-4">🌐</div>
            <h3 className="font-semibold text-lg mb-2">Portfolio Websites</h3>
            <p className="text-sm text-foreground/60">
              Publish a stunning portfolio website tailored to your niche in just a few clicks.
            </p>
          </div>

          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors">
            <div className="text-accent text-2xl mb-4">🤖</div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered Tools</h3>
            <p className="text-sm text-foreground/60">
              Generate professional summaries, check ATS scores, and optimize for any job description.
            </p>
          </div>

        </div>
      </section>

      <Footer />

    </main>
  )
}