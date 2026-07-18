import { getFontFamily } from '../coverLetterHelpers'

export default function AtsModern({ content }) {
  const { personalInfo, recipient, body, closing } = content
  const fontFamily = getFontFamily(content)

  return (
    <div className="bg-white text-black p-8 max-w-[8.5in] mx-auto" style={{ fontFamily, minHeight: '11in' }}>
      {/* Header with accent line */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold mb-1 tracking-wide">{personalInfo?.fullName || 'Your Name'}</h1>
        <p className="text-sm text-gray-600">
          {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
            .filter(Boolean)
            .join(' | ')}
        </p>
        {personalInfo?.linkedin && (
          <p className="text-sm text-gray-600">{personalInfo.linkedin}</p>
        )}
      </div>

      {/* Date & Recipient */}
      <div className="mb-6">
        <p className="text-sm text-gray-700 mb-1">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
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
        <p className="text-sm text-gray-800 mb-4">{closing || 'Best regards,'}</p>
        <p className="text-sm text-gray-800 font-semibold">{personalInfo?.fullName || 'Your Name'}</p>
      </div>
    </div>
  )
}