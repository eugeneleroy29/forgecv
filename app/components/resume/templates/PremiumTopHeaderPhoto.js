import {
  formatDate,
  getOrderedSections,
  isSectionEmpty,
  getCustomSectionById,
  getAccentColor,
  getFontFamily,

  getPhotoShape,
} from "../resumeHelpers";

export default function PremiumTopHeaderPhoto({ content }) {
  const { personalInfo, summary, experience, education, skills, customization } = content;
  const photoShape = getPhotoShape(content);
  const orderedSections = getOrderedSections(content).filter(
    (key) => !isSectionEmpty(key, content),
  );
  // Header is rendered separately above; skip personalInfo in the body loop.
  const bodyKeys = orderedSections.filter((key) => key !== "personalInfo");
  const accentColor = getAccentColor(content);
  const fontFamily = getFontFamily(content);

  const PhotoCircle = () => {
    if (personalInfo?.photoUrl) {
      const shapeClass = photoShape === 'circle' ? 'rounded-full' : photoShape === 'rounded' ? 'rounded-lg' : 'rounded-none';
      return (
        <img
          src={personalInfo.photoUrl}
          alt={personalInfo?.fullName || "Profile photo"}
          className={`w-24 h-24 ${shapeClass} object-cover border-4 border-white/30 shrink-0`}
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
        <div className={`w-24 h-24 ${placeholderShape} bg-white/20 flex items-center justify-center text-xl font-bold shrink-0`}>
          {initials || "?"}
        </div>
      );
    };

  const renderBodySection = (key) => {
    switch (key) {
      case "summary":
        return (
          <div key={key} className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: accentColor }}
            >
              Summary
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
          </div>
        );
      case "experience":
        return (
          <div key={key} className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: accentColor }}
            >
              Experience
            </h2>
            <div className="flex flex-col gap-4 mt-2">
              {experience.map((exp, index) => (
                <div key={exp.id || `exp-${index}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{exp.jobTitle}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(exp.startDate)} –{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
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
        );
      case "education":
        return (
          <div key={key} className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: accentColor }}
            >
              Education
            </h2>
            <div className="flex flex-col gap-3 mt-2">
              {education.map((edu, index) => (
                <div key={edu.id || `edu-${index}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{edu.degree}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(edu.startDate)} –{" "}
                      {edu.current ? "Present" : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "skills":
        return (
          <div key={key} className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: accentColor }}
            >
              Skills
            </h2>
            <p className="text-sm text-gray-800 mt-2">{skills.join(" • ")}</p>
          </div>
        );
      default: {
        const customSection = getCustomSectionById(key, content);
        if (!customSection) return null;
        return (
          <div key={key} className="mb-6">
            <h2
              className="text-sm font-bold uppercase tracking-wide mb-2"
              style={{ color: accentColor }}
            >
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
        );
      }
    }
  };

  return (
    <div
      className="bg-white text-black max-w-[8.5in] mx-auto"
      id="resume-preview"
      style={{ fontFamily }}
    >
      <div
        className={`text-white $p-8 flex items-center gap-6`}
        style={{ backgroundColor: accentColor }}
      >
        <PhotoCircle />
        <div>
          <h1 className="text-2xl font-bold mb-1">{personalInfo?.fullName}</h1>
          <p className="text-sm text-white/90">
            {[personalInfo?.email, personalInfo?.phone, personalInfo?.location]
              .filter(Boolean)
              .join(" • ")}
          </p>
          {personalInfo?.linkedin && (
            <p className="text-sm text-white/90 mt-1">
              {personalInfo.linkedin}
            </p>
          )}
        </div>
      </div>
      <div className="p-8">{bodyKeys.map(renderBodySection)}</div>
    </div>
  );
}
