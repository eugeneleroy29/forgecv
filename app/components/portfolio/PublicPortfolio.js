"use client";

import { useState } from "react";
import { getPortfolioTheme } from "./portfolioThemes";
import { getPhotoShape } from "../resume/resumeHelpers";
import { TOOLS_CATALOG } from "./toolsCatalog";
import BrandIcon from "./BrandIcon";
import PortfolioNavbar from "./PortfolioNavbar";

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

function ServicesSection({ services, theme, headingClass }) {
  if (!services.length) return null;
  return (
    <section key="services" id="services" className="mb-16 sm:mb-20">
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
          >
            <h3 className="font-semibold text-foreground mb-2">{s.name}</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              {s.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ToolsSection({ tools, theme, headingClass }) {
  if (!tools.length) return null;
  return (
    <section key="tools" id="tools" className="mb-16 sm:mb-20">
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Tools &amp; Skills
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {tools.map((tool) => (
          <span
            key={tool}
            className="text-sm px-3.5 py-1.5 rounded-full font-medium transition-transform hover:scale-105"
            style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
          >
            {tool}
          </span>
        ))}
      </div>
    </section>
  );
}

function ExperienceSection({ experience, theme, headingClass }) {
  if (!experience.length) return null;
  return (
    <section key="experience" id="experience" className="mb-16 sm:mb-20">
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
    </section>
  );
}

function PortfolioItemsSection({ portfolioItems, theme, headingClass }) {
  if (!portfolioItems.length) return null;
  return (
    <section key="portfolioItems" id="portfolio" className="mb-16 sm:mb-20">
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        Portfolio
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {portfolioItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
          >
            <h3 className="font-semibold text-foreground mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-foreground/60 leading-relaxed mb-4">
              {item.description}
            </p>
            {item.link && (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:gap-2"
                style={{ color: theme.accent }}
              >
                View sample
                <ArrowRightIcon className="w-4 h-4 transition-all group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function SkillsToolsSection({ skillsToolsByCategory, headingClass }) {
  if (!skillsToolsByCategory.length) return null;
  return (
    <section key="skillsTools" className="mb-16 sm:mb-20">
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
    </section>
  );
}

function CustomSectionsSection({ customSections, headingClass }) {
  const validSections = (customSections || []).filter((section) =>
    section.items?.some((item) => item.text?.trim()),
  );
  if (!validSections.length) return null;

  return (
    <section key="customSections" className="mb-16 sm:mb-20">
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
    </section>
  );
}

function TestimonialsSection({ testimonials, theme, headingClass }) {
  if (!testimonials.length) return null;
  return (
    <section key="testimonials" id="testimonials" className="mb-16 sm:mb-20">
      <h2
        className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}
      >
        What Clients Say
      </h2>
      <div className="flex flex-col gap-5">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl p-6 border border-transparent"
            style={{ backgroundColor: theme.accentSoft }}
          >
            <QuoteIcon
              className="w-5 h-5 mb-3 opacity-40"
              style={{ color: theme.accent }}
            />
            <p className="text-foreground/80 italic leading-relaxed mb-4">
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="text-sm font-semibold text-foreground">
              {t.name}
              {t.role && (
                <span className="text-foreground/50 font-normal">
                  {" "}
                  · {t.role}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PublicPortfolio({ portfolio }) {
  const baseTheme = getPortfolioTheme(portfolio.template);
  const content = portfolio.content || {};
  const customization = content.customization || {};
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
      />
    ),
    tools: (
      <ToolsSection key="tools" tools={tools} theme={theme} headingClass={headingClass} />
    ),
    experience: (
      <ExperienceSection
        key="experience"
        experience={experience}
        theme={theme}
        headingClass={headingClass}
      />
    ),
    portfolioItems: (
      <PortfolioItemsSection
        key="portfolioItems"
        portfolioItems={portfolioItems}
        theme={theme}
        headingClass={headingClass}
      />
    ),
    skillsTools: (
      <SkillsToolsSection
        key="skillsTools"
        skillsToolsByCategory={skillsToolsByCategory}
        headingClass={headingClass}
      />
    ),
    customSections: (
      <CustomSectionsSection
        key="customSections"
        customSections={content.customSections}
        headingClass={headingClass}
      />
    ),
    testimonials: (
      <TestimonialsSection
        key="testimonials"
        testimonials={testimonials}
        theme={theme}
        headingClass={headingClass}
      />
    ),
  };

  const photoShape = getPhotoShape(portfolio?.content);
  const photoShapeClass =
    photoShape === "circle"
      ? "rounded-full"
      : photoShape === "rounded"
        ? "rounded-2xl"
        : "rounded-none";

  return (
    <div className="min-h-screen bg-background">
      <PortfolioNavbar content={content} theme={theme} />

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section
        id="hero"
        className="px-4 sm:px-6 py-16 sm:py-24 text-center"
        style={{ backgroundColor: theme.accentSoft }}
      >
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || "Profile"}
            className={`w-24 h-24 sm:w-28 sm:h-28 object-cover mx-auto mb-5 sm:mb-6 border-4 border-white shadow-lg ${photoShapeClass}`}
            style={{
              boxShadow: `0 10px 40px -10px ${theme.accent}40`,
            }}
          />
        )}
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3 ${headingClass}`}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.tagline && (
          <p
            className="text-lg md:text-xl font-medium mb-8"
            style={{ color: theme.accent }}
          >
            {personalInfo.tagline}
          </p>
        )}
        {contact.email && (
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector("#contact");
              if (el) {
                const offset = 72;
                const top =
                  el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 hover:shadow-lg hover:shadow-accent/20"
            style={{ backgroundColor: theme.accent }}
          >
            Get in Touch
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        )}
      </section>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
        {/* Bio */}
        {personalInfo.bio && (
          <section id="about" className="mb-16 sm:mb-20">
            <h2
              className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}
            >
              About
            </h2>
            <p className="text-foreground/70 leading-relaxed whitespace-pre-line text-base sm:text-lg">
              {personalInfo.bio}
            </p>
          </section>
        )}

        {/* Ordered Sections */}
        {orderedSections.map((key) => sectionComponents[key])}

        {/* Contact */}
        <section
          id="contact"
          className="text-center pt-10 border-t border-border"
        >
          <h2
            className={`text-xl sm:text-2xl font-bold tracking-tight mb-5 sm:mb-6 ${headingClass}`}
          >
            Let&apos;s Work Together
          </h2>
          <div className="flex justify-center gap-3 flex-wrap">
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
        </section>
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-center gap-2 text-sm text-foreground/40">
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
      </footer>
    </div>
  );
}