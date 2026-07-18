import { getFontFamily } from '../coverLetterHelpers'

export default function PremiumSidebar({ content }) {
  const { personalInfo, recipient, body, closing, customization } = content
  const fontFamily = getFontFamily(content)
  const accentColor = customization?.accentColor || '#4F46E5'

  return (
    <div className="bg-white text-black max-w-[8.5in] mx-auto flex" style={{ fontFamily, minHeight: '11in' }}>
      {/* Sidebar */}
      <div className="w-1/3 p-6" style={{ backgroundColor: accentColor + '10' }}>
        <div className="mb-8">
          <h1 className="text-lg font-bold mb-2" style={{ color: accentColor }}>{personalInfo?.fullName || 'Your Name'}</h1>
          <div className="text-xs text-gray-600 space-y-1">
            {personalInfo?.email && <p>{personalInfo.email}</p>}
            {personalInfo?.phone && <p>{personalInfo.phone}</p>}
            {personalInfo?.location && <p>{personalInfo.location}</p>}
            {personalInfo?.linkedin && <p>{personalInfo.linkedin}</p>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-2/3 p-6">
        {/* Date */}
        <div className="mb-6">
          <p className="text-sm text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Recipient */}
        <div className="mb-4">
          <p className="text-sm text-gray-800 font-semibold">{recipient?.hiringManager || 'Hiring Manager'}</p>
          <p className="text-sm text-gray-800">{recipient?.company || 'Company Name'}</p>
        </div>

        {/* Salutation */}
        <div className="mb-4">
          <p className="text-sm text-gray-800">Dear {recipient?.hiringManager || 'Hiring Manager'},</p>
        </div>

        {/* Body */}
        <div className="mb-6">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{body || 'Your cover letter content will appear here.'}</p>
        </div>

        {/* Closing */}
        <div>
          <p className="text-sm text-gray-800 mb-4">{closing || 'Sincerely,'}</p>
          <p className="text-sm text-gray-800 font-semibold">{personalInfo?.fullName || 'Your Name'}</p>
        </div>
      </div>
    </div>
  )
}