"use client";

/**
 * StatsCounter — Displays key statistics in the hero section.
 * 
 * Props:
 *   stats: [{ label: string, value: string }]
 *   accentColor → string (hex)
 *   className   → string
 */

export default function StatsCounter({ stats = [], accentColor = "#4F46E5", className = "", isDark = false }) {
  if (!stats || stats.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-6 sm:gap-10 ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: accentColor }}
          >
            {stat.value}
          </div>
          <div className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/70' : 'text-foreground/50'}`}>{stat.label}</div>
        </div>
      ))}
    </div>
  );
}