'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

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
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setChecking(false)
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
      icon: '👥',
      title: 'Users',
      description: 'View and manage all users',
      href: '/dashboard/admin/users',
    },
    {
      icon: '📄',
      title: 'Resumes',
      description: 'View all resumes across platform',
      href: '/dashboard/admin/resumes',
    },
    {
      icon: '🌐',
      title: 'Portfolios',
      description: 'View all published portfolios',
      href: '/dashboard/admin/portfolios',
    },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {adminCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer block"
          >
            <div className="text-2xl mb-3">{card.icon}</div>
            <h3 className="font-semibold mb-1">{card.title}</h3>
            <p className="text-sm text-foreground/60">{card.description}</p>
          </Link>
        ))}
      </div>

      <div className="border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Stats</h2>
        <p className="text-sm text-foreground/60">Stats will appear here in the next phase.</p>
      </div>
    </div>
  )
}