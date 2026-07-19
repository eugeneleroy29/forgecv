'use client'

import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import ResumeThumbnail from '../components/resume/ResumeThumbnail'
import PortfolioThumbnail from '../components/portfolio/PortfolioThumbnail'
import CoverLetterThumbnail from '../components/cover-letter/CoverLetterThumbnail'
import { PORTFOLIO_THEMES } from '../components/portfolio/portfolioThemes'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

const RESUME_TEMPLATE_OPTIONS = [
  { id: 'ats-harvard-classic', label: 'ATS Classic', description: 'Clean, traditional layout optimized for applicant tracking systems.' },
  { id: 'ats-harvard-modern', label: 'ATS Modern', description: 'Modern ATS-friendly design with subtle visual hierarchy.' },
  { id: 'premium-sidebar-photo', label: 'Sidebar', description: 'Professional sidebar layout with photo and accent color.' },
  { id: 'premium-topheader-photo', label: 'Modern Header', description: 'Bold header with photo and modern two-column body.' },
  { id: 'premium-twocol-photo', label: 'Two-Column', description: 'Elegant two-column design with photo and rich detail sections.' },
]

const COVER_LETTER_TEMPLATE_OPTIONS = [
  { id: 'ats-classic', label: 'ATS Classic', description: 'Traditional format with clean spacing for maximum readability.' },
  { id: 'ats-modern', label: 'ATS Modern', description: 'Contemporary header with accent line and structured layout.' },
  { id: 'premium-minimal', label: 'Premium Minimal', description: 'Elegant centered header with accent color and generous whitespace.' },
]

const TABS = [
  { id: 'resumes', label: 'Resumes', count: 5 },
  { id: 'portfolios', label: 'Portfolios', count: 9 },
  { id: 'cover-letters', label: 'Cover Letters', count: 3 },
]

function FileTextIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  )
}

function LayoutIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  )
}

function MailIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function ArrowRightIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

const TAB_ICONS = {
  resumes: FileTextIcon,
  portfolios: LayoutIcon,
  'cover-letters': MailIcon,
}

export default function Templates() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('resumes')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 animate-fade-in">
          Professional Templates
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-10 animate-fade-in delay-100">
          Every template is ATS-friendly, fully customizable, and designed to help Filipino VAs stand out to global employers.
        </p>

        {/* Tabs */}
        <div className="inline-flex items-center gap-1 p-1.5 bg-muted rounded-2xl border border-border animate-fade-in delay-200">
          {TABS.map((tab) => {
            const Icon = TAB_ICONS[tab.id]
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-white text-foreground shadow-sm border border-border'
                    : 'text-foreground/50 hover:text-foreground/80'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-accent/10 text-accent' : 'bg-foreground/5 text-foreground/40'}`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Resume Templates */}
      {activeTab === 'resumes' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {RESUME_TEMPLATE_OPTIONS.map((t, i) => (
              <div
                key={t.id}
                className="group cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => router.push(user ? '/dashboard/resumes' : '/signup')}
              >
                <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:border-accent/20">
                  <div className="p-4 pb-0 flex justify-center">
                    <ResumeThumbnail template={t.id} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-sm mb-1.5 group-hover:text-accent transition-colors">
                      {t.label}
                    </h3>
                    <p className="text-xs text-foreground/50 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Use this template
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Portfolio Templates */}
      {activeTab === 'portfolios' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(PORTFOLIO_THEMES).map(([slug, theme], i) => (
              <div
                key={slug}
                className="group cursor-pointer"
                style={{ animationDelay: `${i * 75}ms` }}
                onClick={() => router.push(user ? '/dashboard/portfolios' : '/signup')}
              >
                <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:border-accent/20">
                  <div className="p-4 pb-0 flex justify-center">
                    <PortfolioThumbnail template={slug} />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">
                        {theme.label}
                      </h3>
                    </div>
                    <p className="text-xs text-foreground/50 leading-relaxed">
                      {theme.headingFont === 'serif' ? 'Elegant serif headings' : 'Clean sans-serif headings'} with {theme.accent} accent
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Use this template
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cover Letter Templates */}
      {activeTab === 'cover-letters' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {COVER_LETTER_TEMPLATE_OPTIONS.map((t, i) => (
              <div
                key={t.id}
                className="group cursor-pointer"
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => router.push(user ? '/dashboard/cover-letters' : '/signup')}
              >
                <div className="bg-white border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:border-accent/20">
                  <div className="p-4 pb-0 flex justify-center">
                    <CoverLetterThumbnail template={t.id} />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-sm mb-1.5 group-hover:text-accent transition-colors">
                      {t.label}
                    </h3>
                    <p className="text-xs text-foreground/50 leading-relaxed">
                      {t.description}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                      Use this template
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-white border border-border rounded-2xl p-10 sm:p-14 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Ready to build your profile?
          </h2>
          <p className="text-foreground/60 mb-8 max-w-md mx-auto">
            Choose any template and customize it with your own content, colors, and style.
          </p>
          <button
            onClick={() => router.push(user ? '/dashboard' : '/signup')}
            className="bg-accent text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all shadow-lg shadow-accent/10 hover:shadow-accent/20 flex items-center gap-2 mx-auto"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}