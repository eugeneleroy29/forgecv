'use client'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const SECTIONS = [
  {
    heading: '1. Agreement to Terms',
    body: [
      'These Terms of Service ("Terms") govern your use of ForgeCV. By creating an account or using ForgeCV, you agree to these Terms. If you do not agree, please do not use the service.',
    ],
  },
  {
    heading: '2. Your Account',
    body: [
      'You must provide accurate information when creating your account and are responsible for keeping your login credentials secure. You are responsible for all activity that happens under your account.',
      'You must be at least 13 years old to use ForgeCV.',
    ],
  },
  {
    heading: '3. Plans, Billing, and Renewal',
    body: [
      'ForgeCV offers a Free plan and paid Starter and Pro plans, billed monthly or annually, as well as one-time lifetime portfolio publish slots. Current pricing is listed on our Pricing page.',
      'Subscriptions paid through Stripe renew automatically at the end of each billing period unless cancelled. Subscriptions paid through PayMongo currently renew manually - we will send you a reminder email before your plan expires, and your subscription will lapse if you do not complete the renewal payment.',
      'Lifetime portfolio publish slots are a one-time purchase and do not expire, and stack on top of the publish slots included in any active subscription plan.',
      'You can cancel a subscription at any time from your Billing page. If you cancel, you will keep access to paid features until the end of your current billing period. After that, your account reverts to the Free plan limits, but your resumes and portfolio content are not deleted.',
    ],
  },
  {
    heading: '4. Refunds',
    body: [
      'Refund requests are handled on a case-by-case basis. Please see our Refund Policy for details, or contact us at support@forgecv.com.',
    ],
  },
  {
    heading: '5. Your Content',
    body: [
      'You retain ownership of the resume and portfolio content you create using ForgeCV. By using the service, you grant us permission to store, process, and display that content as needed to provide the service to you, including making a published portfolio publicly accessible at the URL you are given.',
      'You are responsible for the accuracy and legality of the content you submit, and you agree not to upload content that is unlawful, infringes on someone else\'s rights, or is otherwise harmful.',
    ],
  },
  {
    heading: '6. AI-Powered Features',
    body: [
      'ForgeCV includes optional AI features that generate suggestions such as summaries, skills, and resume feedback. These suggestions are generated automatically and may not always be accurate - you are responsible for reviewing and editing any AI-generated content before using it.',
    ],
  },
  {
    heading: '7. Acceptable Use',
    body: [
      'You agree not to use ForgeCV to violate any law, infringe on intellectual property rights, distribute malware, or attempt to disrupt or gain unauthorized access to our systems.',
      'We reserve the right to suspend or terminate accounts that violate these Terms.',
    ],
  },
  {
    heading: '8. Service Availability',
    body: [
      'We aim to keep ForgeCV available and reliable, but we do not guarantee uninterrupted access. We may modify, suspend, or discontinue parts of the service at any time.',
    ],
  },
  {
    heading: '9. Disclaimer and Limitation of Liability',
    body: [
      'ForgeCV is provided "as is" without warranties of any kind. To the fullest extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
    ],
  },
  {
    heading: '10. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. If we make material changes, we will update the date below and, where appropriate, notify you.',
    ],
  },
  {
    heading: '11. Contact Us',
    body: [
      'If you have any questions about these Terms, contact us at support@forgecv.com.',
    ],
  },
]

export default function Terms() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
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
