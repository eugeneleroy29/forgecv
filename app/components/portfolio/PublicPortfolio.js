"use client";

import { useState } from "react";
import { getPortfolioTheme } from "./portfolioThemes";
import { getPhotoShape } from "../resume/resumeHelpers";
import { TOOLS_CATALOG } from "./toolsCatalog";
import BrandIcon from "./BrandIcon";
import PortfolioNavbar from "./PortfolioNavbar";

// ─── NEW: Reusable Portfolio Components ─────────────────────────────────────
import ProfileImage from "./ProfileImage";
import SectionWrapper from "./SectionWrapper";
import ServiceCard from "./ServiceCard";
import PricingCard from "./PricingCard";
import ToolBadge from "./ToolBadge";
import TestimonialCard from "./TestimonialCard";
import VideoEmbed from "./VideoEmbed";
import SampleWorkCard from "./SampleWorkCard";
import FAQItem from "./FAQItem";
import ContactForm from "./ContactForm";
import SocialLinks from "./SocialLinks";
import StatsCounter from "./StatsCounter";
import CTAButton from "./CTAButton";

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function ArrowRightIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function QuoteIcon({ className }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
    </svg>
  );
}

function ForgeCVLogoIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M12 18v-6" />
      <path d="M8 15l4-3 4 3" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToSoftTint(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const softL = 0.93;
  const softS = Math.min(s, 0.6);
  const c = (1 - Math.abs(2 * softL - 1)) * softS;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = softL - c / 2;
  let [r2, g2, b2] = [0, 0, 0];
  if (h < 60) [r2, g2, b2] = [c, x, 0];
  else if (h < 120) [r2, g2, b2] = [x, c, 0];
  else if (h < 180) [r2, g2, b2] = [0, c, x];
  else if (h < 240) [r2, g2, b2] = [0, x, c];
  else if (h < 300) [r2, g2, b2] = [x, 0, c];
  else [r2, g2, b2] = [c, 0, x];
  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

// ─── Copy Email Button ───────────────────────────────────────────────────────

function CopyEmailButton({ email, theme, className, children }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={className}
      style={theme ? { backgroundColor: theme.accent } : undefined}
    >
      {copied ? "Copied!" : children}
    </button>
  );
}

// ─── Section Components ──────────────────────────────────────────────────────

function ServicesSection({ services, theme, headingClass, isAurora }) {
  if (!services.length) return null;
  return (
    <SectionWrapper id="services" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            accentColor={theme.accent}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function PackagesSection({ packages, theme, headingClass, isAurora }) {
  if (!packages?.length) return null;
  return (
    <SectionWrapper id="packages" background="soft" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Packages & Pricing
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {packages.map((pkg, i) => (
          <PricingCard
            key={pkg.id || i}
            package={pkg}
            accentColor={theme.accent}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function ToolsSection({ tools, theme, headingClass, isAurora }) {
  if (!tools.length) return null;
  return (
    <SectionWrapper id="tools" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Tools &amp; Skills
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {tools.map((tool) => (
          <ToolBadge
            key={tool}
            tool={{ name: tool }}
            accentColor={theme.accent}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function ExperienceSection({ experience, theme, headingClass, isAurora }) {
  if (!experience.length) return null;
  return (
    <SectionWrapper id="experience" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Experience
      </h2>
      <div className="flex flex-col gap-6">
        {experience.map((exp) => (
          <div
            key={exp.id}
            className="border-l-2 pl-5 py-1"
            style={{ borderColor: theme.accent }}
          >
            <h3 className="font-semibold text-foreground">{exp.jobTitle}</h3>
            <p className="text-sm text-foreground/50 mb-2">
              {exp.company} · {exp.startDate} —{" "}
              {exp.current ? "Present" : exp.endDate}
            </p>
            <p className="text-sm text-foreground/70 leading-relaxed">
              {exp.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}

function PortfolioItemsSection({ portfolioItems, theme, headingClass, isAurora }) {
  if (!portfolioItems.length) return null;
  return (
    <SectionWrapper id="portfolio" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Portfolio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {portfolioItems.map((item) => (
          <SampleWorkCard
            key={item.id}
            work={item}
            accentColor={theme.accent}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function SkillsToolsSection({ skillsToolsByCategory, headingClass, isAurora, theme }) {
  if (!skillsToolsByCategory.length) return null;
  return (
    <SectionWrapper background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
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
                    <img
                      src={tool.iconUrl}
                      alt=""
                      className="w-4 h-4 object-contain"
                    />
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

function CustomSectionsSection({ customSections, headingClass, isAurora, theme }) {
  const validSections = (customSections || []).filter((section) =>
    section.items?.some((item) => item.text?.trim()),
  );
  if (!validSections.length) return null;

  return (
    <SectionWrapper background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      {validSections.map((section) => (
        <div key={section.id} className="mb-10 last:mb-0">
          <h2
            className={`text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-6 ${headingClass}`}
          >
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

function TestimonialsSection({ testimonials, theme, headingClass, isAurora }) {
  if (!testimonials.length) return null;
  return (
    <SectionWrapper id="testimonials" background="soft" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        What Clients Say
      </h2>
      <div className="flex flex-col gap-5">
        {testimonials.map((t) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            accentColor={theme.accent}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

function VideoSection({ videoUrl, headingClass, isAurora, theme }) {
  if (!videoUrl) return null;
  return (
    <SectionWrapper id="video" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Introduction
      </h2>
      <VideoEmbed url={videoUrl} title="Video introduction" />
    </SectionWrapper>
  );
}

function FAQSection({ faq, theme, headingClass, isAurora }) {
  if (!faq?.length) return null;
  return (
    <SectionWrapper id="faq" background="soft" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Frequently Asked Questions
      </h2>
      <div className="flex flex-col gap-3">
        {faq.map((item, i) => (
          <FAQItem
            key={item.id || i}
            faq={item}
            accentColor={theme.accent}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PublicPortfolio({ portfolio }) {
  const baseTheme = getPortfolioTheme(portfolio.template);
  const content = portfolio.content || {};
  const customization = content.customization || {};
  
  // Aurora specific logic
  const isAurora = portfolio.template === 'aurora' || baseTheme.variant === 'aurora';
  
  const theme = {
    ...baseTheme,
    accent: customization.accentColor || baseTheme.accent,
    accentSoft: customization.accentColor
      ? hexToSoftTint(customization.accentColor)
      : baseTheme.accentSoft,
    headingFont: customization.fontStyle || baseTheme.headingFont,
  };

  const {
    personalInfo = {},
    services = [],
    experience = [],
    tools = [],
    portfolioItems = [],
    testimonials = [],
    contact = {},
    skillsTools = [],
    // NEW fields (backward compatible — undefined if not present)
    packages = [],
    videoUrl = "",
    faq = [],
    socialLinks = {},
    stats = [],
    availabilityStatus = "",
    resumeUrl = "",
    about = {},
  } = content;

  const skillsToolsByCategory = TOOLS_CATALOG.map((category) => ({
    ...category,
    selected: skillsTools.filter((t) => t.categoryId === category.id),
  })).filter((category) => category.selected.length > 0);

  const headingClass =
    theme.headingFont === "serif" ? "font-serif" : "font-sans";

  const DEFAULT_SECTION_ORDER = [
    "services",
    "experience",
    "tools",
    "skillsTools",
    "customSections",
    "portfolioItems",
    "testimonials",
  ];
  let orderedSections =
    content.sectionOrder && content.sectionOrder.length > 0
      ? content.sectionOrder
      : DEFAULT_SECTION_ORDER;
  ["skillsTools", "customSections"].forEach((key) => {
    if (!orderedSections.includes(key))
      orderedSections = [...orderedSections, key];
  });

  const sectionComponents = {
    services: (
      <ServicesSection
        key="services"
        services={services}
        theme={theme}
        headingClass={headingClass}
        isAurora={isAurora}
      />
    ),
    packages: (
      <PackagesSection
        key="packages"
        packages={packages}
        theme={theme}
        headingClass={headingClass}
        isAurora={isAurora}
      />
    ),
    tools: (
      <ToolsSection key="tools" tools={tools} theme={theme} headingClass={headingClass} isAurora={isAurora} />
    ),
    experience: (
      <ExperienceSection
        key="experience"
        experience={experience}
        theme={theme}
        headingClass={headingClass}
        isAurora={isAurora}
      />
    ),
    portfolioItems: (
      <PortfolioItemsSection
        key="portfolioItems"
        portfolioItems={portfolioItems}
        theme={theme}
        headingClass={headingClass}
        isAurora={isAurora}
      />
    ),
    skillsTools: (
      <SkillsToolsSection
        key="skillsTools"
        skillsToolsByCategory={skillsToolsByCategory}
        headingClass={headingClass}
        isAurora={isAurora}
        theme={theme}
      />
    ),
    customSections: (
      <CustomSectionsSection
        key="customSections"
        customSections={content.customSections}
        headingClass={headingClass}
        isAurora={isAurora}
        theme={theme}
      />
    ),
    testimonials: (
      <TestimonialsSection
        key="testimonials"
        testimonials={testimonials}
        theme={theme}
        headingClass={headingClass}
        isAurora={isAurora}
      />
    ),
    video: (
      <VideoSection
        key="video"
        videoUrl={videoUrl}
        headingClass={headingClass}
        isAurora={isAurora}
        theme={theme}
      />
    ),
    faq: (
      <FAQSection
        key="faq"
        faq={faq}
        theme={theme}
        headingClass={headingClass}
        isAurora={isAurora}
      />
    ),
  };

  // Profile image style from customization or content
  const profileImageStyle = customization.profileImageStyle || customization.photoShape || "circle";
  const photoShape = getPhotoShape(portfolio?.content);

  return (
    <div className="min-h-screen bg-background">
      <PortfolioNavbar content={content} theme={theme} />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="px-4 sm:px-6 py-20 sm:py-32 text-center relative overflow-hidden"
        style={isAurora ? {
          background: `linear-gradient(135deg, ${theme.accent} 0%, #4338ca 100%)`,
        } : { backgroundColor: theme.accentSoft }}
      >
        {/* Aurora Background Decoration */}
        {isAurora && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400 blur-[120px]" />
          </div>
        )}

        <div className="relative z-10 max-w-4xl mx-auto">
          {personalInfo.photoUrl && (
            <ProfileImage
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || "Profile"}
              style={profileImageStyle}
              size={128}
              accentColor={isAurora ? "#ffffff" : theme.accent}
              className="mx-auto mb-6 sm:mb-8 shadow-2xl"
            />
          )}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 ${headingClass} ${isAurora ? 'text-white' : 'text-foreground'}`}
          >
            {personalInfo.fullName || "Your Name"}
          </h1>
          {personalInfo.tagline && (
            <p
              className={`text-xl md:text-2xl font-medium mb-6 ${isAurora ? 'text-indigo-100' : ''}`}
              style={!isAurora ? { color: theme.accent } : undefined}
            >
              {personalInfo.tagline}
            </p>
          )}
          
          {availabilityStatus && (
            <p className={`text-sm mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${isAurora ? 'bg-white/10 text-white backdrop-blur-md border border-white/20' : 'text-foreground/60'}`}>
              <span
                className={`w-2 h-2 rounded-full ${isAurora ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'animate-pulse'}`}
                style={!isAurora ? { backgroundColor: theme.accent } : undefined}
              />
              {availabilityStatus}
            </p>
          )}

          {stats.length > 0 && (
            <div className="mb-10">
              <StatsCounter stats={stats} accentColor={isAurora ? "#ffffff" : theme.accent} isDark={isAurora} />
            </div>
          )}

          <div className="flex justify-center gap-4 flex-wrap">
            {contact.email && (
              <CTAButton
                href="#contact"
                variant={isAurora ? "secondary" : "primary"}
                accentColor={isAurora ? "#ffffff" : theme.accent}
                className={isAurora ? "!bg-white !text-indigo-600 hover:!bg-indigo-50 shadow-xl" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.querySelector("#contact");
                  if (el) {
                    const offset = 72;
                    const top = el.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
              >
                Get in Touch
              </CTAButton>
            )}
            {resumeUrl && (
              <CTAButton
                href={resumeUrl}
                variant="secondary"
                accentColor={isAurora ? "#ffffff" : theme.accent}
                className={isAurora ? "!border-white/40 !text-white hover:!bg-white/10" : ""}
                target="_blank"
                rel="noopener noreferrer"
              >
                <DownloadIcon className="w-4 h-4" />
                Download Resume
              </CTAButton>
            )}
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* About — Enhanced */}
        {(personalInfo.bio || about?.headline || about?.traits?.length > 0) && (
          <SectionWrapper id="about" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}
            >
              {about.headline || "About"}
            </h2>
            {about.quote && (
              <blockquote
                className="border-l-2 pl-4 italic text-foreground/60 mb-5"
                style={{ borderColor: theme.accent }}
              >
                &ldquo;{about.quote}&rdquo;
              </blockquote>
            )}
            {personalInfo.bio && (
              <p className="text-foreground/70 leading-relaxed whitespace-pre-line text-base sm:text-lg mb-5">
                {personalInfo.bio}
              </p>
            )}
            {about.traits?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {about.traits.map((trait, i) => (
                  <span
                    key={i}
                    className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: theme.accentSoft,
                      color: theme.accent,
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            )}
          </SectionWrapper>
        )}

        {/* Ordered Sections */}
        {orderedSections.map((key) => sectionComponents[key])}

        {/* Fallback for new sections not in old sectionOrder */}
        {!orderedSections.includes("packages") && packages.length > 0 && sectionComponents.packages}
        {!orderedSections.includes("video") && videoUrl && sectionComponents.video}
        {!orderedSections.includes("faq") && faq.length > 0 && sectionComponents.faq}

        {/* Social Links */}
        {Object.keys(socialLinks).length > 0 && (
          <SectionWrapper background="white" className="mb-16 sm:mb-20 text-center" isAurora={isAurora} accentColor={theme.accent}>
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}
            >
              Connect With Me
            </h2>
            <SocialLinks
              links={socialLinks}
              variant="row"
              accentColor={theme.accent}
              className="justify-center"
            />
          </SectionWrapper>
        )}

        {/* Contact */}
        <SectionWrapper
          id="contact"
          background="soft"
          className="text-center pt-10 border-t border-border"
          isAurora={isAurora}
          accentColor={theme.accent}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}
          >
            Let&apos;s Work Together
          </h2>
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            {contact.email && (
              <CopyEmailButton
                email={contact.email}
                theme={theme}
                className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg hover:shadow-accent/20"
              >
                Email Me
              </CopyEmailButton>
            )}
            {contact.linkedin && (
              <a
                href={
                  contact.linkedin.startsWith("http")
                    ? contact.linkedin
                    : `https://${contact.linkedin}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-border font-semibold text-sm text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all"
              >
                LinkedIn
              </a>
            )}
            {contact.website && (
              <a
                href={
                  contact.website.startsWith("http")
                    ? contact.website
                    : `https://${contact.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl border border-border font-semibold text-sm text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-all"
              >
                Website
              </a>
            )}
          </div>
          {contact.email && (
            <ContactForm
              email={contact.email}
              accentColor={theme.accent}
              className="max-w-md mx-auto"
            />
          )}
        </SectionWrapper>
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12 relative overflow-hidden">
        {isAurora && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full rounded-full blur-[100px]" 
              style={{ backgroundColor: theme.accent }}
            />
          </div>
        )}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-4 text-sm text-foreground/40 relative z-10">
          <div className="flex items-center gap-2">
            <ForgeCVLogoIcon className="w-4 h-4" />
            <span>
              Portfolio made with{" "}
              <a
                href="https://forgecv.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground/60 hover:text-accent transition-colors"
              >
                ForgeCV
              </a>
            </span>
          </div>
          {isAurora && <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">Aurora Premium Template</p>}
        </div>
      </footer>
    </div>
  );
}