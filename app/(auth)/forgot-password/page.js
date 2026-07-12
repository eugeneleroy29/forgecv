'use client'

import Link from 'next/link'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    setError('')
    setLoading(true)

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    // Always show the same success message regardless of whether the email
    // exists in the system, so we don't leak which emails are registered.
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-accent font-bold text-2xl tracking-tight">
            ForgeCV
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">Reset your password</h1>
          <p className="text-foreground/60 text-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-4">
            If an account exists for that email, a password reset link is on its way. Check your inbox.
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
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-border rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-accent text-white py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-foreground/60 mt-6">
          Remember your password?{' '}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Log in
          </Link>
        </p>

      </div>
    </main>
  )
}
