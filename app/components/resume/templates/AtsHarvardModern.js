import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
} from '../resumeHelpers'

export default function AtsHarvardModern({ content }) {
  const { personalInfo, summary, experience, education, skills } = content
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content)
  )

  const SectionHeading = ({ children }) => (
    <h2 className="text-sm font-bold text-indigo-700 mb-2">{children}</h2>
  )

  const renderSection = (key) => {
    switch (key) {
      case 'personalInfo':
        return (
          <div key={key} className="mb-6">
            <h1 className="text-3xl font-bold mb-1">{personalInfo?.fullName}</h1>
            <p className="text-sm text-gray-600">
              {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
                .filter(Boolean)
                .join(' • ')}
            </p>
            {personalInfo?.linkedin && (
              <p className="text-sm text-gray-600 mt-1">{personalInfo.linkedin}</p>
            )}
          </div>
        )
      case 'summary':
        return (
          <div key={key} className="mb-6">
            <SectionHeading>Summary</SectionHeading>
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          </div>
        )
      case 'experience':
        return (
          <div key={key} className="mb-6">
            <SectionHeading>Experience</SectionHeading>
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
          <div key={key} className="mb-6">
            <SectionHeading>Education</SectionHeading>
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
      case 'skills':
        return (
          <div key={key} className="mb-6">
            <SectionHeading>Skills</SectionHeading>
            <p className="text-sm text-gray-800 mt-2">{skills.join(' • ')}</p>
          </div>
        )
      default: {
        const customSection = getCustomSectionById(key, content)
        if (!customSection) return null
        return (
          <div key={key} className="mb-6">
            <SectionHeading>{customSection.title}</SectionHeading>
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
    <div className="bg-white text-black p-10 max-w-[8.5in] mx-auto font-sans" id="resume-preview">
      {orderedSections.map(renderSection)}
    </div>
  )
}
