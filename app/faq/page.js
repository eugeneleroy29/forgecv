'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { ChevronDown } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const FAQ_SECTIONS = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is ForgeCV?',
        a: 'ForgeCV is an AI-powered resume builder and portfolio website generator built for virtual assistants, freelancers, and remote workers. You can build a professional resume and a live portfolio website in one place.',
      },
      {
        q: 'Do I need a credit card to sign up?',
        a: 'No. The Free plan lets you build one resume and one portfolio with no payment required. A card is only needed if you upgrade to Starter or Pro.',
      },
      {
        q: 'Can I use ForgeCV if I am not a Filipino VA?',
        a: 'Yes. While several templates are designed with virtual assistant niches in mind, ForgeCV works for any freelancer or remote worker building a resume or portfolio.',
      },
    ],
  },
  {
    category: 'Plans and Pricing',
    items: [
      {
        q: 'What is the difference between Free, Starter, and Pro?',
        a: 'Free includes 1 resume, 1 template, and portfolio building only (no publishing). Starter (&#8369;149/mo or &#8369;1,490/yr) includes 3 resumes, up to 3 templates, 1 portfolio publish slot, and 30 AI generations per month. Pro (&#8369;299/mo or &#8369;2,990/yr) includes unlimited resumes and templates, 3 portfolio publish slots, 60 AI generations per month, portfolio analytics, and priority support.',
      },
      {
        q: 'Can I switch between monthly and annual billing?',
        a: 'Yes, you can change your plan or billing cycle anytime from your Billing page. If you have questions about how a mid-cycle switch is charged, our support team can help.',
      },
      {
        q: 'What happens to my data if I cancel or downgrade?',
        a: 'You can cancel anytime. Your access continues until the end of your current billing period, and your data is never deleted. Paid features simply lock again until you resubscribe.',
      },
      {
        q: 'Do lifetime portfolio slots stack with my subscription?',
        a: 'Yes. Lifetime portfolio slots are permanent and stack on top of whatever publish slots your current subscription plan provides.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'International cards, Apple Pay, and Google Pay via Stripe, plus GCash, Maya, and local cards via PayMongo for Philippine customers.',
      },
      {
        q: 'Why do I see prices in pesos or dollars?',
        a: 'ForgeCV automatically detects your location. Visitors in the Philippines see pricing in pesos (&#8369;), and international visitors see pricing in US dollars ($).',
      },
      {
        q: 'Is my subscription auto-renewing?',
        a: 'Subscriptions paid through Stripe renew automatically. Subscriptions paid through PayMongo currently renew manually, and you will receive a reminder email before your plan expires.',
      },
      {
        q: 'How do I get a refund?',
        a: 'Please see our Refund Policy for full details, or contact support if you have questions about a specific charge.',
      },
    ],
  },
  {
    category: 'Resume Builder',
    items: [
      {
        q: 'How many resumes and templates can I create?',
        a: 'This depends on your plan: 1 on Free, 3 on Starter, and unlimited on Pro. ForgeCV offers 5 resume templates in total, including 2 ATS-friendly Harvard-style layouts and 3 premium designs with photo support.',
      },
      {
        q: 'What do the AI features actually do?',
        a: 'ForgeCV includes 4 AI-powered tools inside the resume editor: a Professional Summary Generator, a Skills Suggester based on your role, an ATS Score Checker with actionable suggestions, and a Job Description Optimizer that compares your resume against a pasted job posting.',
      },
      {
        q: 'Can I download my resume as a PDF?',
        a: 'Yes. Use the Print / Save as PDF button in the resume editor to export a print-ready PDF at any time.',
      },
    ],
  },
  {
    category: 'Portfolio Builder',
    items: [
      {
        q: 'What is the difference between building and publishing a portfolio?',
        a: 'You can build a portfolio using any of the 9 available templates for free. Publishing it to a live public URL requires an available publish slot from a Starter, Pro, or lifetime plan.',
      },
      {
        q: 'How many portfolio templates are there?',
        a: 'There are 9 templates in total: 8 designed for specific virtual assistant niches, and 1 general template that fits any role.',
      },
      {
        q: 'Can I customize colors and fonts?',
        a: 'Yes. You can set a custom accent color, switch between sans-serif and serif fonts, reorder sections, and showcase your skills and tools with a visual icon grid.',
      },
    ],
  },
  {
    category: 'Account and Support',
    items: [
      {
        q: 'I forgot my password. What do I do?',
        a: 'Click "Forgot password" on the login page and enter your email. You will receive a link to reset your password. If the link has expired, you can request a new one from the same page.',
      },
      {
        q: 'How do I contact support?',
        a: 'Visit our Support page to reach out to our team.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Contact our support team to request account deletion.',
      },
    ],
  },
]

export default function FAQ() {
  const router = useRouter()
  const { user } = useAuth()
  const [openKey, setOpenKey] = useState(null)

  const toggle = (key) => {
    setOpenKey(openKey === key ? null : key)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
          Everything you need to know about plans, payments, and building your resume or portfolio with ForgeCV.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="flex flex-col gap-12">
          {FAQ_SECTIONS.map((section, sectionIdx) => (
            <div key={section.category} className="border border-border rounded-xl p-8">
              <h2 className="text-2xl font-bold mb-4">{section.category}</h2>
              <div className="flex flex-col">
                {section.items.map((item, itemIdx) => {
                  const key = sectionIdx + '-' + itemIdx
                  const isOpen = openKey === key
                  return (
                    <div key={key} className="border-b border-border last:border-b-0">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between gap-4 text-left py-4"
                      >
                        <span className="font-medium">{item.q}</span>
                        <ChevronDown
                          className={
                            'w-5 h-5 flex-shrink-0 text-foreground/40 transition-transform ' +
                            (isOpen ? 'rotate-180' : '')
                          }
                        />
                      </button>
                      {isOpen && (
                        <p className="text-sm text-foreground/60 pb-4 pr-8">{item.a}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
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
