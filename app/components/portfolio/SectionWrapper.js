"use client";

/**
 * SectionWrapper — Consistent section container for all portfolio templates.
 * 
 * Features:
 * - Configurable background (white, soft tint, accent tint)
 * - Consistent padding and max-width
 * - Optional section ID for anchor navigation
 * - Optional top/bottom dividers
 * - Fade-in animation on scroll (optional)
 * 
 * Props:
 *   id          → HTML id for anchor links
 *   className   → Additional classes
 *   background  → 'white' | 'soft' | 'accent' | 'dark'
 *   children    → Section content
 *   divider     → 'top' | 'bottom' | 'both' | 'none'
 *   padded      → boolean (default true)
 *   maxWidth    → 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
 */

const BG_MAP = {
  white: "bg-white",
  soft: "bg-[#FAFAF8]",
  accent: "bg-accent/5",
  dark: "bg-[#1a1a2e] text-white",
};

const MAX_WIDTH_MAP = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  full: "max-w-full",
};

export default function SectionWrapper({
  id,
  className = "",
  background = "white",
  children,
  divider = "none",
  padded = true,
  maxWidth = "2xl",
  isAurora = false,
  accentColor = "#6366f1",
}) {
  const bgClass = BG_MAP[background] || BG_MAP.white;
  const maxWClass = MAX_WIDTH_MAP[maxWidth] || MAX_WIDTH_MAP["2xl"];
  const paddingClass = padded ? "py-20 md:py-28" : "";

  return (
    <section
      id={id}
      className={`${bgClass} ${paddingClass} ${className} relative overflow-hidden`}
    >
      {/* Premium Aurora Background Effect */}
      {isAurora && background === "white" && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
          <div 
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px]" 
            style={{ backgroundColor: accentColor }}
          />
          <div 
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[100px]" 
            style={{ backgroundColor: accentColor }}
          />
        </div>
      )}
      {divider !== "none" && divider !== "bottom" && (
        <div className="w-full h-px bg-border/50" />
      )}
      <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWClass}`}>
        {children}
      </div>
      {divider !== "none" && divider !== "top" && (
        <div className="w-full h-px bg-border/50" />
      )}
    </section>
  );
}