'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

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

  return (
    <div className="px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer">
          <div className="text-2xl mb-3">Users</div>
          <h3 className="font-semibold mb-1">Users</h3>
          <p className="text-sm text-foreground/60">View and manage all users</p>
        </div>
        <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer">
          <div className="text-2xl mb-3">Resumes</div>
          <h3 className="font-semibold mb-1">Resumes</h3>
          <p className="text-sm text-foreground/60">View all resumes across platform</p>
        </div>
        <div className="border border-border rounded-xl p-6 hover:border-accent transition-colors cursor-pointer">
          <div className="text-2xl mb-3">Portfolios</div>
          <h3 className="font-semibold mb-1">Portfolios</h3>
          <p className="text-sm text-foreground/60">View all published portfolios</p>
        </div>
      </div>

      <div className="border border-border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Stats</h2>
        <p className="text-sm text-foreground/60">Stats will appear here in the next phase.</p>
      </div>
    </div>
  )
}
