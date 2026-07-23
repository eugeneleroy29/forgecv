"use client";

/**
 * SampleWorkCard — Displays a portfolio sample/work example with screenshot and caption.
 * 
 * Props:
 *   work: {
 *     title: string,
 *     category: string,      // e.g. "Admin Support", "Customer Service"
 *     image: string,         // screenshot URL
 *     description: string,
 *   }
 *   accentColor → string (hex)
 *   className   → string
 */

export default function SampleWorkCard({ work, accentColor = "#4F46E5", className = "" }) {
  const { title, category, image, description, link } = work;

  return (
    <div
      className={`bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-0.5 group ${className}`}
    >
      {/* Screenshot */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.classList.add("flex", "items-center", "justify-center");
            const fallback = document.createElement("div");
            fallback.className = "text-foreground/30 text-sm";
            fallback.textContent = "Screenshot preview";
            e.currentTarget.parentElement.appendChild(fallback);
          }}
        />
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Category tag */}
        {category && (
          <span
            className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium mb-3"
            style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
          >
            {category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold tracking-tight mb-2">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-sm text-foreground/60 leading-relaxed">{description}</p>
        )}
        {link && (
          <a
            href={link.startsWith("http") ? link : `https://${link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            View Project <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        )}
      </div>
    </div>
  );
}