"use client";

/**
 * ProfileImage — Reusable creative profile image shapes for portfolio templates.
 * 
 * Supported styles:
 * - circle        → Classic circular crop
 * - rounded-square → Rounded rectangle
 * - blob          → Organic fluid shape via SVG clipPath
 * - hexagon       → 6-sided geometric shape
 * - squircle      → Superellipse (iOS-style rounded square)
 * - soft-diamond  → Rotated square with rounded corners
 * - layered-frames → Multiple offset border frames
 * - floating-portrait → Slight rotation + soft shadow for editorial feel
 * - editorial     → Full-bleed portrait with minimal border
 * - abstract      → Custom artistic mask (asymmetric)
 * 
 * Usage:
 *   <ProfileImage src="/photo.jpg" style="blob" size={200} accentColor="#4F46E5" />
 */

const PROFILE_IMAGE_STYLES = [
  { id: "circle", label: "Circle" },
  { id: "rounded-square", label: "Rounded Square" },
  { id: "blob", label: "Organic Blob" },
  { id: "hexagon", label: "Hexagon" },
  { id: "squircle", label: "Squircle" },
  { id: "soft-diamond", label: "Soft Diamond" },
  { id: "layered-frames", label: "Layered Frames" },
  { id: "floating-portrait", label: "Floating Portrait" },
  { id: "editorial", label: "Editorial Style" },
  { id: "abstract", label: "Abstract Shape" },
];

export function getProfileImageStyles() {
  return PROFILE_IMAGE_STYLES;
}

export default function ProfileImage({
  src,
  alt = "Profile photo",
  style = "circle",
  size = 200,
  accentColor = "#4F46E5",
  className = "",
}) {
  const sizePx = typeof size === "number" ? `${size}px` : size;

  const baseImage = (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      style={{ display: "block" }}
    />
  );

  // ─── Style: Circle ──────────────────────────────────────────────────────
  if (style === "circle") {
    return (
      <div
        className={`rounded-full overflow-hidden border-4 border-white shadow-xl ${className}`}
        style={{ width: sizePx, height: sizePx }}
      >
        {baseImage}
      </div>
    );
  }

  // ─── Style: Rounded Square ────────────────────────────────────────────
  if (style === "rounded-square") {
    return (
      <div
        className={`overflow-hidden border-4 border-white shadow-xl ${className}`}
        style={{ width: sizePx, height: sizePx, borderRadius: "24px" }}
      >
        {baseImage}
      </div>
    );
  }

  // ─── Style: Blob ────────────────────────────────────────────────────────
  if (style === "blob") {
    const blobPath =
      "M440.5,320.5Q418,391,355.5,442.5Q293,494,226,450.5Q159,407,99,339Q39,271,68.5,197.5Q98,124,166.5,82.5Q235,41,307,68.5Q379,96,430,163Q481,230,440.5,320.5Z";
    return (
      <div className={className} style={{ width: sizePx, height: sizePx }}>
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))" }}
        >
          <defs>
            <clipPath id={`blob-clip-${size}`}>
              <path d={blobPath} />
            </clipPath>
          </defs>
          <image
            href={src}
            width="500"
            height="500"
            clipPath={`url(#blob-clip-${size})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
      </div>
    );
  }

  // ─── Style: Hexagon ─────────────────────────────────────────────────────
  if (style === "hexagon") {
    return (
      <div className={className} style={{ width: sizePx, height: sizePx }}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))" }}
        >
          <defs>
            <clipPath id={`hex-clip-${size}`}>
              <polygon points="50,2 95,25 95,75 50,98 5,75 5,25" />
            </clipPath>
          </defs>
          <image
            href={src}
            width="100"
            height="100"
            clipPath={`url(#hex-clip-${size})`}
            preserveAspectRatio="xMidYMid slice"
          />
          <polygon
            points="50,2 95,25 95,75 50,98 5,75 5,25"
            fill="none"
            stroke={accentColor}
            strokeWidth="1.5"
            opacity="0.3"
          />
        </svg>
      </div>
    );
  }

  // ─── Style: Squircle ────────────────────────────────────────────────────
  if (style === "squircle") {
    return (
      <div
        className={`overflow-hidden shadow-xl ${className}`}
        style={{
          width: sizePx,
          height: sizePx,
          borderRadius: "30%",
          border: "4px solid white",
        }}
      >
        {baseImage}
      </div>
    );
  }

  // ─── Style: Soft Diamond ────────────────────────────────────────────────
  if (style === "soft-diamond") {
    return (
      <div
        className={`overflow-hidden shadow-xl ${className}`}
        style={{
          width: sizePx,
          height: sizePx,
          borderRadius: "20%",
          transform: "rotate(45deg)",
          border: "4px solid white",
        }}
      >
        <div
          className="w-full h-full"
          style={{ transform: "rotate(-45deg) scale(1.42)" }}
        >
          {baseImage}
        </div>
      </div>
    );
  }

  // ─── Style: Layered Frames ──────────────────────────────────────────────
  if (style === "layered-frames") {
    const offset = typeof size === "number" ? size * 0.08 : 16;
    return (
      <div className={`relative ${className}`} style={{ width: sizePx, height: sizePx }}>
        <div
          className="absolute rounded-2xl"
          style={{
            width: sizePx,
            height: sizePx,
            top: offset,
            left: offset,
            backgroundColor: accentColor,
            opacity: 0.15,
          }}
        />
        <div
          className="absolute rounded-2xl"
          style={{
            width: sizePx,
            height: sizePx,
            top: offset / 2,
            left: offset / 2,
            backgroundColor: accentColor,
            opacity: 0.3,
          }}
        />
        <div
          className="absolute rounded-2xl overflow-hidden border-4 border-white shadow-xl"
          style={{ width: sizePx, height: sizePx, top: 0, left: 0 }}
        >
          {baseImage}
        </div>
      </div>
    );
  }

  // ─── Style: Floating Portrait ───────────────────────────────────────────
  if (style === "floating-portrait") {
    return (
      <div
        className={`relative ${className}`}
        style={{ width: sizePx, height: sizePx }}
      >
        <div
          className="absolute inset-0 rounded-full opacity-20"
          style={{
            backgroundColor: accentColor,
            transform: "scale(1.15) translateY(8px)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-2xl"
          style={{ transform: "rotate(-3deg)" }}
        >
          {baseImage}
        </div>
      </div>
    );
  }

  // ─── Style: Editorial ───────────────────────────────────────────────────
  if (style === "editorial") {
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{
          width: sizePx,
          height: typeof size === "number" ? size * 1.25 : "250px",
          borderRadius: "4px",
        }}
      >
        {baseImage}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)",
          }}
        />
        <div
          className="absolute inset-0 border-2 border-white/20"
          style={{ borderRadius: "4px" }}
        />
      </div>
    );
  }

  // ─── Style: Abstract ────────────────────────────────────────────────────
  if (style === "abstract") {
    const abstractPath =
      "M0,0 C150,0 150,100 300,100 C450,100 450,0 600,0 L600,800 L0,800 Z";
    return (
      <div className={className} style={{ width: sizePx, height: sizePx }}>
        <svg
          viewBox="0 0 600 800"
          className="w-full h-full"
          style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))" }}
        >
          <defs>
            <clipPath id={`abstract-clip-${size}`}>
              <path d={abstractPath} />
            </clipPath>
          </defs>
          <image
            href={src}
            width="600"
            height="800"
            clipPath={`url(#abstract-clip-${size})`}
            preserveAspectRatio="xMidYMid slice"
          />
        </svg>
      </div>
    );
  }

  // ─── Fallback: Circle ───────────────────────────────────────────────────
  return (
    <div
      className={`rounded-full overflow-hidden border-4 border-white shadow-xl ${className}`}
      style={{ width: sizePx, height: sizePx }}
    >
      {baseImage}
    </div>
  );
}