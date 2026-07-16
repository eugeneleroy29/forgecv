'use client'

import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Settings() {
  const { user } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const isGoogleUser = user?.app_metadata?.provider === 'google'

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully.' })
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Account Info */}
      <div className="border border-border rounded-xl p-8 mb-8">
        <h2 className="text-lg font-semibold mb-4">Account</h2>
        <div className="mb-4">
          <p className="text-sm text-foreground/60 mb-1">Email</p>
          <p className="text-sm font-medium">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm text-foreground/60 mb-1">Sign-in method</p>
          <p className="text-sm font-medium">
            {isGoogleUser ? 'Google' : 'Email & Password'}
          </p>
        </div>
      </div>

      {/* Change Password */}
      {!isGoogleUser && (
        <div className="border border-border rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-1">Change Password</h2>
          <p className="text-foreground/60 text-sm mb-6">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md sm:max-w-sm">
            <div>
              <label className="text-sm font-medium mb-1.5 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 w-fit"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
