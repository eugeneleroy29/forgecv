"use client";

/**
 * CTAButton — Consistent call-to-action button across all templates.
 * 
 * Props:
 *   variant     → 'primary' | 'secondary' | 'ghost'
 *   href        → string (optional, renders as <a> if provided)
 *   onClick     → function (optional, renders as <button>)
 *   children    → React node
 *   accentColor → string (hex)
 *   className   → string
 *   icon        → React node (optional, renders after text)
 */

const ArrowRightIcon = ({ className }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

export default function CTAButton({
  variant = "primary",
  href,
  onClick,
  children,
  accentColor = "#4F46E5",
  className = "",
  icon,
}) {
  const baseClasses =
    "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300";

  const variantClasses = {
    primary: "text-white shadow-lg hover:shadow-xl",
    secondary: "border-2 bg-transparent hover:text-white",
    ghost: "text-accent hover:bg-accent/5 px-0 py-0",
  };

  const style = {};
  if (variant === "primary") {
    style.backgroundColor = accentColor;
  } else if (variant === "secondary") {
    style.borderColor = accentColor;
    style.color = accentColor;
  } else if (variant === "ghost") {
    style.color = accentColor;
  }

  const content = (
    <>
      <span>{children}</span>
      {icon || (variant !== "ghost" && <ArrowRightIcon />)}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={style}
        onMouseEnter={(e) => {
          if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = accentColor;
            e.currentTarget.style.color = "white";
          } else if (variant === "primary") {
            e.currentTarget.style.filter = "brightness(1.1)";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "secondary") {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = accentColor;
          } else if (variant === "primary") {
            e.currentTarget.style.filter = "brightness(1)";
          }
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
      onMouseEnter={(e) => {
        if (variant === "secondary") {
          e.currentTarget.style.backgroundColor = accentColor;
          e.currentTarget.style.color = "white";
        } else if (variant === "primary") {
          e.currentTarget.style.filter = "brightness(1.1)";
        }
      }}
      onMouseLeave={(e) => {
        if (variant === "secondary") {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = accentColor;
        } else if (variant === "primary") {
          e.currentTarget.style.filter = "brightness(1)";
        }
      }}
    >
      {content}
    </button>
  );
}