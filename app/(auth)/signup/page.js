'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Signup() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Create profile entry
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        first_name: firstName,
        last_name: lastName,
      })
    }

    setLoading(false)
    setSuccess(true)
  }

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
          <p className="text-foreground/60 text-sm mb-6 leading-relaxed">
            We've sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
          </p>
          <Link href="/login" className="text-accent hover:underline font-medium text-sm">
            Back to login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      {/* Left Side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-accent/5 relative flex-col justify-between p-12">
        {/* Background pattern */}
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
            <h1 className="text-2xl font-bold tracking-tight mb-2">Create your account</h1>
            <p className="text-foreground/60 text-sm">Start building your resume and portfolio for free</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 border border-border rounded-xl px-4 py-3 text-sm font-medium hover:border-accent hover:text-accent transition-colors mb-6 bg-card"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-foreground/40 font-medium">or sign up with email</span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Signup Form */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">First name</label>
                <input
                  type="text"
                  placeholder="Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Last name</label>
                <input
                  type="text"
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-card focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors"
              />
            </div>

            <p className="text-xs text-foreground/40 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            </p>

            <button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-foreground/60 mt-8">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:underline font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}