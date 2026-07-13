'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { Mail } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Support() {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Support</h1>
        <p className="text-lg text-foreground/60">
          Have a question or run into an issue? We are here to help.
        </p>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-16">
        <div className="border border-border rounded-xl p-8 text-center">
          <Mail className="w-8 h-8 text-accent mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Email us</h2>
          <p className="text-foreground/60 mb-6">
            Send us a message and we will get back to you, typically within 24 hours.
          </p>
          <a href="mailto:support@forgecv.com"
            className="inline-block bg-accent text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
          >
            support@forgecv.com
          </a>
        </div>

        <p className="text-center text-sm text-foreground/60 mt-8">
          Looking for a quick answer? Check out our{' '}
          <a href="/faq" className="text-accent hover:underline">
            FAQ page
          </a>{' '}
          for common questions about plans, payments, and features.
        </p>
      </section>

      <section className="max-w-2xl mx-auto px-6 pb-24 text-center">
        <button
          onClick={() => router.push(user ? '/dashboard' : '/signup')}
          className="bg-accent text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {user ? 'Go to Dashboard' : 'Get Started Free'}
        </button>
      </section>

      <Footer />
    </main>
  )
}
