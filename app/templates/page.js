'use client'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ResumeThumbnail from '../components/resume/ResumeThumbnail'
import PortfolioThumbnail from '../components/portfolio/PortfolioThumbnail'
import { PORTFOLIO_THEMES } from '../components/portfolio/portfolioThemes'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

const RESUME_TEMPLATE_OPTIONS = [
  { id: 'ats-harvard-classic', label: 'ATS Classic' },
  { id: 'ats-harvard-modern', label: 'ATS Modern' },
  { id: 'premium-sidebar-photo', label: 'Sidebar' },
  { id: 'premium-topheader-photo', label: 'Modern Header' },
  { id: 'premium-twocol-photo', label: 'Two-Column' },
]

export default function Templates() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Resume & Portfolio Templates</h1>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
          Every template is ATS-friendly and fully customizable - accent color, font, and layout, all included.
        </p>
      </section>

      {/* Resume Templates */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-8">Resume Templates</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {RESUME_TEMPLATE_OPTIONS.map((t) => (
            <div key={t.id} className="flex flex-col items-center gap-3">
              <ResumeThumbnail template={t.id} />
              <p className="text-sm font-medium">{t.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portfolio Templates */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold mb-8">Portfolio Templates</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {Object.entries(PORTFOLIO_THEMES).map(([slug, theme]) => (
            <div key={slug} className="flex flex-col items-center gap-3">
              <PortfolioThumbnail template={slug} />
              <p className="text-sm font-medium">{theme.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
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
