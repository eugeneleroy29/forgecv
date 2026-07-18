'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

// SVG Icons
const UsersIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

const ShieldIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const TrendingUpIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    resumes: 0,
    portfolios: 0,
    coverLetters: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
      return
    }

    if (user?.id) {
      checkAdmin()
    }
  }, [user, authLoading])

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error || !data?.is_admin) {
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
      fetchStats()
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [{ count: userCount }, { count: resumeCount }, { count: portfolioCount }, { count: coverLetterCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('resumes').select('*', { count: 'exact', head: true }),
        supabase.from('portfolios').select('*', { count: 'exact', head: true }),
        supabase.from('cover_letters').select('*', { count: 'exact', head: true }),
      ])

      setStats({
        users: userCount || 0,
        resumes: resumeCount || 0,
        portfolios: portfolioCount || 0,
        coverLetters: coverLetterCount || 0,
      })
    } catch (e) {
      console.error('Failed to fetch admin stats:', e)
    }
  }

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">Checking admin access...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  const adminCards = [
    {
      icon: UsersIcon,
      title: 'Users',
      description: 'View and manage all users',
      href: '/dashboard/admin/users',
      count: stats.users,
    },
    {
      icon: FileTextIcon,
      title: 'Resumes',
      description: 'View all resumes across platform',
      href: '/dashboard/admin/resumes',
      count: stats.resumes,
    },
    {
      icon: GlobeIcon,
      title: 'Portfolios',
      description: 'View all published portfolios',
      href: '/dashboard/admin/portfolios',
      count: stats.portfolios,
    },
    {
      icon: MailIcon,
      title: 'Cover Letters',
      description: 'View all cover letters across platform',
      href: '/dashboard/admin/cover-letters',
      count: stats.coverLetters,
    },
  ]

  const quickStats = [
    { label: 'Total Users', value: stats.users, icon: UsersIcon },
    { label: 'Total Resumes', value: stats.resumes, icon: FileTextIcon },
    { label: 'Total Portfolios', value: stats.portfolios, icon: GlobeIcon },
    { label: 'Total Cover Letters', value: stats.coverLetters, icon: MailIcon },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <ShieldIcon />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-foreground/60">Platform overview and management</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
        {quickStats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="text-foreground/30" />
                <TrendingUpIcon className="text-foreground/20 w-4 h-4" />
              </div>
              <p className="text-2xl font-bold tracking-tight mb-1">{stat.value}</p>
              <p className="text-xs text-foreground/50 font-medium">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Management Cards */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold mb-4 tracking-tight">Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="block group"
              >
                <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 hover:-translate-y-0.5 transition-all duration-300 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/15 transition-colors">
                      <Icon />
                    </div>
                    <span className="text-lg font-bold text-foreground/30 group-hover:text-accent/40 transition-colors">
                      {card.count}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1 tracking-tight">{card.title}</h3>
                  <p className="text-sm text-foreground/60 mb-4">{card.description}</p>
                  <p className="text-xs text-foreground/40 group-hover:text-accent font-medium flex items-center gap-1 transition-colors">
                    Manage
                    <ArrowRightIcon className="group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}