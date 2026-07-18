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

const UsersIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PencilIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const BanIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ShieldIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export default function AdminUsers() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)

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
      fetchUsers()
    } catch (e) {
      router.push('/dashboard')
    } finally {
      setChecking(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          subscription_tier,
          subscription_status,
          ai_generations_used,
          ai_generations_reset_date,
          portfolio_slots,
          created_at,
          is_admin,
          is_banned
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      setUsers(data || [])
    } catch (e) {
      console.error('Failed to fetch users:', e)
    } finally {
      setLoading(false)
    }
  }

  const toggleBan = async (userId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentStatus })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u =>
        u.id === userId ? { ...u, is_banned: !currentStatus } : u
      ))
    } catch (e) {
      console.error('Failed to toggle ban:', e)
      alert('Failed to update user status')
    }
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setEditForm({
      subscription_tier: user.subscription_tier || 'free',
      subscription_status: user.subscription_status || 'active',
      ai_generations_used: user.ai_generations_used || 0,
      portfolio_slots: user.portfolio_slots || 1,
      is_admin: user.is_admin || false,
    })
  }

  const closeEditModal = () => {
    setEditingUser(null)
    setEditForm({})
  }

  const saveUserChanges = async () => {
    if (!editingUser) return
    setSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      if (!token) {
        alert('Session expired. Please log in again.')
        return
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: editingUser.id,
          updates: editForm,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update user')
      }

      setUsers(users.map(u =>
        u.id === editingUser.id ? { ...u, ...editForm } : u
      ))
      closeEditModal()
    } catch (e) {
      console.error('Failed to save user changes:', e)
      alert(e.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const searchLower = search.toLowerCase()
    return (
      u.email?.toLowerCase().includes(searchLower) ||
      u.first_name?.toLowerCase().includes(searchLower) ||
      u.last_name?.toLowerCase().includes(searchLower)
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

  const getPlanBadge = (tier) => {
    switch (tier) {
      case 'pro':
        return 'bg-accent/10 text-accent'
      case 'starter':
        return 'bg-blue-50 text-blue-600'
      default:
        return 'bg-muted text-foreground/50'
    }
  }

  const getStatusBadge = (u) => {
    if (u.is_banned) return { text: 'Banned', class: 'bg-red-50 text-red-600' }
    if (u.is_admin) return { text: 'Admin', class: 'bg-accent/10 text-accent' }
    return { text: 'Active', class: 'bg-emerald-50 text-emerald-600' }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <UsersIcon />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="text-sm text-foreground/60">Manage all platform users</p>
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
          placeholder="Search by email or name..."
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
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">AI Used</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-foreground/50 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const status = getStatusBadge(u)
                return (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.first_name} {u.last_name}</div>
                      <div className="text-foreground/50 text-xs">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPlanBadge(u.subscription_tier)}`}>
                        {u.subscription_tier || 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/60 font-mono text-xs">
                      {u.ai_generations_used || 0}
                    </td>
                    <td className="px-4 py-3 text-foreground/50 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                        >
                          <PencilIcon />
                          Edit
                        </button>
                        <button
                          onClick={() => toggleBan(u.id, u.is_banned)}
                          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            u.is_banned
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          {u.is_banned ? <CheckIcon /> : <BanIcon />}
                          {u.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count */}
      <div className="mt-4 text-sm text-foreground/50">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <PencilIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Edit User</h3>
                <p className="text-foreground/50 text-sm">{editingUser.email}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Plan Tier</label>
                <select
                  value={editForm.subscription_tier}
                  onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Subscription Status</label>
                <select
                  value={editForm.subscription_status}
                  onChange={(e) => setEditForm({ ...editForm, subscription_status: e.target.value })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="canceled">Canceled</option>
                  <option value="past_due">Past Due</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">AI Generations Used</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.ai_generations_used}
                  onChange={(e) => setEditForm({ ...editForm, ai_generations_used: parseInt(e.target.value) || 0 })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Portfolio Slots</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.portfolio_slots}
                  onChange={(e) => setEditForm({ ...editForm, portfolio_slots: parseInt(e.target.value) || 0 })}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-background focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent"
                />
                <label htmlFor="is_admin" className="text-sm font-medium flex items-center gap-1.5">
                  <ShieldIcon />
                  Grant Admin Access
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={saveUserChanges}
                disabled={saving}
                className="bg-accent text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={closeEditModal}
                className="text-foreground/60 hover:text-foreground text-sm font-medium py-2.5 transition-colors"
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