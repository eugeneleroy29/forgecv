"use client";

import { getPortfolioTheme } from "./portfolioThemes";
import { getPhotoShape } from "../resume/resumeHelpers";
import { TOOLS_CATALOG } from "./toolsCatalog";
import BrandIcon from "./BrandIcon";
import PortfolioNavbar from "./PortfolioNavbar";

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
  // Force a light, soft tint: same hue, low-medium saturation, high lightness.
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

  const sectionMap = {
    services: services.length > 0 && (
      <section key="services" id="services" className="mb-16">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${headingClass}`}>
          Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div key={s.id} className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold mb-2">{s.name}</h3>
              <p className="text-sm text-gray-600">{s.description}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    tools: tools.length > 0 && (
      <section key="tools" id="tools" className="mb-16">
        <h2 className={`text-2xl font-semibold mb-4 ${headingClass}`}>
          Tools & Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <span
              key={tool}
              className="text-sm px-3 py-1.5 rounded-full font-medium"
              style={{ backgroundColor: theme.accentSoft, color: theme.accent }}
            >
              {tool}
            </span>
          ))}
        </div>
      </section>
    ),
    experience: experience.length > 0 && (
      <section key="experience" id="experience" className="mb-16">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${headingClass}`}>
          Experience
        </h2>
        <div className="flex flex-col gap-6">
          {experience.map((exp) => (
            <div
              key={exp.id}
              className="border-l-2 pl-4"
              style={{ borderColor: theme.accent }}
            >
              <h3 className="font-semibold">{exp.jobTitle}</h3>
              <p className="text-sm text-gray-500 mb-2">
                {exp.company} · {exp.startDate} —{" "}
                {exp.current ? "Present" : exp.endDate}
              </p>
              <p className="text-sm text-gray-700">{exp.description}</p>
            </div>
          ))}
        </div>
      </section>
    ),
    portfolioItems: portfolioItems.length > 0 && (
      <section key="portfolioItems" id="portfolio" className="mb-16">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${headingClass}`}>
          Portfolio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-5"
            >
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:underline"
                  style={{ color: theme.accent }}
                >
                  View sample →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    ),
    skillsTools: skillsToolsByCategory.length > 0 && (
      <section key="skillsTools" className="mb-16">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${headingClass}`}>
          Skills & Tools I Use
        </h2>
        <div className="flex flex-col gap-5">
          {skillsToolsByCategory.map((category) => (
            <div key={category.id}>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                {category.label}
              </h3>
              <div className="flex flex-wrap gap-3">
                {category.selected.map((tool, i) => (
                  <span
                    key={`${tool.name}-${i}`}
                    className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {tool.type === "catalog" ? (
                      <BrandIcon slug={tool.slug} size={16} />
                    ) : (
                      <img src={tool.iconUrl} alt="" className="w-4 h-4" />
                    )}
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
    customSections: (content.customSections || []).some((s) =>
      s.items?.some((item) => item.text?.trim()),
    ) && (
      <section key="customSections" className="mb-16">
        {(content.customSections || [])
          .filter((section) => section.items?.some((item) => item.text?.trim()))
          .map((section) => (
            <div key={section.id} className="mb-10 last:mb-0">
              <h2 className={`text-2xl font-semibold mb-4 ${headingClass}`}>
                {section.title}
              </h2>
              <ul className="list-disc list-inside flex flex-col gap-2 text-gray-700">
                {section.items
                  .filter((item) => item.text?.trim())
                  .map((item) => (
                    <li key={item.id}>{item.text}</li>
                  ))}
              </ul>
            </div>
          ))}
      </section>
    ),
    testimonials: testimonials.length > 0 && (
      <section key="testimonials" id="testimonials" className="mb-16">
        <h2 className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${headingClass}`}>
          What Clients Say
        </h2>
        <div className="flex flex-col gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="rounded-xl p-5"
              style={{ backgroundColor: theme.accentSoft }}
            >
              <p className="text-gray-700 italic mb-3">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="text-sm font-medium">
                {t.name}
                {t.role && (
                  <span className="text-gray-500 font-normal"> · {t.role}</span>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>
    ),
  };

  return (
    <div className="min-h-screen bg-white">
      <PortfolioNavbar content={content} theme={theme} />
      {/* Hero */}
      <section
        id="hero"
        className="px-4 sm:px-6 py-16 sm:py-20 text-center"
        style={{ backgroundColor: theme.accentSoft }}
      >
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || "Profile"}
            className={`w-24 h-24 sm:w-28 sm:h-28 object-cover mx-auto mb-4 sm:mb-6 border-4 border-white shadow-md ${
              getPhotoShape(portfolio?.content) === 'circle' ? 'rounded-full'
              : getPhotoShape(portfolio?.content) === 'rounded' ? 'rounded-lg'
              : 'rounded-none'
            }`}
          />
        )}
        <h1
          className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-3 ${headingClass}`}
        >
          {personalInfo.fullName || "Your Name"}
        </h1>
        {personalInfo.tagline && (
          <p
            className="text-lg md:text-xl font-medium mb-6"
            style={{ color: theme.accent }}
          >
            {personalInfo.tagline}
          </p>
        )}
        {contact.email && (
          <a href="#contact"
            onClick={(e) => {
              e.preventDefault();
              const el = document.querySelector('#contact');
              if (el) {
                const offset = 72;
                const top = el.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
              }
            }}
            className="inline-block px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: theme.accent }}
          >
            Get in Touch
          </a>
        )}
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Bio */}
        {personalInfo.bio && (
          <section id="about" className="mb-16">
            <h2 className={`text-2xl font-semibold mb-4 ${headingClass}`}>
              About
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {personalInfo.bio}
            </p>
          </section>
        )}

        {/* Ordered, reorderable sections */}
        {orderedSections.map((key) => sectionMap[key])}

        {/* Contact */}
        <section id="contact" className="text-center pt-8 border-t border-gray-200">
          <h2 className={`text-xl sm:text-2xl font-semibold mb-4 ${headingClass}`}>
            Let&apos;s Work Together
          </h2>
          <div className="flex justify-center gap-3 sm:gap-4 flex-wrap">
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="px-5 py-2.5 rounded-lg text-white font-medium text-sm"
                style={{ backgroundColor: theme.accent }}
              >
                Email Me
              </a>
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
                className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium text-sm hover:border-gray-400"
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
                className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium text-sm hover:border-gray-400"
              >
                Website
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
