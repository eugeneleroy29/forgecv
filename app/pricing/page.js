'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { detectPaymentProvider } from '@/lib/payments/detectProvider'

const PLANS = {
  starter: {
    name: 'Starter',
    tagline: 'For active job seekers',
    monthlyPrice: 149,
    annualPrice: 1490,
    monthlyPriceUSD: 2.99,
    annualPriceUSD: 29.99,
    monthlyKey: 'starter_monthly',
    annualKey: 'starter_annual',
    features: [
      '3 resumes',
      'All resume templates (up to 3 in use)',
      'Unlimited downloads',
      '1 portfolio publish slot',
      'All premium portfolio templates',
      'Custom portfolio sections',
      '30 AI generations/month',
      'Professional Summary AI',
      'ATS Score Checker',
      'Skills Suggester',
      'Job Description Optimizer',
      'Portfolio Bio Generator',
    ],
  },
  pro: {
    name: 'Pro',
    tagline: 'For serious professionals',
    monthlyPrice: 299,
    annualPrice: 2990,
    monthlyPriceUSD: 5.99,
    annualPriceUSD: 59.99,
    monthlyKey: 'pro_monthly',
    annualKey: 'pro_annual',
    features: [
      'Unlimited resumes',
      'All resume templates, unlimited use',
      'Unlimited downloads',
      '3 portfolio publish slots',
      'All premium portfolio templates',
      'Custom portfolio sections',
      'Portfolio analytics',
      '60 AI generations/month',
      'Professional Summary AI',
      'ATS Score Checker',
      'Skills Suggester',
      'Job Description Optimizer',
      'Portfolio Bio Generator',
      'Priority support',
    ],
  },
}

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [provider, setProvider] = useState('paymongo')
  const isUSD = provider === 'stripe'
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setProvider(detectPaymentProvider())
  }, [])

  const startCheckout = async (planKey) => {
    if (!user) {
      router.push('/login')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    const provider = detectPaymentProvider()

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ provider, planKey }),
    })

    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      console.error('Checkout failed:', data.error)
      alert('Something went wrong starting checkout. Please try again.')
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-foreground/60 text-lg">
          Start for free. Upgrade when you need more.
        </p>

        {/* Monthly/Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm font-medium ${!annual ? '' : 'text-foreground/60'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="w-12 h-6 bg-accent rounded-full relative cursor-pointer"
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                annual ? 'right-0.5' : 'left-0.5'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? '' : 'text-foreground/60'}`}>Annual</span>
          <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full font-medium">
            Save 17%
          </span>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Free */}
          <div className="border border-border rounded-xl p-8 flex flex-col">
            <h2 className="text-lg font-semibold mb-1">Free</h2>
            <p className="text-foreground/60 text-sm mb-6">Perfect for getting started</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">{isUSD ? '$0' : '₱0'}</span>
              <span className="text-foreground/60 text-sm"> / forever</span>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {[
                '1 resume',
                '1 resume template of your choice',
                'Unlimited downloads',
                'Build portfolios (all 9 templates)',
                'Publishing requires an upgrade',
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <span className="text-accent">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push(user ? '/dashboard' : '/signup')}
              className="w-full border border-border text-foreground py-2.5 rounded-lg text-sm font-medium hover:border-accent hover:text-accent transition-colors"
            >
              Get Started Free
            </button>
          </div>

          {/* Starter & Pro */}
          {['starter', 'pro'].map((key) => {
            const plan = PLANS[key]
            const price = isUSD
              ? (annual ? plan.annualPriceUSD : plan.monthlyPriceUSD)
              : (annual ? plan.annualPrice : plan.monthlyPrice)
            const planKey = annual ? plan.annualKey : plan.monthlyKey
            const isStarter = key === 'starter'

            return (
              <div
                key={key}
                className={`rounded-xl p-8 flex flex-col relative ${
                  isStarter ? 'border-2 border-accent' : 'border border-border'
                }`}
              >
                {isStarter && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">
                    Most Popular
                  </div>
                )}
                <h2 className="text-lg font-semibold mb-1">{plan.name}</h2>
                <p className="text-foreground/60 text-sm mb-6">{plan.tagline}</p>
                <div className="mb-6">
                <span className="text-4xl font-bold">
                    {isUSD ? `$${price.toFixed(2)}` : `₱${price.toLocaleString()}`}
                  </span>
                  <span className="text-foreground/60 text-sm"> / {annual ? 'year' : 'month'}</span>
                </div>
                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <span className="text-accent">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => startCheckout(planKey)}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isStarter
                      ? 'bg-accent text-white hover:bg-accent-hover'
                      : 'border border-border text-foreground hover:border-accent hover:text-accent'
                  }`}
                >
                  Get Started
                </button>
              </div>
            )
          })}
        </div>

        {/* One-time Payment Section */}
        <div className="mt-16 border border-border rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Just need a portfolio?</h2>
            <p className="text-foreground/60 text-sm">
              One-time payment. No subscription. Yours forever.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            <div className="border border-border rounded-xl p-6 text-center hover:border-accent transition-colors">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="font-semibold mb-1">1 Portfolio</h3>
              <p className="text-foreground/60 text-sm mb-4">Premium template, live forever</p>
              <div className="text-3xl font-bold mb-4">{isUSD ? '$9.99' : '₱499'}</div>
              <button
                onClick={() => startCheckout('lifetime_1_slot')}
                className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Buy Now
              </button>
            </div>

            <div className="border border-border rounded-xl p-6 text-center hover:border-accent transition-colors">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold mb-1">3 Portfolios</h3>
              <p className="text-foreground/60 text-sm mb-4">Premium templates, live forever</p>
              <div className="text-3xl font-bold mb-4">{isUSD ? '$19.99' : '₱999'}</div>
              <button
                onClick={() => startCheckout('lifetime_3_slots')}
                className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
              >
                Buy Now
              </button>
            </div>

          </div>
        </div>

      </section>

      <Footer />
    </main>
  )
}