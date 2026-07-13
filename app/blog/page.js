'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { PenLine } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Blog() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <PenLine className="w-10 h-10 text-accent mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Blog coming soon</h1>
        <p className="text-lg text-foreground/60 mb-10">
          We are working on resume tips, career advice, and guides for remote workers and virtual assistants. Check back soon.
        </p>
        <button
          onClick={() => router.push(user ? '/dashboard' : '/')}
          className="bg-accent text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {user ? 'Go to Dashboard' : 'Back to Home'}
        </button>
      </section>

      <Footer />
    </main>
  )
}
