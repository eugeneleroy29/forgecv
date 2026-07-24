import SectionWrapper from "../SectionWrapper";
import TestimonialCard from "../TestimonialCard";

export default function TestimonialsSection({ testimonials = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!testimonials.length) return null;
  return (
    <SectionWrapper id="testimonials" background="soft" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        What Clients Say
      </h2>
      <div className="flex flex-col gap-5">
        {testimonials.map((t) => (
          <TestimonialCard key={t.id} testimonial={t} accentColor={theme.accent} />
        ))}
      </div>
    </SectionWrapper>
  );
}