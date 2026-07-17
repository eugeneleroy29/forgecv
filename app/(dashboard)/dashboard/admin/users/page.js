'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

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
          is_admin
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

      // Update local state
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

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
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
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-background/50">
              <th className="text-left px-4 py-3 font-medium text-foreground/60">User</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">AI Used</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Status</th>
              <th className="text-left px-4 py-3 font-medium text-foreground/60">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id} className="border-b border-border last:border-0 hover:bg-background/50">
                <td className="px-4 py-3">
                  <div className="font-medium">{u.first_name} {u.last_name}</div>
                  <div className="text-foreground/60 text-xs">{u.email}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    u.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-700' :
                    u.subscription_tier === 'starter' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {u.subscription_tier || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {u.ai_generations_used || 0}
                </td>
                <td className="px-4 py-3 text-foreground/60">
                  {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  {u.is_banned ? (
                    <span className="text-red-600 text-xs font-medium">Banned</span>
                  ) : u.is_admin ? (
                    <span className="text-accent text-xs font-medium">Admin</span>
                  ) : (
                    <span className="text-green-600 text-xs font-medium">Active</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="text-xs px-3 py-1.5 rounded-lg font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleBan(u.id, u.is_banned)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        u.is_banned
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {u.is_banned ? 'Unban' : 'Ban'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-foreground/60">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-background border border-border rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Edit User</h3>
            <p className="text-foreground/60 text-sm mb-6">
              {editingUser.email}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Plan Tier</label>
                <select
                  value={editForm.subscription_tier}
                  onChange={(e) => setEditForm({ ...editForm, subscription_tier: e.target.value })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent"
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
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent"
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
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Portfolio Slots</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.portfolio_slots}
                  onChange={(e) => setEditForm({ ...editForm, portfolio_slots: parseInt(e.target.value) || 0 })}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                  className="w-4 h-4 rounded border-border accent-accent"
                />
                <label htmlFor="is_admin" className="text-sm font-medium">Admin Access</label>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={saveUserChanges}
                disabled={saving}
                className="bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={closeEditModal}
                className="text-foreground/60 hover:text-foreground text-sm py-2"
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
