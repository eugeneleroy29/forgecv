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

export default function AuroraTemplate({ content = {}, theme = {} }) {
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
  const profileImageStyle = customization.profileImageStyle || customization.photoShape || "arch";

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
    services: <ServicesSection key="services" services={services} theme={theme} headingClass={headingClass} isAurora={true} />,
    packages: <PackagesSection key="packages" packages={packages} theme={theme} headingClass={headingClass} isAurora={true} />,
    tools: <ToolsSection key="tools" tools={tools} theme={theme} headingClass={headingClass} isAurora={true} />,
    experience: <ExperienceSection key="experience" experience={experience} theme={theme} headingClass={headingClass} isAurora={true} />,
    portfolioItems: <PortfolioItemsSection key="portfolioItems" portfolioItems={portfolioItems} theme={theme} headingClass={headingClass} isAurora={true} />,
    skillsTools: <SkillsToolsSection key="skillsTools" skillsToolsByCategory={skillsToolsByCategory} headingClass={headingClass} isAurora={true} theme={theme} />,
    customSections: <CustomSectionsSection key="customSections" customSections={content.customSections} headingClass={headingClass} isAurora={true} theme={theme} />,
    testimonials: <TestimonialsSection key="testimonials" testimonials={testimonials} theme={theme} headingClass={headingClass} isAurora={true} />,
    video: <VideoSection key="video" videoUrl={videoUrl} headingClass={headingClass} isAurora={true} theme={theme} />,
    faq: <FAQSection key="faq" faq={faq} theme={theme} headingClass={headingClass} isAurora={true} />,
  };

  return (
    <div className="min-h-screen bg-background">
      <PortfolioNavbar content={content} theme={theme} />

      {/* ─── Aurora Split Hero ────────────────────────────────────────────── */}
      <section
        id="hero"
        className="px-4 sm:px-6 relative overflow-hidden py-16 md:py-24 lg:py-28"
        style={{ background: `linear-gradient(135deg, ${theme.accent} 0%, #3730a3 100%)` }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white blur-[140px] opacity-40" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-400 blur-[150px] opacity-50" />
          <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-purple-400 blur-[120px] opacity-30" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center text-left">
            <div className={`${personalInfo.photoUrl ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl"} flex flex-col items-start`}>
              {availabilityStatus && (
                <div className="mb-4 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs sm:text-sm font-medium tracking-wide backdrop-blur-md border border-white/20 shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span>{availabilityStatus}</span>
                </div>
              )}

              {personalInfo.fullName && (
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200/90 mb-2">
                  {personalInfo.fullName}
                </p>
              )}

              {about.headline ? (
                <>
                  <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-[1.15] ${headingClass}`}>
                    {about.headline}
                  </h1>
                  {personalInfo.tagline && (
                    <p className="text-base sm:text-lg font-medium text-indigo-200 mb-3">
                      {personalInfo.tagline}
                    </p>
                  )}
                </>
              ) : personalInfo.tagline ? (
                <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 leading-[1.15] ${headingClass}`}>
                  {personalInfo.tagline}
                </h1>
              ) : null}

              {personalInfo.bio && (
                <p className="text-base sm:text-lg text-indigo-100/80 font-normal leading-relaxed mb-8 max-w-2xl">
                  {personalInfo.bio.length > 200 ? personalInfo.bio.slice(0, 200) + "..." : personalInfo.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3.5 items-center mb-8 w-full sm:w-auto">
                <CTAButton
                  href="#contact"
                  variant="primary"
                  accentColor="#ffffff"
                  className="!bg-white !text-indigo-600 hover:!bg-indigo-50 shadow-xl font-bold px-7 py-3.5 text-base rounded-xl min-w-[170px] justify-center text-center"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector("#contact");
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - 72;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                >
                  Hire Me Now
                </CTAButton>
                {services.length > 0 && (
                  <CTAButton
                    href="#services"
                    variant="secondary"
                    accentColor="#ffffff"
                    className="!border-white/40 !text-white hover:!bg-white/10 font-semibold px-7 py-3.5 text-base rounded-xl min-w-[170px] justify-center text-center"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.querySelector("#services");
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 72;
                        window.scrollTo({ top, behavior: "smooth" });
                      }
                    }}
                  >
                    View Services
                  </CTAButton>
                )}
              </div>

              {stats.length > 0 && (
                <div className="pt-6 border-t border-white/15 w-full">
                  <StatsCounter stats={stats} accentColor="#ffffff" isDark={true} className="justify-center sm:justify-start text-center sm:text-left" />
                </div>
              )}
            </div>

            {personalInfo.photoUrl && (
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative group w-full max-w-[320px] sm:max-w-[380px]">
                  <div className="absolute -inset-4 rounded-[48px] bg-gradient-to-r from-indigo-300/30 to-purple-300/30 blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />
                  <div className="relative z-10 flex justify-center items-center">
                    <ProfileImage
                      src={personalInfo.photoUrl}
                      alt={personalInfo.fullName || "Profile"}
                      style={profileImageStyle || "arch"}
                      size={280}
                      accentColor={theme.accent}
                      className="mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {(about?.text || about?.quote || about?.traits?.length > 0) && (
          <SectionWrapper id="about" background="white" className="mb-16 sm:mb-20" isAurora={true} accentColor={theme.accent}>
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
          <SectionWrapper background="white" className="mb-16 sm:mb-20 text-center" isAurora={true} accentColor={theme.accent}>
            <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}>
              Connect With Me
            </h2>
            <SocialLinks links={socialLinks} variant="row" accentColor={theme.accent} className="justify-center" />
          </SectionWrapper>
        )}

        <SectionWrapper id="contact" background="soft" className="text-center pt-10 border-t border-border" isAurora={true} accentColor={theme.accent}>
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

      <footer className="border-t border-border py-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-foreground/50">
          <p>© {new Date().getFullYear()} {personalInfo.fullName || "Portfolio"}. All rights reserved.</p>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mt-1">Aurora Premium Template</p>
        </div>
      </footer>
    </div>
  );
}