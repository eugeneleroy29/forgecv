import SectionWrapper from "../SectionWrapper";
import BrandIcon from "../BrandIcon";

export default function SkillsToolsSection({ skillsToolsByCategory = [], headingClass = "", isAurora = false, theme = {} }) {
  if (!skillsToolsByCategory.length) return null;
  return (
    <SectionWrapper id="tools" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Skills &amp; Tools I Use
      </h2>
      <div className="flex flex-col gap-6">
        {skillsToolsByCategory.map((category) => (
          <div key={category.id}>
            <h3 className="text-sm font-semibold text-foreground/50 mb-3 uppercase tracking-wide">
              {category.label}
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {category.selected.map((tool, i) => (
                <span
                  key={`${tool.name}-${i}`}
                  className="flex items-center gap-2 border border-border rounded-xl px-3.5 py-2 text-sm bg-card hover:shadow-sm transition-all duration-200"
                >
                  {tool.type === "catalog" ? (
                    <BrandIcon slug={tool.slug} size={16} />
                  ) : (
                    <img src={tool.iconUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <span className="text-foreground/80">{tool.name}</span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}