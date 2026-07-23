"use client";

/**
 * VideoEmbed — Responsive video embed for YouTube (Vimeo support planned).
 * 
 * Props:
 *   url         → YouTube URL (supports watch, youtu.be, embed formats)
 *   platform    → 'youtube' | 'vimeo' (default: 'youtube')
 *   title       → string (for accessibility)
 *   className   → string
 */

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // raw ID
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function VideoEmbed({ url, platform = "youtube", title = "Video introduction", className = "" }) {
  const videoId = platform === "youtube" ? extractYouTubeId(url) : null;

  if (!videoId) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full rounded-2xl border border-border shadow-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}