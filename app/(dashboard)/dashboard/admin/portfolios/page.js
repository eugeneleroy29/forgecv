'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function AdminPortfolios() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
      fetchPortfolios()
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  const fetchPortfolios = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/admin/portfolios', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      setPortfolios(result.portfolios || [])
    } catch (e) {
      console.error('Failed to fetch portfolios:', e)
    } finally {
      setLoading(false)
    }
  }

  const deletePortfolio = async (portfolioId) => {
    if (!confirm('Are you sure you want to delete this portfolio? This cannot be undone.')) return
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId)

      if (error) throw error
      setPortfolios(portfolios.filter(p => p.id !== portfolioId))
    } catch (e) {
      console.error('Failed to delete portfolio:', e)
      alert('Failed to delete portfolio')
    }
  }

  const filteredPortfolios = portfolios.filter(p => {
    const searchLower = search.toLowerCase()
    const ownerName = `${p.profiles?.first_name || ''} ${p.profiles?.last_name || ''}`.toLowerCase()
    return (
      p.slug?.toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower) ||
      p.profiles?.email?.toLowerCase().includes(searchLower)
    )
  })

  if (authLoading || checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-foreground/60">Loading...</p>
      </div>
    )
  }

  if (!isAdmin) return null

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Portfolios</h1>
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          Back to Admin
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by slug, owner name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Owner</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Theme</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Status</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Created</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPortfolios.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-background/50">
                <td className="px-4 py-3 font-medium">{p.slug || 'Untitled'}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.profiles?.first_name} {p.profiles?.last_name}</div>
                  <div className="text-foreground/60 text-xs">{p.profiles?.email}</div>
                </td>
                <td className="px-4 py-3 text-foreground/60 capitalize">
                  {p.template?.replace(/-/g, ' ') || 'Default'}
                </td>
                <td className="px-4 py-3">
                  {p.is_published ? (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => deletePortfolio(p.id)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-foreground/60">
        Showing {filteredPortfolios.length} of {portfolios.length} portfolios
      </div>
    </div>
  )
}