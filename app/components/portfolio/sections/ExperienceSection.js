import SectionWrapper from "../SectionWrapper";

export default function ExperienceSection({ experience = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!experience.length) return null;
  return (
    <SectionWrapper id="experience" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Experience
      </h2>
      <div className="flex flex-col gap-6">
        {experience.map((exp) => (
          <div key={exp.id} className="border-l-2 pl-5 py-1" style={{ borderColor: theme.accent }}>
            <h3 className="font-semibold text-foreground">{exp.jobTitle}</h3>
            <p className="text-sm text-foreground/50 mb-2">
              {exp.company} · {exp.startDate} — {exp.current ? "Present" : exp.endDate}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {exp.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}