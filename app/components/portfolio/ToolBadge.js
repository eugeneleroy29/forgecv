"use client";

/**
 * ToolBadge — Displays a tool/platform with icon and name.
 * Used in categorized tool grids.
 * 
 * Props:
 *   tool: { name: string, category?: string, icon?: string, iconUrl?: string }
 *   accentColor → string (hex)
 *   className   → string
 */

export default function ToolBadge({ tool, accentColor = "#4F46E5", className = "" }) {
  const { name, icon, iconUrl } = tool;

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:border-accent/30 hover:shadow-sm transition-all duration-200 ${className}`}
    >
      {iconUrl ? (
        <img
          src={iconUrl}
          alt={name}
          className="w-5 h-5 object-contain"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      ) : icon ? (
        <span className="text-base">{icon}</span>
      ) : (
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: accentColor }}
        >
          {(name || "?").charAt(0).toUpperCase()}
        </span>
      )}
      <span className="text-sm font-medium text-foreground/80">{name}</span>
    </div>
  );
}