'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

// SVG Icons
const ZapIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const CreditCardIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const AlertTriangleIcon = ({ className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const RefreshIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const PLAN_LABELS = {
  starter: { name: 'Starter', monthly: 149, annual: 1490 },
  pro: { name: 'Pro', monthly: 299, annual: 2990 },
}

function formatAmount(amountMinorUnits, currency) {
  const amount = (amountMinorUnits || 0) / 100
  const symbol = (currency || '').toUpperCase() === 'USD' ? '$' : '₱'
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateString) {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  past_due: 'bg-amber-50 text-amber-600 border-amber-200',
  canceled: 'bg-red-50 text-red-600 border-red-200',
  expired: 'bg-red-50 text-red-600 border-red-200',
  cancelling: 'bg-amber-50 text-amber-600 border-amber-200',
}

export default function Billing() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [renewing, setRenewing] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState(null)

  useEffect(() => {
    if (!user) return

    const loadBillingData = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (profile?.is_admin) {
        setSubscription({ plan: 'admin', status: 'active', isAdmin: true })
        setPayments([])
        setLoading(false)
        return
      }

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('plan, billing_cycle, renewal_type, status, provider, current_period_end, cancel_at_period_end, provider_subscription_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subError) {
        console.error('Failed to load subscription:', subError)
      }

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, currency, provider, payment_type, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (paymentsError) {
        console.error('Failed to load payments:', paymentsError)
      }

      setSubscription(subData || null)
      setPayments(paymentsData || [])
      setLoading(false)
    }

    loadBillingData()
  }, [user])

  const handleRenewNow = async () => {
    if (!subscription) return
    setRenewing(true)

    const planKey = `${subscription.plan}_${subscription.billing_cycle}`
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ provider: subscription.provider, planKey }),
    })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setRenewing(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure? You will keep access until the end of your current billing period.')) {
      return
    }
    setCancelLoading(true)
    setCancelError(null)

    const { data: { session } } = await supabase.auth.getSession()

    try {
      const res = await fetch('/api/billing/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel')
      }

      setSubscription((prev) => ({
        ...prev,
        cancel_at_period_end: true,
      }))
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReactivate = async () => {
    setCancelLoading(true)
    setCancelError(null)

    const { data: { session } } = await supabase.auth.getSession()

    try {
      const res = await fetch('/api/billing/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reactivate')
      }

      setSubscription((prev) => ({
        ...prev,
        cancel_at_period_end: false,
      }))
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    )
  }

  const isFree = !subscription
  const planInfo = subscription ? PLAN_LABELS[subscription.plan] : null
  const price = planInfo
    ? (subscription.billing_cycle === 'annual' ? planInfo.annual : planInfo.monthly)
    : 0

  const displayStatus = subscription?.cancel_at_period_end ? 'cancelling' : subscription?.status

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Billing</h1>
        <p className="text-foreground/60 text-sm">Manage your plan and subscription</p>
      </div>

      {/* Current Plan */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 mb-8">
        {subscription?.isAdmin ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <ZapIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">Admin</h2>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full border font-medium bg-emerald-50 text-emerald-600 border-emerald-200">
                active
              </span>
            </div>
            <p className="text-foreground/60 text-sm mb-6 mt-4">
              You have unlimited access to all features — resumes, portfolios, templates, and AI generations.
            </p>
            <a href="/pricing" className="text-sm text-accent hover:underline font-medium inline-flex items-center gap-1">
              View Plans
              <ArrowRightIcon />
            </a>
          </>
        ) : isFree ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <ZapIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Free Plan</h2>
                <p className="text-foreground/60 text-sm">₱0 forever</p>
              </div>
            </div>
            <p className="text-foreground/60 text-sm mb-6">
              You're currently on the free plan. Upgrade for more resumes, templates, and portfolio publishing.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20"
            >
              View Plans
              <ArrowRightIcon />
            </a>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <ZapIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{planInfo?.name || subscription.plan}</h2>
                  <p className="text-foreground/60 text-sm">
                    ₱{price.toLocaleString()} / {subscription.billing_cycle === 'annual' ? 'year' : 'month'}
                  </p>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  STATUS_STYLES[displayStatus] || 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {displayStatus}
              </span>
            </div>
            <p className="text-foreground/60 text-sm mb-6 mt-4">
              {subscription.renewal_type === 'auto' ? 'Auto-renews' : 'Manual renewal'} via{' '}
              {subscription.provider === 'stripe' ? 'Stripe' : 'PayMongo'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="bg-muted/30 rounded-xl p-4">
                <p className="text-foreground/60 mb-1 text-xs uppercase tracking-wider font-medium">
                  {subscription.cancel_at_period_end ? 'Access ends on' : 'Next renewal date'}
                </p>
                <p className="font-semibold">{formatDate(subscription.current_period_end)}</p>
              </div>
            </div>

            {cancelError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3">
                <AlertTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                {cancelError}
              </div>
            )}

            {subscription.provider === 'stripe' && subscription.status === 'active' && (
              <div className="flex flex-wrap gap-3 mb-6">
                {subscription.cancel_at_period_end ? (
                  <button
                    onClick={handleReactivate}
                    disabled={cancelLoading}
                    className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
                  >
                    <RefreshIcon />
                    {cancelLoading ? 'Processing...' : 'Reactivate Subscription'}
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="inline-flex items-center gap-2 bg-card border border-border text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-red-300 hover:text-red-600 transition-all disabled:opacity-50"
                  >
                    <XIcon />
                    {cancelLoading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            )}

            {subscription.renewal_type === 'manual' && subscription.status === 'active' && !subscription.cancel_at_period_end && (
              <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 mb-6">
                <p className="text-sm mb-4">
                  This plan renews manually. Renew before {formatDate(subscription.current_period_end)} to keep uninterrupted access.
                </p>
                <button
                  onClick={handleRenewNow}
                  disabled={renewing}
                  className="bg-accent text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-accent-hover transition-all hover:shadow-lg hover:shadow-accent/20 disabled:opacity-50"
                >
                  {renewing ? 'Redirecting...' : 'Renew Now'}
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <a href="/pricing" className="text-accent hover:underline font-medium inline-flex items-center gap-1">
                Change plan
                <ArrowRightIcon />
              </a>
              <a href="/refund" className="text-accent hover:underline font-medium inline-flex items-center gap-1">
                Refund policy
                <ArrowRightIcon />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-4 tracking-tight">Payment History</h2>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center text-foreground/30 mx-auto mb-3">
              <CreditCardIcon className="w-6 h-6" />
            </div>
            <p className="text-foreground/60 text-sm">No payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/60 border-b border-border">
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Date</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Description</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Amount</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Provider</th>
                  <th className="pb-3 font-medium text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3">{formatDate(payment.created_at)}</td>
                    <td className="py-3 capitalize">
                      {payment.payment_type === 'lifetime_slot' ? 'Lifetime Portfolio Slot' : 'Subscription'}
                    </td>
                    <td className="py-3 font-medium">{formatAmount(payment.amount, payment.currency)}</td>
                    <td className="py-3 capitalize">{payment.provider}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'succeeded' 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-amber-50 text-amber-600'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}