import SectionWrapper from "../SectionWrapper";
import ToolBadge from "../ToolBadge";

export default function ToolsSection({ tools = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!tools.length) return null;
  return (
    <SectionWrapper id="tools" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Tools &amp; Skills
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {tools.map((tool) => (
          <ToolBadge key={tool} tool={{ name: tool }} accentColor={theme.accent} />
        ))}
      </div>
    </SectionWrapper>
  );
}