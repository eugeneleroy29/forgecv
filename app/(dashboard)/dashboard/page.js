'use client'

import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getUserEntitlements } from '@/lib/entitlements'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({ 
    resumes: 0, 
    portfolios: 0, 
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

      const entitlements = await getUserEntitlements(user.id)
      const { data: profile } = await supabase
        .from('profiles')
        .select('ai_generations_used')
        .eq('id', user.id)
        .single()

      setStats({
        resumes: resumeCount || 0,
        portfolios: portfolioCount || 0,
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
  
  const aiLimitDisplay = stats.isAdmin 
    ? '∞' 
    : stats.aiLimit === 0 ? 0 : stats.aiLimit

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-1">
        Welcome back, {firstName}! 👋
      </h1>
      <p className="text-foreground/60 mb-8">
        Here's an overview of your account.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/resumes" className="block group">
          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer h-full">
            <p className="text-sm text-foreground/60 mb-1">Resumes</p>
            <p className="text-3xl font-bold">
              {stats.resumes} <span className="text-sm font-normal text-foreground/40">/ {resumeLimitDisplay}</span>
            </p>
            <p className="text-xs text-foreground/40 mt-2 group-hover:text-accent transition-colors">
              Manage your resumes →
            </p>
          </div>
        </Link>

        <Link href="/dashboard/portfolios" className="block group">
          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer h-full">
            <p className="text-sm text-foreground/60 mb-1">Portfolio</p>
            <p className="text-3xl font-bold">
              {stats.portfolios} <span className="text-sm font-normal text-foreground/40">/ {stats.isAdmin ? '∞' : stats.totalPublishSlots} published</span>
            </p>
            <p className="text-xs text-foreground/40 mt-2 group-hover:text-accent transition-colors">
              Manage your portfolios →
            </p>
          </div>
        </Link>

        <Link href="/dashboard/ai-tools" className="block group">
          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer h-full">
            <p className="text-sm text-foreground/60 mb-1">AI Generations</p>
            <p className="text-3xl font-bold">
              {stats.aiUsed} <span className="text-sm font-normal text-foreground/40">/ {aiLimitDisplay} this month</span>
            </p>
            <p className="text-xs text-foreground/40 mt-2 group-hover:text-accent transition-colors">
              Use AI tools →
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/resumes/new" className="block">
          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer h-full">
            <div className="text-2xl mb-3">📄</div>
            <h3 className="font-semibold mb-1">Create a Resume</h3>
            <p className="text-sm text-foreground/60">Start building your ATS-friendly resume</p>
          </div>
        </Link>

        <Link href="/dashboard/portfolios" className="block">
          <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer h-full">
            <div className="text-2xl mb-3">🌐</div>
            <h3 className="font-semibold mb-1">Build a Portfolio</h3>
            <p className="text-sm text-foreground/60">Create your professional portfolio website</p>
          </div>
        </Link>
      </div>

      {/* Plan Banner */}
      <div className="mt-8 border border-border rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-foreground/60 mb-1">Current Plan</p>
          <p className="text-lg font-semibold capitalize">{stats.plan}</p>
        </div>
        {stats.plan === 'free' && (
          <Link 
            href="/dashboard/billing" 
            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Upgrade
          </Link>
        )}
      </div>
    </div>
  )
}