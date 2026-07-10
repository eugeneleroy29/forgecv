'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

// Small display-only map — kept local to this page rather than importing
// from the pricing page (which doesn't export PLANS). Prices shown here
// are PHP only since Billing reflects the subscription actually on file,
// not a fresh visitor's detected currency.
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
  active: 'bg-green-50 text-green-600 border-green-200',
  past_due: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  canceled: 'bg-red-50 text-red-600 border-red-200',
  expired: 'bg-red-50 text-red-600 border-red-200',
}

export default function Billing() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [renewing, setRenewing] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadBillingData = async () => {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('plan, billing_cycle, renewal_type, status, provider, current_period_end')
        .eq('user_id', user.id)
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

  if (loading) {
    return (
      <div className="px-8 py-8">
        <p className="text-foreground/60">Loading...</p>
      </div>
    )
  }

  const isFree = !subscription
  const planInfo = subscription ? PLAN_LABELS[subscription.plan] : null
  const price = planInfo
    ? (subscription.billing_cycle === 'annual' ? planInfo.annual : planInfo.monthly)
    : 0

  return (
    <div className="px-8 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-8">Billing</h1>

      {/* Current Plan */}
      <div className="border border-border rounded-xl p-8 mb-8">
        {isFree ? (
          <>
            <h2 className="text-lg font-semibold mb-1">Free Plan</h2>
            <p className="text-foreground/60 text-sm mb-6">
              You're currently on the free plan. Upgrade for more resumes, templates, and portfolio publishing.
            </p>
            <a
            
              href="/pricing"
              className="inline-block bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              View Plans
            </a>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">{planInfo?.name || subscription.plan}</h2>
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  STATUS_STYLES[subscription.status] || 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {subscription.status}
              </span>
            </div>
            <p className="text-foreground/60 text-sm mb-6">
              ₱{price.toLocaleString()} / {subscription.billing_cycle === 'annual' ? 'year' : 'month'} •{' '}
              {subscription.renewal_type === 'auto' ? 'Auto-renews' : 'Manual renewal'} via{' '}
              {subscription.provider === 'stripe' ? 'Stripe' : 'PayMongo'}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-foreground/60 mb-1">Next renewal date</p>
                <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
              </div>
            </div>

            {subscription.renewal_type === 'manual' && subscription.status === 'active' && (
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
                <p className="text-sm mb-3">
                  This plan renews manually. Renew before {formatDate(subscription.current_period_end)} to keep uninterrupted access.
                </p>
                <button
                  onClick={handleRenewNow}
                  disabled={renewing}
                  className="bg-accent text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                >
                  {renewing ? 'Redirecting...' : 'Renew Now'}
                </button>
              </div>
            )}

            <a href="/pricing" className="text-sm text-accent hover:underline">
              Change plan →
            </a>
          </>
        )}
      </div>

      {/* Payment History */}
      <div className="border border-border rounded-xl p-8">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-foreground/60 text-sm">No payments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-foreground/60 border-b border-border">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Provider</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3">{formatDate(payment.created_at)}</td>
                    <td className="py-3 capitalize">
                      {payment.payment_type === 'lifetime_slot' ? 'Lifetime Portfolio Slot' : 'Subscription'}
                    </td>
                    <td className="py-3">{formatAmount(payment.amount, payment.currency)}</td>
                    <td className="py-3 capitalize">{payment.provider}</td>
                    <td className="py-3 capitalize">{payment.status}</td>
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
