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
    <main className="min-h-screen bg-background text-foreground flex">
      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent/5 relative flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <Link href="/" className="text-accent font-bold text-2xl tracking-tight">
            ForgeCV
          </Link>
        </div>

        <div className="relative">
          <blockquote className="text-xl font-medium leading-relaxed text-foreground/80 mb-6 max-w-md">
            "I landed three interviews within a week of updating my resume with ForgeCV. The ATS-friendly template made all the difference."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              MS
            </div>
            <div>
              <p className="font-semibold text-sm">Maria Santos</p>
              <p className="text-xs text-foreground/50">Medical Virtual Assistant</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} ForgeCV. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="text-accent font-bold text-2xl tracking-tight">
              ForgeCV
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Set a new password</h1>
            <p className="text-foreground/60 text-sm">Choose a new password for your account.</p>
          </div>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Password updated. Redirecting you to log in...
            </div>
          ) : !sessionReady ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Verifying your reset link... if this doesn't resolve, the link may have expired.
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}