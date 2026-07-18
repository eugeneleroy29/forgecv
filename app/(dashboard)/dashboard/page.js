'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserEntitlements } from '@/lib/entitlements'

// SVG Icons
const FileTextIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const ZapIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    resumes: 0,
    portfolios: 0,
    coverLetters: 0,
    aiUsed: 0,
    aiLimit: 0,
    plan: 'free',
    isAdmin: false,
    totalPublishSlots: 0,
  })

  useEffect(() => {
    if (user?.id) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const { count: resumeCount } = await supabase
        .from('resumes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: portfolioCount } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_published', true)

      const { count: coverLetterCount } = await supabase
        .from('cover_letters')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const entitlements = await getUserEntitlements(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_generations_used')
        .eq('id', user.id)
        .single()

      setStats({
        resumes: resumeCount || 0,
        portfolios: portfolioCount || 0,
        coverLetters: coverLetterCount || 0,
        aiUsed: profile?.ai_generations_used || 0,
        aiLimit: entitlements.aiGenerationsPerMonth || 0,
        plan: entitlements.plan || 'free',
        isAdmin: entitlements.isAdmin || false,
        totalPublishSlots: entitlements.totalPublishSlots || 0,
      })
    } catch (e) {
      console.error('Failed to fetch stats:', e)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">Loading...</p>
      </div>
    )
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  const resumeLimitDisplay = stats.isAdmin
    ? '∞'
    : stats.plan === 'free' ? 1 : stats.plan === 'starter' ? 3 : '∞'

  const coverLetterLimitDisplay = stats.isAdmin
    ? '∞'
    : stats.plan === 'free' ? 0 : stats.plan === 'starter' ? 3 : '∞'

  const aiLimitDisplay = stats.isAdmin
    ? '∞'
    : stats.aiLimit === 0 ? 0 : stats.aiLimit

  const statCards = [
    {
      label: 'Resumes',
      value: stats.resumes,
      limit: resumeLimitDisplay,
      suffix: '',
      href: '/dashboard/resumes',
      cta: 'Manage your resumes',
      icon: FileTextIcon,
    },
    {
      label: 'Portfolio',
      value: stats.portfolios,
      limit: stats.isAdmin ? '∞' : stats.totalPublishSlots,
      suffix: 'published',
      href: '/dashboard/portfolios',
      cta: 'Manage your portfolios',
      icon: GlobeIcon,
    },
    {
      label: 'Cover Letters',
      value: stats.coverLetters,
      limit: coverLetterLimitDisplay,
      suffix: '',
      href: '/dashboard/cover-letters',
      cta: 'Manage your cover letters',
      icon: MailIcon,
    },
    {
      label: 'AI Generations',
      value: stats.aiUsed,
      limit: aiLimitDisplay,
      suffix: 'this month',
      href: '/dashboard/ai-tools',
      cta: 'Use AI tools',
      icon: SparklesIcon,
    },
  ]

  const quickActions = [
    {
      title: 'Create a Resume',
      desc: 'Start building your ATS-friendly resume',
      href: '/dashboard/resumes/new',
      icon: FileTextIcon,
    },
    {
      title: 'Build a Portfolio',
      desc: 'Create your professional portfolio website',
      href: '/dashboard/portfolios',
      icon: GlobeIcon,
    },
    {
      title: 'Write a Cover Letter',
      desc: 'Create a tailored cover letter for any job',
      href: '/dashboard/cover-letters/new',
      icon: MailIcon,
    },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Welcome back, {firstName}
        </h1>
        <p className="text-foreground/60">
          Here's an overview of your account.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href} className="block group">
              <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-foreground/60">{card.label}</p>
                  <Icon className="text-foreground/30 group-hover:text-accent/60 transition-colors" />
                </div>
                <p className="text-3xl font-bold tracking-tight mb-3">
                  {card.value}{' '}
                  <span className="text-sm font-normal text-foreground/40">
                    / {card.limit} {card.suffix}
                  </span>
                </p>
                <p className="text-xs text-foreground/40 group-hover:text-accent font-medium flex items-center gap-1 transition-colors">
                  {card.cta}
                  <ArrowRightIcon className="group-hover:translate-x-0.5 transition-transform" />
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href} className="block group">
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 h-full">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent/15 transition-colors">
                    <Icon />
                  </div>
                  <h3 className="font-semibold mb-1 tracking-tight">{action.title}</h3>
                  <p className="text-sm text-foreground/60">{action.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Plan Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <ZapIcon />
          </div>
          <div>
            <p className="text-sm text-foreground/60">Current Plan</p>
            <p className="text-lg font-semibold capitalize tracking-tight">{stats.plan}</p>
          </div>
        </div>
        {stats.plan === 'free' && (
          <Link
            href="/dashboard/billing"
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 text-center"
          >
            Upgrade
          </Link>
        )}
      </div>
    </div>
  )
}