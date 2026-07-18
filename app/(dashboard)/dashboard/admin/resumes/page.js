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

const FileTextIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function AdminResumes() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [resumes, setResumes] = useState([])
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
      fetchResumes()
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  const fetchResumes = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/admin/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      setResumes(result.resumes || [])
    } catch (e) {
      console.error('Failed to fetch resumes:', e)
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', deleteTarget.id)

      if (error) throw error
      setResumes(resumes.filter(r => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (e) {
      console.error('Failed to delete resume:', e)
      alert('Failed to delete resume')
    } finally {
      setDeleting(false)
    }
  }

  const filteredResumes = resumes.filter(r => {
    const searchLower = search.toLowerCase()
    const ownerName = `${r.profiles?.first_name || ''} ${r.profiles?.last_name || ''}`.toLowerCase()
    return (
      r.title?.toLowerCase().includes(searchLower) ||
      ownerName.includes(searchLower) ||
      r.profiles?.email?.toLowerCase().includes(searchLower)
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
            <FileTextIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resumes</h1>
            <p className="text-sm text-foreground/60">All resumes across the platform</p>
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
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResumes.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.title || 'Untitled'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.profiles?.first_name} {r.profiles?.last_name}</div>
                    <div className="text-foreground/50 text-xs">{r.profiles?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground/50 capitalize text-xs">
                    {r.template?.replace(/-/g, ' ') || 'Default'}
                  </td>
                  <td className="px-4 py-3">
                    {r.is_active ? (
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground/50">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground/50 text-xs">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteTarget(r)}
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
        Showing {filteredResumes.length} of {resumes.length} resumes
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <TrashIcon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold tracking-tight mb-2">Delete resume?</h3>
            <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
              This will permanently delete "{deleteTarget.title || 'Untitled'}". This can't be undone.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-500 text-white text-center py-3 rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Resume'}
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