import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
  getFontFamily,

} from '../resumeHelpers'

export default function AtsHarvardClassic({ content }) {
  const { personalInfo, summary, experience, education, skills } = content
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content)
  )
  const fontFamily = getFontFamily(content)

  const renderSection = (key, shouldBreak) => {
    const breakClass = shouldBreak ? 'page-break-before' : '';
    switch (key) {
      case 'personalInfo':
        return (
          <div key={key} className="text-center mb-6 border-b border-gray-400 pb-4">
            <h1 className="text-2xl font-bold mb-1 tracking-wide">{personalInfo?.fullName}</h1>
            <p className="text-sm text-gray-700">
              {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
                .filter(Boolean)
                .join(' | ')}
            </p>
            {personalInfo?.linkedin && (
              <p className="text-sm text-gray-700 mt-1">{personalInfo.linkedin}</p>
            )}
          </div>
        )
      case 'summary':
        return (
          <div key={key} className={`mb-6 ${breakClass}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
              Summary
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          </div>
        )
      case 'experience':
        return (
          <div key={key} className={`mb-6 ${breakClass}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
              Experience
            </h2>
            <div className="flex flex-col gap-4 mt-2">
              {experience.map((exp, index) => (
                <div key={exp.id || `exp-${index}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
                    <span className="text-xs text-gray-600">
                      {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 italic mb-1">{exp.company}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
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
          <div key={key} className={`mb-6 ${breakClass}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
              Education
            </h2>
            <div className="flex flex-col gap-3 mt-2">
              {education.map((edu, index) => (
                <div key={edu.id || `edu-${index}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{edu.degree}</h3>
                    <span className="text-xs text-gray-600">
                      {formatDate(edu.startDate)} – {edu.current ? 'Present' : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        )
      case 'skills':
        return (
          <div key={key} className={`mb-6 ${breakClass}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
              Skills
            </h2>
            <p className="text-sm text-gray-800 mt-2">{skills.join(', ')}</p>
          </div>
        )
      default: {
        const customSection = getCustomSectionById(key, content)
        if (!customSection) return null
        return (
          <div key={key} className={`mb-6 ${breakClass}`}>
            <h2 className="text-sm font-bold uppercase tracking-wider mb-2 border-b border-gray-300 pb-1">
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
    <div className={`bg-white text-black $p-8 max-w-[8.5in] mx-auto`} id="resume-preview" style={{ fontFamily }}>
      <style>{`
        @media print {
          .page-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }
        }
      `}</style>
      {orderedSections.map((key) => renderSection(key, content.pageBreaks?.[key]))}
    </div>
  )
}
