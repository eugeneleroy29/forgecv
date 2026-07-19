import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
  getAccentColor,
  getFontFamily,
  getPhotoShape,
} from "../resumeHelpers";

const SIDEBAR_SECTIONS = ["personalInfo", "skills", "education"];

export default function PremiumSidebarPhoto({ content }) {
  const { personalInfo, summary, experience, education, skills, customization } = content;
  const photoShape = getPhotoShape(content);
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content),
  );

  const accentColor = getAccentColor(content);
  const fontFamily = getFontFamily(content);

  const sidebarKeys = orderedSections.filter((key) =>
    SIDEBAR_SECTIONS.includes(key),
  );
  const mainKeys = orderedSections.filter(
    (key) => !SIDEBAR_SECTIONS.includes(key),
  );

  const PhotoCircle = () => {
    if (personalInfo?.photoUrl) {
      const shapeClass = photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-lg' : 'rounded-none';
      return (
        <img
          src={personalInfo.photoUrl}
          alt={personalInfo.fullName || "Profile"}
          className={`w-24 h-24 ${shapeClass} object-cover mx-auto mb-3 border-2 border-white/30`}
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
      <div className={`w-24 h-24 ${placeholderShape} bg-white/20 flex items-center justify-center mx-auto mb-3 text-xl font-bold`}>
        {initials || "?"}
      </div>
    );
  };

  const renderSidebarSection = (key, shouldBreak) => {
    const breakClass = shouldBreak ? 'page-break-before' : '';
    switch (key) {
      case "personalInfo":
        return (
          <div key={key} className={`mb-4 text-center ${breakClass}`}>
            <PhotoCircle />
            <h1 className="text-lg font-bold mb-2">{personalInfo?.fullName}</h1>
            <div className="text-xs space-y-0.5 text-white/90">
              {personalInfo?.email && <p>{personalInfo.email}</p>}
              {personalInfo?.phone && <p>{personalInfo.phone}</p>}
              {personalInfo?.location && <p>{personalInfo.location}</p>}
              {personalInfo?.linkedin && <p>{personalInfo.linkedin}</p>}
            </div>
          </div>
        );
      case "skills":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <h2 className="text-xs font-bold uppercase tracking-wide mb-1.5 border-b border-white/30 pb-0.5">
              Skills
            </h2>
            <ul className="text-xs space-y-0.5 mt-1.5">
              {skills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        );
      case "education":
        return (
          <div key={key} className={`mb-4 ${breakClass}`}>
            <h2 className="text-xs font-bold uppercase tracking-wide mb-1.5 border-b border-white/30 pb-0.5">
              Education
            </h2>
            <div className="flex flex-col gap-2 mt-1.5">
              {education.map((edu, index) => (
                <div key={edu.id || `edu-${index}`}>
                  <h3 className="text-xs font-semibold">{edu.degree}</h3>
                  <p className="text-xs text-white/80">{edu.school}</p>
                  <p className="text-[10px] text-white/60">
                    {formatDate(edu.startDate)} – {edu.current ? "Present" : formatDate(edu.endDate)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderMainSection = (key, shouldBreak) => {
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
      className="bg-white text-black max-w-[8.5in] mx-auto flex min-h-[11in]"
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
      <div
        className="w-1/3 text-white p-5 flex flex-col"
        style={{ backgroundColor: accentColor }}
      >
        {sidebarKeys.map((key) => renderSidebarSection(key, content.pageBreaks?.[key]))}
        <div className="flex-1"></div>
      </div>
      <div className="w-2/3 p-6">
        {mainKeys.map((key) => renderMainSection(key, content.pageBreaks?.[key]))}
      </div>
    </div>
  );
}