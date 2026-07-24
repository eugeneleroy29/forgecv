import SectionWrapper from "../SectionWrapper";
import SampleWorkCard from "../SampleWorkCard";

export default function PortfolioItemsSection({ portfolioItems = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!portfolioItems.length) return null;
  return (
    <SectionWrapper id="portfolio" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Portfolio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {portfolioItems.map((item) => (
          <SampleWorkCard key={item.id} work={item} accentColor={theme.accent} />
        ))}
      </div>
    </SectionWrapper>
  );
}