"use client";

import PortfolioNavbar from "../PortfolioNavbar";
import ProfileImage from "../ProfileImage";
import CTAButton from "../CTAButton";
import StatsCounter from "../StatsCounter";
import SectionWrapper from "../SectionWrapper";
import ContactForm from "../ContactForm";
import SocialLinks from "../SocialLinks";
import { TOOLS_CATALOG } from "../toolsCatalog";

import ServicesSection from "../sections/ServicesSection";
import PackagesSection from "../sections/PackagesSection";
import ToolsSection from "../sections/ToolsSection";
import ExperienceSection from "../sections/ExperienceSection";
import PortfolioItemsSection from "../sections/PortfolioItemsSection";
import SkillsToolsSection from "../sections/SkillsToolsSection";
import CustomSectionsSection from "../sections/CustomSectionsSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import VideoSection from "../sections/VideoSection";
import FAQSection from "../sections/FAQSection";

export default function BasicTemplate({ content = {}, theme = {} }) {
  const {
    personalInfo = {},
    services = [],
    experience = [],
    tools = [],
    portfolioItems = [],
    testimonials = [],
    contact = {},
    skillsTools = [],
    packages = [],
    videoUrl = "",
    faq = [],
    socialLinks = {},
    stats = [],
    availabilityStatus = "",
    about = {},
    customization = {},
  } = content;

  const skillsToolsByCategory = TOOLS_CATALOG.map((category) => ({
    ...category,
    selected: skillsTools.filter((t) => t.categoryId === category.id),
  })).filter((category) => category.selected.length > 0);

  const headingClass = theme.headingFont === "serif" ? "font-serif" : "font-sans";
  const profileImageStyle = customization.profileImageStyle || customization.photoShape || "circle";

  const DEFAULT_SECTION_ORDER = [
    "services",
    "packages",
    "experience",
    "tools",
    "skillsTools",
    "customSections",
    "portfolioItems",
    "testimonials",
    "video",
    "faq",
  ];
  let orderedSections =
    content.sectionOrder && content.sectionOrder.length > 0
      ? content.sectionOrder
      : DEFAULT_SECTION_ORDER;
  ["packages", "skillsTools", "customSections", "video", "faq"].forEach((key) => {
    if (!orderedSections.includes(key)) orderedSections = [...orderedSections, key];
  });

  const sectionComponents = {
    services: <ServicesSection key="services" services={services} theme={theme} headingClass={headingClass} isAurora={false} />,
    packages: <PackagesSection key="packages" packages={packages} theme={theme} headingClass={headingClass} isAurora={false} />,
    tools: <ToolsSection key="tools" tools={tools} theme={theme} headingClass={headingClass} isAurora={false} />,
    experience: <ExperienceSection key="experience" experience={experience} theme={theme} headingClass={headingClass} isAurora={false} />,
    portfolioItems: <PortfolioItemsSection key="portfolioItems" portfolioItems={portfolioItems} theme={theme} headingClass={headingClass} isAurora={false} />,
    skillsTools: <SkillsToolsSection key="skillsTools" skillsToolsByCategory={skillsToolsByCategory} headingClass={headingClass} isAurora={false} theme={theme} />,
    customSections: <CustomSectionsSection key="customSections" customSections={content.customSections} headingClass={headingClass} isAurora={false} theme={theme} />,
    testimonials: <TestimonialsSection key="testimonials" testimonials={testimonials} theme={theme} headingClass={headingClass} isAurora={false} />,
    video: <VideoSection key="video" videoUrl={videoUrl} headingClass={headingClass} isAurora={false} theme={theme} />,
    faq: <FAQSection key="faq" faq={faq} theme={theme} headingClass={headingClass} isAurora={false} />,
  };

  return (
    <div className="min-h-screen bg-background">
      <PortfolioNavbar content={content} theme={theme} />

      {/* ─── Standard Centered Hero ─────────────────────────────────────────── */}
      <section
        id="hero"
        className="px-4 sm:px-6 py-20 sm:py-32 text-center relative overflow-hidden"
        style={{ backgroundColor: theme.accentSoft }}
      >
        <div className="relative z-10 max-w-4xl mx-auto">
          {personalInfo.photoUrl && (
            <ProfileImage
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || "Profile"}
              style={profileImageStyle}
              size={128}
              accentColor={theme.accent}
              className="mx-auto mb-6 sm:mb-8 shadow-2xl"
            />
          )}

          {personalInfo.fullName && (
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-foreground/60 mb-2">
              {personalInfo.fullName}
            </p>
          )}

          {about.headline ? (
            <>
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3 ${headingClass} text-foreground`}>
                {about.headline}
              </h1>
              {personalInfo.tagline && (
                <p className="text-lg sm:text-xl font-medium mb-6" style={{ color: theme.accent }}>
                  {personalInfo.tagline}
                </p>
              )}
            </>
          ) : personalInfo.tagline ? (
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 ${headingClass} text-foreground`}>
              {personalInfo.tagline}
            </h1>
          ) : null}

          {availabilityStatus && (
            <p className="text-sm mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-foreground/60 bg-background/50 border border-border">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }} />
              {availabilityStatus}
            </p>
          )}

          {stats.length > 0 && (
            <div className="mb-10">
              <StatsCounter stats={stats} accentColor={theme.accent} isDark={false} className="justify-center text-center" />
            </div>
          )}

          <div className="flex justify-center gap-4 flex-wrap">
            {contact.email && (
              <CTAButton
                href="#contact"
                variant="primary"
                accentColor={theme.accent}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#contact");
                  if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY - 72;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
              >
                Get in Touch
              </CTAButton>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {(about?.text || about?.quote || about?.traits?.length > 0) && (
          <SectionWrapper id="about" background="white" className="mb-16 sm:mb-20" isAurora={false} accentColor={theme.accent}>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}>
              About
            </h2>
            {about.text && (
              <p className="text-foreground/70 leading-relaxed whitespace-pre-line text-base sm:text-lg mb-5">
                {about.text}
              </p>
            )}
            {about.quote && (
              <blockquote className="border-l-2 pl-4 italic text-foreground/60 mb-5" style={{ borderColor: theme.accent }}>
                &ldquo;{about.quote}&rdquo;
              </blockquote>
            )}
            {about.traits?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {about.traits.map((trait, i) => (
                  <span key={i} className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: theme.accentSoft, color: theme.accent }}>
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </SectionWrapper>
        )}

        {orderedSections.map((key) => sectionComponents[key])}

        {Object.keys(socialLinks).length > 0 && (
          <SectionWrapper background="white" className="mb-16 sm:mb-20 text-center" isAurora={false} accentColor={theme.accent}>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}>
              Connect With Me
            </h2>
            <SocialLinks links={socialLinks} variant="row" accentColor={theme.accent} className="justify-center" />
          </SectionWrapper>
        )}

        <SectionWrapper id="contact" background="soft" className="text-center pt-10 border-t border-border" isAurora={false} accentColor={theme.accent}>
          <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${headingClass}`}>
            Let&apos;s Work Together
          </h2>
          <p className="text-foreground/60 mb-8 max-w-lg mx-auto">
            Have a project in mind or need assistance? Reach out and I&apos;ll get back to you as soon as possible.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border bg-card hover:border-accent/40 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-border bg-card hover:border-accent/40 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {contact.phone}
              </a>
            )}
          </div>

          {contact.email && (
            <ContactForm email={contact.email} accentColor={theme.accent} className="max-w-md mx-auto" />
          )}
        </SectionWrapper>
      </div>

      <footer className="border-t border-border py-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-foreground/50">
          <p>© {new Date().getFullYear()} {personalInfo.fullName || "Portfolio"}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}