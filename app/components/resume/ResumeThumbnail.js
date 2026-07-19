"use client"
import { getTemplateComponent } from './templates'

// Rich sample content for realistic thumbnail previews
const SAMPLE_RESUME_CONTENT = {
  personalInfo: {
    fullName: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '+63 912 345 6789',
    location: 'Cebu City, Philippines',
    linkedin: 'linkedin.com/in/mariasantos',
    website: 'mariasantos.com',
  },
  summary:
    'Detail-oriented Virtual Assistant with 6+ years of experience supporting C-level executives and remote teams. Proven track record in calendar management, CRM administration, and project coordination across multiple time zones.',
  experience: [
    {
      id: 'exp1',
      jobTitle: 'Executive Virtual Assistant',
      company: 'TechStart Global Inc.',
      startDate: '2021-03',
      current: true,
      description: 'Manage complex calendars for 4 executives across EST and PST time zones. Coordinate international travel, prepare board meeting materials, and serve as primary liaison for 200+ client accounts.',
    },
    {
      id: 'exp2',
      jobTitle: 'Senior Administrative Assistant',
      company: 'Bright Solutions LLC',
      startDate: '2018-07',
      endDate: '2021-02',
      description: 'Oversaw office operations for a 25-person remote team. Implemented new CRM workflow that reduced response time by 40%. Managed vendor relationships and $50K annual procurement budget.',
    },
    {
      id: 'exp3',
      jobTitle: 'Customer Support Specialist',
      company: 'Pacific Outsourcing Co.',
      startDate: '2016-01',
      endDate: '2018-06',
      description: 'Provided tier-2 support for SaaS platform with 10K+ users. Maintained 98% customer satisfaction score. Trained 5 new team members on support protocols and escalation procedures.',
    },
  ],
  education: [
    {
      id: 'edu1',
      degree: 'BS Business Administration',
      school: 'University of San Carlos',
      startDate: '2012-06',
      endDate: '2016-04',
    },
    {
      id: 'edu2',
      degree: 'Certificate in Digital Marketing',
      school: 'Google Digital Garage',
      startDate: '2019-01',
      endDate: '2019-06',
    },
  ],
  certifications: [
    { id: 'cert1', name: 'HubSpot Inbound Marketing', issuer: 'HubSpot Academy', date: '2020' },
    { id: 'cert2', name: 'Project Management Fundamentals', issuer: 'Coursera', date: '2021' },
    { id: 'cert3', name: 'Advanced Excel & Data Analysis', issuer: 'LinkedIn Learning', date: '2022' },
  ],
  skills: [
    'Calendar Management',
    'CRM Administration (HubSpot, Salesforce)',
    'Project Coordination',
    'Email Management',
    'Travel Coordination',
    'Data Entry & Analysis',
    'Customer Support',
    'Social Media Management',
    'Bookkeeping (QuickBooks)',
    'Google Workspace & Microsoft 365',
  ],
}

const PHOTO_BY_TEMPLATE = {
  'premium-sidebar-photo': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  'premium-topheader-photo': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'premium-twocol-photo': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
}

const ACCENT_BY_TEMPLATE = {
  'ats-harvard-classic': null,
  'ats-harvard-modern': null,
  'premium-sidebar-photo': '#1B4D3E',
  'premium-topheader-photo': '#7B1F3A',
  'premium-twocol-photo': '#2D4A3E',
}

const FULL_WIDTH = 850
const FULL_HEIGHT = 1100
const THUMB_WIDTH = 260
const THUMB_HEIGHT = 336

export default function ResumeThumbnail({ template }) {
  const TemplateComponent = getTemplateComponent(template)
  const photoUrl = PHOTO_BY_TEMPLATE[template]
  const accentColor = ACCENT_BY_TEMPLATE[template]

  const sampleContent = {
    ...SAMPLE_RESUME_CONTENT,
    ...(photoUrl ? { personalInfo: { ...SAMPLE_RESUME_CONTENT.personalInfo, photoUrl } } : {}),
    ...(accentColor ? { customization: { accentColor } } : {}),
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