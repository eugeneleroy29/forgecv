'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPassword() {
  const router = useRouter()
  const [sessionReady, setSessionReady] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async () => {
    setError('')

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-accent font-bold text-2xl tracking-tight">
            ForgeCV
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Set a new password</h1>
          <p className="text-foreground/60 text-sm">Choose a new password for your account.</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            Password updated. Redirecting you to log in...
          </div>
        ) : !sessionReady ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-3 rounded-lg mb-4">
            Verifying your reset link... if this doesn't resolve, the link may have expired. Please request a new one.
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">New Password</label>
                <input
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-accent text-white py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  )
}
