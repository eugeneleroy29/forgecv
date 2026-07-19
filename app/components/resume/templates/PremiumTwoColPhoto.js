import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
  getAccentColor,
  getFontFamily,
  getPhotoShape,
} from "../resumeHelpers";

const LEFT_COL_SECTIONS = ["summary", "skills"];

export default function PremiumTwoColPhoto({ content }) {
  const { personalInfo, summary, experience, education, skills, customization } = content;
  const photoShape = getPhotoShape(content);
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content),
  );
  const bodyKeys = orderedSections.filter((key) => key !== "personalInfo");
  const leftKeys = bodyKeys.filter((key) => LEFT_COL_SECTIONS.includes(key));
  const rightKeys = bodyKeys.filter((key) => !LEFT_COL_SECTIONS.includes(key));
  const accentColor = getAccentColor(content);
  const fontFamily = getFontFamily(content);

  const PhotoCircle = () => {
    if (personalInfo?.photoUrl) {
      const shapeClass = photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-lg' : 'rounded-none';
      return (
        <img
          src={personalInfo.photoUrl}
          alt={personalInfo?.fullName || "Profile photo"}
          className={`w-16 h-16 ${shapeClass} object-cover mx-auto mb-2`}
        />
      );
    }
    const initials = (personalInfo?.fullName || "")
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
      const placeholderShape = photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-lg' : 'rounded-none';
      return (
        <div
          className={`w-16 h-16 ${placeholderShape} flex items-center justify-center mx-auto mb-2 text-base font-bold`}
          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
        >
          {initials || "?"}
        </div>
      );
  };

  const renderLeftSection = (key, shouldBreak) => {
    const breakClass = shouldBreak ? 'page-break-before' : '';
    switch (key) {
      case "summary":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-1.5"
              style={{ color: accentColor }}
            >
              Summary
            </h2>
            <p className="text-xs text-gray-800 leading-snug">{summary}</p>
          </div>
        );
      case "skills":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-1.5"
              style={{ color: accentColor }}
            >
              Skills
            </h2>
            <ul className="text-xs text-gray-800 space-y-0.5 mt-1.5">
              {skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  const renderRightSection = (key, shouldBreak) => {
    const breakClass = shouldBreak ? 'page-break-before' : '';
    switch (key) {
      case "experience":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-1.5"
              style={{ color: accentColor }}
            >
              Experience
            </h2>
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
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-1.5"
              style={{ color: accentColor }}
            >
              Education
            </h2>
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
      default: {
        const customSection = getCustomSectionById(key, content);
        if (!customSection) return null;
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <h2
              className="text-xs font-bold uppercase tracking-wide mb-1.5"
              style={{ color: accentColor }}
            >
              {customSection.title}
            </h2>
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
      className={`bg-white text-black max-w-[8.5in] mx-auto p-6`}
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
      <div className="text-center mb-4 border-b border-gray-300 pb-3">
        <PhotoCircle />
        <h1 className="text-xl font-bold mb-0.5">{personalInfo?.fullName}</h1>
        <p className="text-xs text-gray-600">
          {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
            .filter(Boolean)
            .join(" • ")}
        </p>
        {personalInfo?.linkedin && (
          <p className="text-xs text-gray-600 mt-0.5">{personalInfo.linkedin}</p>
        )}
      </div>
      <div className="flex gap-6">
        <div className="w-1/3">{leftKeys.map((key) => renderLeftSection(key, content.pageBreaks?.[key]))}</div>
        <div className="w-2/3">{rightKeys.map((key) => renderRightSection(key, content.pageBreaks?.[key]))}</div>
      </div>
    </div>
  );
}