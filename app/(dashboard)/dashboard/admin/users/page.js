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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-foreground/60">
        Showing {filteredUsers.length} of {users.length} users
      </div>
    </div>
  )
}
