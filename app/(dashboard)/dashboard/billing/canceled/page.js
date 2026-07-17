'use client'

import { useRouter } from 'next/navigation'

export default function BillingCanceled() {
  const router = useRouter()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-2xl mx-auto text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Checkout Canceled</h1>
        <p className="text-foreground/60">
          Your payment was not completed. No charges were made to your account.
        </p>
      </div>

      <div className="border border-border rounded-xl p-6 mb-6 text-left">
        <h2 className="font-semibold mb-3">What happened?</h2>
        <ul className="space-y-2 text-sm text-foreground/60">
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            You closed the checkout window before completing payment
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            Your payment method was declined
          </li>
          <li className="flex items-start gap-2">
            <span className="text-accent mt-0.5">•</span>
            You decided not to complete the purchase
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push('/pricing')}
          className="bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => router.push('/dashboard/billing')}
          className="border border-border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-background/50 transition-colors"
        >
          Go to Billing
        </button>
      </div>

      <p className="mt-6 text-sm text-foreground/40">
        Need help?{' '}
        <a href="/support" className="text-accent hover:underline">
          Contact support
        </a>
      </p>
    </div>
  )
}