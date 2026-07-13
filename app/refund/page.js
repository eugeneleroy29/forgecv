'use client'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const SECTIONS = [
  {
    heading: '1. Subscriptions (Starter and Pro)',
    body: [
      'Starter and Pro subscription payments, whether billed monthly or annually, are non-refundable.',
      'You can cancel your subscription at any time from your Billing page. When you cancel, you will keep access to your paid plan features until the end of your current billing period. After that, your account reverts to the Free plan limits. Your data, resumes, and portfolio content are never deleted when you cancel or downgrade.',
    ],
  },
  {
    heading: '2. Lifetime Portfolio Slots',
    body: [
      'Lifetime portfolio publish slots (1-slot or 3-slot, one-time purchase) are eligible for a full refund within 7 days of purchase, provided the slot has not yet been used to publish a portfolio.',
      'Once a lifetime slot has been used to publish a portfolio live, it is no longer eligible for a refund.',
      'To request a refund on an unused lifetime slot within the 7-day window, contact us at support@forgecv.com with your account email and purchase date.',
    ],
  },
  {
    heading: '3. Billing Errors',
    body: [
      'If you believe you were charged in error, such as a duplicate charge or a charge after a subscription was already cancelled, contact us at support@forgecv.com and we will look into it.',
    ],
  },
  {
    heading: '4. How to Request a Refund',
    body: [
      'Where a refund applies under this policy, email us at support@forgecv.com with your account email, the date of purchase, and the reason for your request. We will review your request and respond as soon as possible.',
    ],
  },
  {
    heading: '5. Changes to This Policy',
    body: [
      'We may update this Refund Policy from time to time. If we make material changes, we will update the date below.',
    ],
  },
  {
    heading: '6. Contact Us',
    body: [
      'If you have any questions about this Refund Policy, contact us at support@forgecv.com.',
    ],
  },
]

export default function Refund() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-foreground/50 mb-12">Last updated: July 2026</p>

        <div className="flex flex-col gap-10">
          {SECTIONS.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-bold mb-3">{section.heading}</h2>
              <div className="flex flex-col gap-3">
                {section.body.map((paragraph, idx) => (
                  <p key={idx} className="text-foreground/70 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}
