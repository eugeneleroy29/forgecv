"use client";

/**
 * PricingCard — Displays a pricing package/tier.
 * 
 * Props:
 *   package: {
 *     name: string,            // "Starter", "Growth", "Pro"
 *     price: string,           // "$120–$200"
 *     billing: string,         // "per week · 20–25 hrs"
 *     features: string[],      // included features
 *     isPopular: boolean,      // "Most Popular" badge
 *     ctaText: string,         // "Book This Plan"
 *     ctaHref: string,         // link or mailto
 *   }
 *   accentColor → string (hex)
 *   className   → string
 */

const CheckIcon = ({ className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

export default function PricingCard({ package: pkg, accentColor = "#4F46E5", className = "" }) {
  const { name, price, billing, features, isPopular, ctaText, ctaHref } = pkg;

  const cardContent = (
    <div
      className={`relative bg-card border rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 ${className}`}
      style={{
        borderColor: isPopular ? accentColor : undefined,
        borderWidth: isPopular ? "2px" : "1px",
      }}
    >
      {/* Popular badge */}
      {isPopular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-white shadow-md"
          style={{ backgroundColor: accentColor }}
        >
          Most Popular
        </div>
      )}

      {/* Package name */}
      <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-2">
        {name}
      </p>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl sm:text-4xl font-bold tracking-tight">{price}</span>
      </div>

      {/* Billing period */}
      {billing && (
        <p className="text-sm text-foreground/50 mb-6">{billing}</p>
      )}

      {/* CTA Button */}
      <a
        href={ctaHref || "#contact"}
        className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-300 mb-6"
        style={{
          backgroundColor: isPopular ? accentColor : "transparent",
          color: isPopular ? "white" : accentColor,
          border: isPopular ? "none" : `2px solid ${accentColor}`,
        }}
        onMouseEnter={(e) => {
          if (!isPopular) {
            e.currentTarget.style.backgroundColor = accentColor;
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (!isPopular) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = accentColor;
          }
        }}
      >
        <span className="inline-flex items-center gap-2">
          {ctaText || "Get Started"}
          <ArrowRightIcon />
        </span>
      </a>

      {/* Divider */}
      <div className="h-px bg-border mb-6" />

      {/* Features */}
      {features && features.length > 0 && (
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-foreground/70">
              <CheckIcon className="shrink-0 mt-0.5" style={{ color: accentColor }} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return cardContent;
}