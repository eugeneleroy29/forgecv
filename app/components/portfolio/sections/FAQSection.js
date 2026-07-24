import SectionWrapper from "../SectionWrapper";
import FAQItem from "../FAQItem";

export default function FAQSection({ faq = [], theme = {}, headingClass = "", isAurora = false }) {
  if (!faq?.length) return null;
  return (
    <SectionWrapper id="faq" background="soft" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-3">
        {faq.map((item, i) => (
          <FAQItem key={item.id || i} faq={item} accentColor={theme.accent} />
        ))}
      </div>
    </SectionWrapper>
  );
}