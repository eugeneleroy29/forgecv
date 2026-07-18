import { getFontFamily } from '../coverLetterHelpers'

export default function PremiumSidebar({ content }) {
  const { personalInfo, recipient, body, closing, customization } = content
  const fontFamily = getFontFamily(content)
  const accentColor = customization?.accentColor || '#4F46E5'

  return (
    <div className="bg-white text-black max-w-[8.5in] mx-auto flex" style={{ fontFamily }}>
      {/* Sidebar */}
      <div className="w-[35%] p-6" style={{ backgroundColor: accentColor + '08', borderRight: `2px solid ${accentColor}20` }}>
        {/* Name */}
        <div className="mb-6">
          <h1 className="text-lg font-bold mb-2" style={{ color: accentColor }}>{personalInfo?.fullName || 'Your Name'}</h1>
          <div className="w-8 h-0.5 mb-3" style={{ backgroundColor: accentColor }}></div>
        </div>

        {/* Contact Info */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Contact</h3>
          <div className="text-xs text-gray-600 space-y-1.5">
            {personalInfo?.email && <p>{personalInfo.email}</p>}
            {personalInfo?.phone && <p>{personalInfo.phone}</p>}
            {personalInfo?.location && <p>{personalInfo.location}</p>}
            {personalInfo?.linkedin && <p>{personalInfo.linkedin}</p>}
          </div>
        </div>

        {/* Job Applied For */}
        {recipient?.jobTitle && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Position</h3>
            <p className="text-xs text-gray-700 font-medium">{recipient.jobTitle}</p>
          </div>
        )}

        {/* Company */}
        {recipient?.company && (
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Company</h3>
            <p className="text-xs text-gray-700 font-medium">{recipient.company}</p>
          </div>
        )}

        {/* Date */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-500">Date</h3>
          <p className="text-xs text-gray-600">
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-[65%] p-6 pl-8">
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
    </div>
  )
}