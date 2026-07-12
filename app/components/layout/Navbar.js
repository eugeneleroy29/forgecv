'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const [firstName, setFirstName] = useState('')
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  useEffect(() => {
    if (!user) {
      setFirstName('')
      return
    }
    supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setFirstName(data?.first_name || ''))
  }, [user])

  return (
    <nav className="border-b border-border px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-accent font-bold text-xl tracking-tight">
          ForgeCV
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/templates" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Templates
          </Link>
          {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                  Hi, {firstName || user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-4 px-2 pb-4 border-t border-border pt-4">
          <Link href="/pricing" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/templates" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Templates
          </Link>
          {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
                  Hi, {firstName || user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-foreground/60 hover:text-foreground transition-colors text-left"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-center">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        )}
    </nav>
  )
}