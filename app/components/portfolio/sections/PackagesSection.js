import SectionWrapper from "../SectionWrapper";
import PricingCard from "../PricingCard";

export default function PackagesSection({ packages = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!packages?.length) return null;
  return (
    <SectionWrapper id="packages" background="soft" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Packages &amp; Pricing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg, i) => (
          <PricingCard key={pkg.id || i} package={pkg} accentColor={theme.accent} />
        ))}
      </div>
    </SectionWrapper>
  );
}