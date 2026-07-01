'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

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
          <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
            Get Started Free
          </Link>
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
          <Link href="/login" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-center">
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  )
}