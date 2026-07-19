"use client"

import { getCoverLetterTemplateComponent } from './templates'

const FULL_WIDTH = 850
const FULL_HEIGHT = 1100
const THUMB_WIDTH = 260
const THUMB_HEIGHT = 336

const SAMPLE_COVER_LETTER_CONTENT = {
  personalInfo: {
    fullName: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 912 345 6789',
    location: 'Cebu City, Philippines',
    linkedin: 'linkedin.com/in/mariasantos',
  },
  recipient: {
    hiringManager: 'Sarah Mitchell',
    company: 'TechStart Global Inc.',
  },
  body: `Dear Sarah Mitchell,

I am writing to express my strong interest in the Executive Virtual Assistant position at TechStart Global Inc. With over six years of experience supporting C-level executives in fast-paced remote environments, I am confident in my ability to contribute effectively to your team.

In my current role at Bright Solutions LLC, I manage complex calendars for four executives across multiple time zones, coordinate international travel arrangements, and serve as the primary liaison for over 200 client accounts. I have also implemented CRM workflow improvements that reduced response times by 40%.

My proficiency in HubSpot, Salesforce, Google Workspace, and Microsoft 365, combined with my exceptional organizational skills and attention to detail, make me well-suited for the demands of this position. I am particularly drawn to TechStart Global's commitment to innovation and remote-first culture.

I would welcome the opportunity to discuss how my background and skills align with your team's needs. Thank you for considering my application.

Sincerely,`,
  closing: 'Sincerely,',
  customization: {
    fontFamily: 'inter',
  },
}

const ACCENT_BY_TEMPLATE = {
  'ats-classic': null,
  'ats-modern': null,
  'premium-minimal': '#1B4D3E',
}

export default function CoverLetterThumbnail({ template }) {
  const TemplateComponent = getCoverLetterTemplateComponent(template)
  const accentColor = ACCENT_BY_TEMPLATE[template]

  const sampleContent = {
    ...SAMPLE_COVER_LETTER_CONTENT,
    ...(accentColor ? { customization: { ...SAMPLE_COVER_LETTER_CONTENT.customization, accentColor } } : {}),
  }

  const scale = THUMB_WIDTH / FULL_WIDTH

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-white"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
    >
      <div
        style={{
          width: FULL_WIDTH,
          height: FULL_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <TemplateComponent content={sampleContent} />
      </div>
    </div>
  )
}