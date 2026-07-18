import { getFontFamily } from '../coverLetterHelpers'

export default function AtsClassic({ content }) {
  const { personalInfo, recipient, body, closing } = content
  const fontFamily = getFontFamily(content)

  return (
    <div className="bg-white text-black p-8 max-w-[8.5in] mx-auto" style={{ fontFamily }}>
      {/* Sender Info */}
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1">{personalInfo?.fullName || 'Your Name'}</h1>
        <p className="text-sm text-gray-700">
          {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
            .filter(Boolean)
            .join(' | ')}
        </p>
        {personalInfo?.linkedin && (
          <p className="text-sm text-gray-700">{personalInfo.linkedin}</p>
        )}
      </div>

      {/* Date */}
      <div className="mb-6">
        <p className="text-sm text-gray-800">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Recipient */}
      <div className="mb-6">
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
  )
}