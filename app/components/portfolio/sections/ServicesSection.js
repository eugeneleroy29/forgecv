import SectionWrapper from "../SectionWrapper";
import ServiceCard from "../ServiceCard";

export default function ServicesSection({ services = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!services.length) return null;
  return (
    <SectionWrapper id="services" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={theme.accent} />
        ))}
      </div>
    </SectionWrapper>
  );
}