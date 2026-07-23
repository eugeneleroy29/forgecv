"use client";

/**
 * TestimonialCard — Client testimonial with quote, author, and optional avatar.
 * 
 * Props:
 *   testimonial: {
 *     quote: string,
 *     author: string,
 *     role: string,
 *     avatar?: string,
 *   }
 *   accentColor → string (hex)
 *   className   → string
 */

const QuoteIcon = ({ className }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
  </svg>
);

export default function TestimonialCard({ testimonial, accentColor = "#4F46E5", className = "" }) {
  const { quote, name, author: authorProp, role, avatar } = testimonial;
  const author = authorProp || name || "";

  return (
    <div
      className={`bg-card border border-border rounded-2xl p-6 sm:p-8 relative hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 ${className}`}
    >
      {/* Quote icon */}
      <QuoteIcon
        className="mb-4 opacity-20"
        style={{ color: accentColor }}
      />

      {/* Quote text */}
      <blockquote className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-6 italic">
        "{quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={author || "Author"}
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            {(author || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold">{author || "Anonymous"}</p>
          {role && <p className="text-xs text-foreground/50">{role}</p>}
        </div>
      </div>
    </div>
  );
}