'use client'

import { useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TEMPLATES = [
  {
    id: 'medical_va',
    name: 'Medical VA',
    description: 'For medical virtual assistants — highlight certifications, HIPAA training, and EHR tools.',
    icon: '🩺',
  },
  {
    id: 'social_media_manager',
    name: 'Social Media Manager',
    description: 'Showcase campaigns, content calendars, and platform growth results.',
    icon: '📱',
  },
  {
    id: 'data_entry',
    name: 'Data Entry',
    description: 'Highlight accuracy, speed, and tools like Excel, Google Sheets, and CRMs.',
    icon: '⌨️',
  },
  {
    id: 'content_writer',
    name: 'Content Writer',
    description: 'Feature writing samples, niches covered, and SEO experience.',
    icon: '✍️',
  },
  {
    id: 'ecommerce',
    name: 'E-commerce VA',
    description: 'Highlight store management, Shopify/Amazon experience, and product listings.',
    icon: '🛒',
  },
  {
    id: 'customer_service',
    name: 'Customer Service',
    description: 'Showcase support tools, response metrics, and communication skills.',
    icon: '🎧',
  },
  {
    id: 'bookkeeping',
    name: 'Bookkeeping',
    description: 'Highlight certifications, tools like QuickBooks/Xero, and reconciliation experience.',
    icon: '📊',
  },
  {
    id: 'graphic_design',
    name: 'Graphic Design',
    description: 'A visual-first layout to feature your design samples and case studies.',
    icon: '🎨',
  },
  {
    id: 'basic',
    name: 'General / Other',
    description: "Don't see your niche? Use this flexible template that works for any profession.",
    icon: '✨',
  },
]

export default function NewPortfolio() {
  const { user } = useAuth()
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const createPortfolio = async (templateId, templateName) => {
    if (creating) return
    setCreating(true)
    setError(null)

    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        title: `My ${templateName} Portfolio`,
        content: {},
        template: templateId,
      })
      .select()
      .single()

    if (error) {
      setError('Something went wrong creating your portfolio. Please try again.')
      setCreating(false)
      return
    }

    router.push(`/dashboard/portfolios/${data.id}`)
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Choose a Template</h1>
        <p className="text-foreground/60">
          Pick the niche that best matches your skills. You can customize everything after.
        </p>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            onClick={() => createPortfolio(tpl.id, tpl.name)}
            disabled={creating}
            className="text-left border border-border rounded-xl p-6 hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-3xl mb-3">{tpl.icon}</div>
            <h3 className="font-semibold mb-1">{tpl.name}</h3>
            <p className="text-xs text-foreground/60">{tpl.description}</p>
          </button>
        ))}
      </div>

      {creating && (
        <p className="text-sm text-foreground/60 mt-6">Creating your portfolio...</p>
      )}
    </div>
  )
}