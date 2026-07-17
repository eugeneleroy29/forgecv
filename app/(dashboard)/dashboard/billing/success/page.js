'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'

export default function BillingSuccess() {
  const { user } = useAuth()
  const router = useRouter()
  const [verifying, setVerifying] = useState(true)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    if (!user) return

    const checkSubscription = async () => {
      // Give webhook a moment to process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSubscription(data)
      setVerifying(false)
    }

    checkSubscription()
  }, [user])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-foreground/60">
          Thank you for subscribing to ForgeCV. Your account has been upgraded.
        </p>
      </div>

      {verifying ? (
        <div className="border border-border rounded-xl p-8 mb-6">
          <p className="text-foreground/60 text-sm">Verifying your subscription...</p>
        </div>
      ) : subscription ? (
        <div className="border border-border rounded-xl p-6 mb-6 text-left">
          <h2 className="font-semibold mb-4">Subscription Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground/60">Plan</span>
              <span className="font-medium capitalize">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground/60">Current period ends</span>
              <span className="font-medium">
                {new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-border rounded-xl p-6 mb-6">
          <p className="text-foreground/60 text-sm mb-2">
            We're still processing your payment. This may take a few moments.
          </p>
          <p className="text-foreground/60 text-sm">
            Refresh this page or check your billing dashboard for updates.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Go to Billing
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-background/50 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}