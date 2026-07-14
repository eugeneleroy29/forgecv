'use client'

import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const SECTIONS = [
  {
    heading: '1. Introduction',
    body: [
      'ForgeCV ("we", "us", or "our") provides an online resume builder and portfolio website generator. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
      'By using ForgeCV, you agree to the collection and use of information as described in this policy.',
    ],
  },
  {
    heading: '2. Information We Collect',
    body: [
      'Account information: your name and email address when you sign up, either directly or through a supported sign-in provider.',
      'Resume and portfolio content: the information you enter into the resume builder and portfolio builder, including work experience, education, skills, profile photos, and any custom sections you add.',
      'Payment information: when you subscribe to a paid plan, payment is processed by Stripe or PayMongo. We do not store your full card number or payment credentials on our servers - these are handled directly by our payment processors.',
      'Usage information: basic technical data such as your general location (used only to determine currency and payment provider), browser type, and how you interact with the app, used to keep the service running and improve it.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    body: [
      'To create and manage your account.',
      'To generate, save, and display your resumes and portfolio websites, including publishing your portfolio to a public URL if you choose to do so.',
      'To process payments and manage your subscription, including renewal reminders for manually-renewed plans.',
      'To provide customer support and respond to your questions.',
      'To improve ForgeCV and fix issues.',
    ],
  },
  {
    heading: '4. AI-Powered Features',
    body: [
      'ForgeCV includes AI features (such as generating a professional summary, suggesting skills, or scoring your resume against a job description) powered by Google\'s Gemini API. When you use these features, the relevant resume content or job description text you provide is sent to Google\'s API to generate a response.',
      'We do not use your resume or portfolio content to train AI models.',
    ],
  },
  {
    heading: '5. Data Storage and Security',
    body: [
      'Your account data, resume content, and portfolio content are stored using Supabase, which provides authentication, database, and file storage services. We use reasonable technical and organizational measures to protect your information, but no method of storage or transmission is completely secure.',
    ],
  },
  {
    heading: '6. Data Retention',
    body: [
      'If you cancel a subscription or your plan expires, your account data and content are not deleted. Your access to paid features is simply restricted until you resubscribe, so you do not lose your resumes or portfolio content.',
      'If you would like your account and associated data permanently deleted, you can contact us at support@forgecv.com to request this.',
    ],
  },
  {
    heading: '7. Sharing of Information',
    body: [
      'We do not sell your personal information. We share information only with the third-party services necessary to operate ForgeCV, including Supabase (hosting and storage), Stripe and PayMongo (payment processing), Google (AI features), and Vercel (application hosting).',
      'If you choose to publish a portfolio, the content of that portfolio is publicly accessible at the URL you are given, by design.',
    ],
  },
  {
    heading: '8. Your Rights',
    body: [
      'Depending on your location, you may have rights to access, correct, or delete your personal information. You can update most of your account information directly from your dashboard, or contact us at support@forgecv.com for anything else.',
    ],
  },
  {
    heading: '9. Children\'s Privacy',
    body: [
      'ForgeCV is not directed at children under 13, and we do not knowingly collect personal information from children under 13.',
    ],
  },
  {
    heading: '10. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. If we make material changes, we will update the date below and, where appropriate, notify you.',
    ],
  },
  {
    heading: '11. Contact Us',
    body: [
      'If you have any questions about this Privacy Policy, contact us at support@forgecv.com.',
    ],
  },
]

export default function Privacy() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
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
