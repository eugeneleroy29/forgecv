export default function ResumePreview({ content }) {
  const { personalInfo, summary, experience, education, skills } = content

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="bg-white text-black p-10 max-w-[8.5in] mx-auto" id="resume-preview">
      
      {/* Header */}
      <div className="text-center mb-6 border-b border-gray-300 pb-4">
        <h1 className="text-2xl font-bold mb-1">{personalInfo?.fullName || 'Your Name'}</h1>
        <p className="text-sm text-gray-600">
          {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
            .filter(Boolean)
            .join(' • ')}
        </p>
        {personalInfo?.linkedin && (
          <p className="text-sm text-gray-600 mt-1">{personalInfo.linkedin}</p>
        )}
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2 text-gray-800">
            Professional Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2 text-gray-800">
            Work Experience
          </h2>
          <div className="flex flex-col gap-4">
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
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2 text-gray-800">
            Education
          </h2>
          <div className="flex flex-col gap-3">
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
      )}

      {/* Skills */}
      {skills?.length > 0 && (
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2 text-gray-800">
            Skills
          </h2>
          <p className="text-sm text-gray-700">{skills.join(' • ')}</p>
        </div>
      )}

    </div>
  )
}