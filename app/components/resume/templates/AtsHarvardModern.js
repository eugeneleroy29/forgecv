import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
  getAccentColor,
  getFontFamily,
} from "../resumeHelpers";

export default function AtsHarvardModern({ content }) {
  const { personalInfo, summary, experience, education, skills } = content;
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content),
  );
  const accentColor = getAccentColor(content);
  const fontFamily = getFontFamily(content);

  const SectionHeading = ({ children }) => (
    <h2 className="text-xs font-bold mb-1.5" style={{ color: accentColor }}>
      {children}
    </h2>
  );

  const renderSection = (key, shouldBreak) => {
    const breakClass = shouldBreak ? 'page-break-before' : '';
    switch (key) {
      case "personalInfo":
        return (
          <div key={key} className="mb-4">
            <h1 className="text-2xl font-bold mb-0.5">
              {personalInfo?.fullName}
            </h1>
            <p className="text-xs text-gray-600">
              {[
                personalInfo?.email,
                personalInfo?.phone,
                personalInfo?.location,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>
            {personalInfo?.linkedin && (
              <p className="text-xs text-gray-600 mt-0.5">
                {personalInfo.linkedin}
              </p>
            )}
          </div>
        );
      case "summary":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <SectionHeading>Summary</SectionHeading>
            <p className="text-xs text-gray-800 leading-snug">{summary}</p>
          </div>
        );
      case "experience":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <SectionHeading>Experience</SectionHeading>
            <div className="flex flex-col gap-2.5 mt-1.5">
              {experience.map((exp, index) => (
                <div key={exp.id || `exp-${index}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold">{exp.jobTitle}</h3>
                    <span className="text-[10px] text-gray-500">
                      {formatDate(exp.startDate)} –{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-0.5">{exp.company}</p>
                  {exp.description && (
                    <p className="text-xs text-gray-700 leading-snug whitespace-pre-line">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case "education":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <SectionHeading>Education</SectionHeading>
            <div className="flex flex-col gap-2 mt-1.5">
              {education.map((edu, index) => (
                <div key={edu.id || `edu-${index}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold">{edu.degree}</h3>
                    <span className="text-[10px] text-gray-500">
                      {formatDate(edu.startDate)} –{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <SectionHeading>Skills</SectionHeading>
            <p className="text-xs text-gray-800 mt-1.5">{skills.join(" • ")}</p>
          </div>
        );
      default: {
        const customSection = getCustomSectionById(key, content);
        if (!customSection) return null;
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <SectionHeading>{customSection.title}</SectionHeading>
            <ul className="text-xs text-gray-800 mt-1.5 list-disc list-inside">
              {customSection.items
                .filter((item) => item.text?.trim())
                .map((item) => (
                  <li key={item.id}>{item.text}</li>
                ))}
            </ul>
          </div>
        );
      }
    }
  };

  return (
    <div
      className={`bg-white text-black p-6 max-w-[8.5in] mx-auto`}
      id="resume-preview"
      style={{ fontFamily }}
    >
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
  );
}