import { getFontFamily } from '../coverLetterHelpers'

export default function PremiumMinimal({ content }) {
  const { personalInfo, recipient, body, closing, customization } = content
  const fontFamily = getFontFamily(content)
  const accentColor = customization?.accentColor || '#4F46E5'

  return (
    <div className="bg-white text-black p-10 max-w-[8.5in] mx-auto" style={{ fontFamily, minHeight: '11in' }}>
      {/* Minimal Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl font-light tracking-widest uppercase mb-2" style={{ color: accentColor }}>{personalInfo?.fullName || 'Your Name'}</h1>
        <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: accentColor }}></div>
        <p className="text-xs text-gray-500">
          {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
            .filter(Boolean)
            .join('  ·  ')}
        </p>
        {personalInfo?.linkedin && (
          <p className="text-xs text-gray-500 mt-1">{personalInfo.linkedin}</p>
        )}
      </div>

      {/* Date */}
      <div className="mb-6">
        <p className="text-sm text-gray-700">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Recipient */}
      <div className="mb-4">
        <p className="text-sm text-gray-800 font-medium">{recipient?.hiringManager || 'Hiring Manager'}</p>
        <p className="text-sm text-gray-800">{recipient?.company || 'Company Name'}</p>
      </div>

      {/* Salutation */}
      <div className="mb-4">
        <p className="text-sm text-gray-800">Dear {recipient?.hiringManager || 'Hiring Manager'},</p>
      </div>

      {/* Body */}
      <div className="mb-6">
        <p className="text-sm text-gray-800 leading-loose whitespace-pre-line">{body || 'Your cover letter content will appear here.'}</p>
      </div>

      {/* Closing */}
      <div>
        <p className="text-sm text-gray-800 mb-6">{closing || 'Warm regards,'}</p>
        <p className="text-sm text-gray-800 font-medium">{personalInfo?.fullName || 'Your Name'}</p>
      </div>
    </div>
  )
}