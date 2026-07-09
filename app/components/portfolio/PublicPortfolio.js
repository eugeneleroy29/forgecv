import { getPortfolioTheme } from "./portfolioThemes";
import { TOOLS_CATALOG } from "./toolsCatalog";
import BrandIcon from "./BrandIcon";

export default function PublicPortfolio({ portfolio }) {
  const theme = getPortfolioTheme(portfolio.template);
  const content = portfolio.content || {};
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
      "portfolioItems",
      "testimonials",
    ];
    const orderedSections =
      content.sectionOrder && content.sectionOrder.length > 0
        ? content.sectionOrder
        : DEFAULT_SECTION_ORDER;

    const sectionMap = {
      services: services.length > 0 && (
        <section key="services" className="mb-16">
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>
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
        <section key="tools" className="mb-16">
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
        <section key="experience" className="mb-16">
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>
            Experience
          </h2>
          <div className="flex flex-col gap-6">
            {experience.map((exp) => (
              <div key={exp.id} className="border-l-2 pl-4" style={{ borderColor: theme.accent }}>
                <h3 className="font-semibold">{exp.jobTitle}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  {exp.company} · {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                </p>
                <p className="text-sm text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      ),
      portfolioItems: portfolioItems.length > 0 && (
        <section key="portfolioItems" className="mb-16">
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>
            Portfolio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                {item.link && (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline" style={{ color: theme.accent }}>
                    View sample →
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      ),
      testimonials: testimonials.length > 0 && (
        <section key="testimonials" className="mb-16">
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>
            What Clients Say
          </h2>
          <div className="flex flex-col gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-xl p-5" style={{ backgroundColor: theme.accentSoft }}>
                <p className="text-gray-700 italic mb-3">&ldquo;{t.quote}&rdquo;</p>
                <p className="text-sm font-medium">
                  {t.name}
                  {t.role && <span className="text-gray-500 font-normal"> · {t.role}</span>}
                </p>
              </div>
            ))}
          </div>
        </section>
      ),
    };

    return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="px-6 py-20 text-center"
        style={{ backgroundColor: theme.accentSoft }}
      >
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || "Profile"}
            className="w-28 h-28 rounded-full object-cover mx-auto mb-6 border-4 border-white shadow-md"
          />
        )}
        <h1 className={`text-4xl md:text-5xl font-bold mb-3 ${headingClass}`}>
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
          <a href={`mailto:${contact.email}`}
            className="inline-block px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: theme.accent }}
          >
            Get in Touch
          </a>
        )}
      </section>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* Bio */}
        {personalInfo.bio && (
          <section className="mb-16">
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

        {/* Skills & Tools Icon Grid */}
        {skillsToolsByCategory.length > 0 && (
          <section className="mb-16">
            <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>
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
        )}

        {/* Contact */}
        <section className="text-center pt-8 border-t border-gray-200">
          <h2 className={`text-2xl font-semibold mb-4 ${headingClass}`}>
            Let&apos;s Work Together
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {contact.email && (
              <a href={`mailto:${contact.email}`}
                className="px-5 py-2.5 rounded-lg text-white font-medium text-sm"
                style={{ backgroundColor: theme.accent }}
              >
                Email Me
              </a>
            )}
            {contact.linkedin && (
              <a href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg border border-gray-300 font-medium text-sm hover:border-gray-400"
              >
                LinkedIn
              </a>
            )}
            {contact.website && (
              <a href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
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