'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

// SVG Icons
const ArrowLeftIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const MailIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function AdminCoverLetters() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [coverLetters, setCoverLetters] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
      fetchCoverLetters()
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  const fetchCoverLetters = async () => {
    try {
      // Try API endpoint first, fallback to direct query
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (token) {
        try {
          const response = await fetch('/api/admin/cover-letters', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (response.ok) {
            const result = await response.json()
            setCoverLetters(result.coverLetters || [])
            setLoading(false)
            return
          }
        } catch (e) {
          // API doesn't exist, fall through to direct query
        }
      }

      // Direct Supabase query with profiles join
      const { data, error } = await supabase
        .from('cover_letters')
        .select(`
          id,
          title,
          template,
          created_at,
          updated_at,
          user_id,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCoverLetters(data || [])
    } catch (e) {
      console.error('Failed to fetch cover letters:', e)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', deleteTarget.id)

      if (error) throw error
      setCoverLetters(coverLetters.filter(c => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      console.error('Failed to delete cover letter:', e)
      alert('Failed to delete cover letter')
    } finally {
      setDeleting(false)
    }
  }

  const filteredCoverLetters = coverLetters.filter(c => {
    const searchLower = search.toLowerCase()
    const ownerName = `${c.profiles?.first_name || ''} ${c.profiles?.last_name || ''}`.toLowerCase()
    return (
      c.title?.toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower) ||
      c.profiles?.email?.toLowerCase().includes(searchLower)
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <MailIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cover Letters</h1>
            <p className="text-sm text-foreground/60">All cover letters across the platform</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/dashboard/admin')}
          className="inline-flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
        >
          <ArrowLeftIcon />
          Back to Admin
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/30" />
        <input
          type="text"
          placeholder="Search by title, owner name, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Template</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoverLetters.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.title || 'Untitled'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.profiles?.first_name} {c.profiles?.last_name}</div>
                    <div className="text-foreground/50 text-xs">{c.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/50 capitalize text-xs">
                    {c.template?.replace(/-/g, ' ') || 'Default'}
                  </td>
                  <td className="px-4 py-3 text-foreground/50 text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteTarget(c)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <TrashIcon />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      <div className="mt-4 text-sm text-foreground/50">
        Showing {filteredCoverLetters.length} of {coverLetters.length} cover letters
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Delete cover letter?</h3>
            <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
              This will permanently delete "{deleteTarget.title || 'Untitled'}". This can't be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-500 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Cover Letter'}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="text-foreground/60 text-sm font-medium py-2.5 hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}