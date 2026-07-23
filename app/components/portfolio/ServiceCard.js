"use client";

/**
 * ServiceCard — Displays a single service with icon, title, price, and features.
 * 
 * Props:
 *   service: {
 *     name: string,
 *     description: string,
 *     priceRange: string,      // e.g. "$5 – $7 / hour"
 *     features: string[],        // bullet list
 *     icon: string,            // emoji or icon name
 *   }
 *   accentColor → string (hex)
 *   className   → string
 */

const CheckIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default function ServiceCard({ service, accentColor = "#4F46E5", className = "" }) {
  const { name, description, priceRange, features, icon } = service;

  return (
    <div
      className={`bg-card border border-border rounded-2xl p-6 sm:p-8 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-0.5 group ${className}`}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-5 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        {icon || "✦"}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold tracking-tight mb-2">{name}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-foreground/60 leading-relaxed mb-4">{description}</p>
      )}

      {/* Price */}
      {priceRange && (
        <div
          className="inline-block px-3 py-1.5 rounded-lg text-sm font-semibold mb-5"
          style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
        >
          {priceRange}
        </div>
      )}

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="space-y-2.5">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/70">
              <CheckIcon className="shrink-0 mt-0.5" style={{ color: accentColor }} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}