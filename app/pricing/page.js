'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { detectPaymentProviderAsync } from '@/lib/payments/detectProvider'

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

const LIFETIME_PLANS = [
  { key: 'lifetime_1_slot', slots: 1, pricePHP: 499, priceUSD: 9.99, icon: '🌐', name: '1 Portfolio', desc: 'Premium template, live forever' },
  { key: 'lifetime_3_slots', slots: 3, pricePHP: 999, priceUSD: 19.99, icon: '🚀', name: '3 Portfolios', desc: 'Premium templates, live forever' },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const [provider, setProvider] = useState('paymongo')
  const [currency, setCurrency] = useState('PHP')
  const [detecting, setDetecting] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  // User's existing subscriptions/purchases
  const [userPlan, setUserPlan] = useState(null) // 'free', 'starter', 'pro', 'admin'
  const [lifetimeSlotsOwned, setLifetimeSlotsOwned] = useState(0)
  const [loadingUserData, setLoadingUserData] = useState(true)

  // Detect provider + currency on mount
  useEffect(() => {
    let mounted = true

    const runDetection = async () => {
      try {
        const detected = await detectPaymentProviderAsync()
        if (!mounted) return

        if (detected === 'paymongo') {
          setProvider('paymongo')
          setCurrency('PHP')
        } else {
          setProvider('stripe')
          setCurrency('USD')
        }
      } catch (err) {
        console.error('Provider detection failed:', err)
        // Default stays as paymongo/PHP
      } finally {
        if (mounted) setDetecting(false)
      }
    }

    runDetection()
    return () => { mounted = false }
  }, [])

  // Fetch user's existing plan and lifetime slots
  useEffect(() => {
    if (!user) {
      setLoadingUserData(false)
      return
    }

    const loadUserData = async () => {
      try {
        // Check if admin first
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()

        if (profile?.is_admin) {
          setUserPlan('admin')
          setLoadingUserData(false)
          return
        }

        // Check active subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const plan = subscription?.plan || 'free'
        setUserPlan(plan)

        // Check lifetime slots purchased
        const { data: lifetimePayments } = await supabase
          .from('payments')
          .select('slots_purchased')
          .eq('user_id', user.id)
          .eq('payment_type', 'lifetime_slot')
          .eq('status', 'paid')

        const slots = (lifetimePayments || []).reduce(
          (sum, p) => sum + (p.slots_purchased || 0),
          0
        )
        setLifetimeSlotsOwned(slots)
      } catch (err) {
        console.error('Failed to load user billing data:', err)
      } finally {
        setLoadingUserData(false)
      }
    }

    loadUserData()
  }, [user])

  const isUSD = currency === 'USD'

  const startCheckout = async (planKey) => {
    if (!user) {
      router.push('/login')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
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

  // Plan ownership helpers
  const isFree = userPlan === 'free' || userPlan === null
  const isStarter = userPlan === 'starter'
  const isPro = userPlan === 'pro'
  const isAdmin = userPlan === 'admin'

  const lifetime1Owned = lifetimeSlotsOwned >= 1 || isAdmin
  const lifetime3Owned = lifetimeSlotsOwned >= 3 || isAdmin

  const formatPrice = (php, usd) => {
    if (isUSD) return `$${usd.toFixed(2)}`
    return `₱${php.toLocaleString()}`
  }

  // Helper to render a plan card
  const renderPlanCard = (key, plan, isCurrent, isDisabled) => {
    const price = isUSD
      ? (annual ? plan.annualPriceUSD : plan.monthlyPriceUSD)
      : (annual ? plan.annualPrice : plan.monthlyPrice)
    const planKey = annual ? plan.annualKey : plan.monthlyKey
    const isStarter = key === 'starter'

    return (
      <div
        key={key}
        className={`rounded-xl p-8 flex flex-col relative ${
          isCurrent
            ? 'border-2 border-accent bg-accent/5'
            : isDisabled
            ? 'border border-border bg-muted/30 opacity-60'
            : isStarter
            ? 'border-2 border-accent'
            : 'border border-border'
        }`}
      >
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">
            Current Plan
          </div>
        )}
        {isStarter && !isCurrent && !isDisabled && (
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
        {isCurrent ? (
          <button
            disabled
            className="w-full bg-muted text-foreground/40 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Current Plan
          </button>
        ) : isDisabled ? (
          <button
            disabled
            className="w-full bg-muted text-foreground/40 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
          >
            {isAdmin ? 'Admin — Unlimited' : 'Not Available'}
          </button>
        ) : (
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
        )}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-foreground/60 text-lg">
          Start for free. Upgrade when you need more.
        </p>

        {/* Currency Toggle + Monthly/Annual Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          {/* Currency Toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-full p-1">
            <button
              onClick={() => { setCurrency('PHP'); setProvider('paymongo') }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currency === 'PHP' ? 'bg-background shadow-sm' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              PHP ₱
            </button>
            <button
              onClick={() => { setCurrency('USD'); setProvider('stripe') }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currency === 'USD' ? 'bg-background shadow-sm' : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              USD $
            </button>
          </div>

          {/* Monthly/Annual Toggle */}
          <div className="flex items-center gap-3">
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
        </div>

        {/* Detection status */}
        {detecting && (
          <p className="text-xs text-foreground/40 mt-3">Detecting your region...</p>
        )}
      </section>

      {/* Pricing Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Free */}
          {renderPlanCard('free', {
            name: 'Free',
            tagline: 'Perfect for getting started',
            monthlyPrice: 0,
            annualPrice: 0,
            monthlyPriceUSD: 0,
            annualPriceUSD: 0,
            features: [
              '1 resume',
              '1 resume template of your choice',
              'Unlimited downloads',
              'Build portfolios (all 9 templates)',
              'Publishing requires an upgrade',
            ],
          }, isFree, !isFree)}

          {/* Starter */}
          {renderPlanCard('starter', PLANS.starter, isStarter, isPro || isAdmin)}

          {/* Pro */}
          {renderPlanCard('pro', PLANS.pro, isPro, isAdmin)}

        </div>

        {/* One-time Payment Section */}
        <div className="mt-16 border border-border rounded-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Just need a portfolio?</h2>
            <p className="text-foreground/60 text-sm">
              One-time payment. No subscription. Yours forever.
            </p>
            {lifetimeSlotsOwned > 0 && (
              <p className="text-accent text-sm mt-2 font-medium">
                You already own {lifetimeSlotsOwned} lifetime slot{lifetimeSlotsOwned === 1 ? '' : 's'}.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {LIFETIME_PLANS.map((lt) => {
              const isOwned = lt.slots === 1 ? lifetime1Owned : lifetime3Owned
              const price = isUSD ? lt.priceUSD : lt.pricePHP

              return (
                <div
                  key={lt.key}
                  className={`border rounded-xl p-6 text-center transition-colors ${
                    isOwned
                      ? 'border-border bg-muted/30 opacity-60'
                      : 'border-border hover:border-accent'
                  }`}
                >
                  <div className="text-3xl mb-3">{lt.icon}</div>
                  <h3 className="font-semibold mb-1">{lt.name}</h3>
                  <p className="text-foreground/60 text-sm mb-4">{lt.desc}</p>
                  <div className="text-3xl font-bold mb-4">
                    {isUSD ? `$${price.toFixed(2)}` : `₱${price.toLocaleString()}`}
                  </div>
                  {isOwned ? (
                    <button
                      disabled
                      className="w-full bg-muted text-foreground/40 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      {isAdmin ? 'Admin — Unlimited' : 'Already Owned'}
                    </button>
                  ) : (
                    <button
                      onClick={() => startCheckout(lt.key)}
                      className="w-full bg-accent text-white py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              )
            })}

          </div>
        </div>

      </section>

      <Footer />
    </main>
  )
}