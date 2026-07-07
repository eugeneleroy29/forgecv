import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
  getAccentColor,
} from '../resumeHelpers'

// Left column: summary + skills. Right column: experience + education + custom sections.
const LEFT_COL_SECTIONS = ['summary', 'skills']

export default function PremiumTwoColPhoto({ content }) {
  const { personalInfo, summary, experience, education, skills } = content
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content)
  )
  const bodyKeys = orderedSections.filter((key) => key !== 'personalInfo')
  const leftKeys = bodyKeys.filter((key) => LEFT_COL_SECTIONS.includes(key))
  const rightKeys = bodyKeys.filter((key) => !LEFT_COL_SECTIONS.includes(key))
  const accentColor = getAccentColor(content)

  const PhotoCircle = () => {
    if (personalInfo?.photoUrl) {
      return (
        <img
          src={personalInfo.photoUrl}
          alt={personalInfo?.fullName || 'Profile photo'}
          className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
        />
      )
    }
    const initials = (personalInfo?.fullName || '')
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase()
    return (
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold" style={{ backgroundColor: `${accentColor}20`, color: accentColor }}>
        {initials || '?'}
      </div>
    )
  }

  const renderLeftSection = (key) => {
    switch (key) {
      case 'summary':
        return (
          <div key={key} className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              Summary
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          </div>
        )
      case 'skills':
        return (
          <div key={key} className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              Skills
            </h2>
            <ul className="text-sm text-gray-800 space-y-1 mt-2">
              {skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        )
      default:
        return null
    }
  }

  const renderRightSection = (key) => {
    switch (key) {
      case 'experience':
        return (
          <div key={key} className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              Experience
            </h2>
            <div className="flex flex-col gap-4 mt-2">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{exp.company}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      case 'education':
        return (
          <div key={key} className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              Education
            </h2>
            <div className="flex flex-col gap-3 mt-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{edu.degree}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(edu.startDate)} – {edu.current ? 'Present' : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        )
      default: {
        const customSection = getCustomSectionById(key, content)
        if (!customSection) return null
        return (
          <div key={key} className="mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: accentColor }}>
              {customSection.title}
            </h2>
            <ul className="text-sm text-gray-800 mt-2 list-disc list-inside">
              {customSection.items
                .filter((item) => item.text?.trim())
                .map((item) => (
                  <li key={item.id}>{item.text}</li>
                ))}
            </ul>
          </div>
        )
      }
    }
  }

  return (
    <div className="bg-white text-black max-w-[8.5in] mx-auto p-8 font-sans" id="resume-preview">
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        <PhotoCircle />
        <h1 className="text-2xl font-bold mb-1">{personalInfo?.fullName}</h1>
        <p className="text-sm text-gray-600">
          {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
            .filter(Boolean)
            .join(' • ')}
        </p>
        {personalInfo?.linkedin && (
          <p className="text-sm text-gray-600 mt-1">{personalInfo.linkedin}</p>
        )}
      </div>
      <div className="flex gap-8">
        <div className="w-1/3">{leftKeys.map(renderLeftSection)}</div>
        <div className="w-2/3">{rightKeys.map(renderRightSection)}</div>
      </div>
    </div>
  )
}
