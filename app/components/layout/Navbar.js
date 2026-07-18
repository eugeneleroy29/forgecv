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
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-accent font-bold text-xl tracking-tight hover:opacity-80 transition-opacity"
        >
          ForgeCV
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/pricing" 
            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            Pricing
          </Link>
          <Link 
            href="/templates" 
            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            Templates
          </Link>
          
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                {firstName || user.email?.split('@')[0]}
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="text-sm font-semibold bg-accent text-white px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-colors"
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg 
            className="w-5 h-5 text-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4">
          <div className="flex flex-col gap-4">
            <Link 
              href="/pricing" 
              className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/templates" 
              className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors py-2"
              onClick={() => setMenuOpen(false)}
            >
              Templates
            </Link>
            
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {firstName || user.email?.split('@')[0]}
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); handleSignOut(); }}
                  className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors text-left py-2"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  className="text-sm font-semibold bg-accent text-white px-5 py-2.5 rounded-xl hover:bg-accent-hover transition-colors text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}