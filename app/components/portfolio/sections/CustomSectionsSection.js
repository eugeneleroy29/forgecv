import SectionWrapper from "../SectionWrapper";

export default function CustomSectionsSection({ customSections = [], headingClass = "", isAurora = false, theme = {} }) {
  const validSections = (customSections || []).filter((section) =>
    section.items?.some((item) => item.text?.trim()),
  );
  if (!validSections.length) return null;

  return (
    <SectionWrapper background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      {validSections.map((section) => (
        <div key={section.id} className="mb-10 last:mb-0">
          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6 ${headingClass}`}>
            {section.title}
          </h2>
          <ul className="list-disc list-inside flex flex-col gap-2.5 text-foreground/70">
            {section.items
              .filter((item) => item.text?.trim())
              .map((item) => (
                <li key={item.id} className="leading-relaxed">
                  {item.text}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </SectionWrapper>
  );
}