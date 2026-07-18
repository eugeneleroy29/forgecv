'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { getUserEntitlements } from '@/lib/entitlements'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// SVG Icons
const SparklesIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a22 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const FileTextIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ZapIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const BarChartIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const TargetIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const AI_TOOLS = [
  {
    icon: SparklesIcon,
    name: 'Professional Summary Generator',
    description: 'Generate a polished, ATS-friendly professional summary tailored to your experience and target role.',
    status: 'live',
  },
  {
    icon: SearchIcon,
    name: 'Skills Suggester',
    description: 'Get relevant skill suggestions based on your job title and experience, so you never miss a keyword recruiters search for.',
    status: 'live',
  },
  {
    icon: BarChartIcon,
    name: 'ATS Score Checker',
    description: 'Check how well your resume is likely to score with Applicant Tracking Systems, with specific suggestions to improve it.',
    status: 'live',
  },
  {
    icon: TargetIcon,
    name: 'Job Description Optimizer',
    description: 'Paste a job description and get a match score plus suggestions to tailor your resume for that specific role.',
    status: 'live',
  },
]

export default function AiTools() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ used: 0, limit: 0, plan: 'free', isAdmin: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const entitlements = await getUserEntitlements(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_generations_used')
        .eq('id', user.id)
        .single()

      setStats({
        used: profile?.ai_generations_used || 0,
        limit: entitlements.aiGenerationsPerMonth || 0,
        plan: entitlements.plan || 'free',
        isAdmin: entitlements.isAdmin || false,
      })
      setLoading(false)
    } catch (e) {
      console.error('Failed to fetch AI stats:', e)
      setLoading(false)
    }
  }

  const usagePercent = stats.isAdmin
    ? 0
    : stats.limit > 0
      ? Math.round((stats.used / stats.limit) * 100)
      : 0

  const displayLimit = stats.isAdmin ? '∞' : stats.limit
  const displayUsed = stats.isAdmin ? stats.used : `${stats.used} / ${stats.limit}`

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          AI Tools
        </h1>
        <p className="text-foreground/60">
          Smart features built into your resume builder to help you stand out.
        </p>
      </div>

      {/* Usage Stats Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <ZapIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-foreground/60">AI Generations This Month</p>
            <p className="text-2xl font-bold tracking-tight">
              {stats.isAdmin ? 'Unlimited' : displayUsed}
            </p>
          </div>
        </div>
        {!stats.isAdmin && stats.limit > 0 && (
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-foreground/60">{usagePercent}% used</span>
              <span className="text-foreground/40">{stats.limit - stats.used} remaining</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${usagePercent >= 90 ? 'bg-red-500' : 'bg-accent'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
        )}
        {stats.plan === 'free' && (
          <Link
            href="/dashboard/billing"
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 text-center whitespace-nowrap"
          >
            Upgrade for More
          </Link>
        )}
      </div>

      {/* Tools Grid */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4 tracking-tight">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <div
                key={tool.name}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/15 transition-colors">
                    <Icon />
                  </div>
                  {tool.status === 'live' && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-1.5 tracking-tight">{tool.name}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed mb-4">
                  {tool.description}
                </p>
                <p className="text-xs text-foreground/40">
                  Available inside the resume builder
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <FileTextIcon />
          </div>
          <div>
            <p className="text-sm text-foreground/60">Ready to use AI?</p>
            <p className="text-lg font-semibold tracking-tight">Open a resume to start</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/resumes')}
          className="inline-flex items-center justify-center gap-2 bg-accent text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 w-full sm:w-auto"
        >
          Go to Resumes
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  )
}