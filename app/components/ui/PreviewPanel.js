"use client";

import { useState, useRef, useEffect } from "react";
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, ExternalLink, X } from "lucide-react";

const DEVICE_WIDTHS = {
  desktop: null,   // full width of container
  tablet: 768,
  mobile: 375,
};

const ZOOM_LEVELS = [0.4, 0.5, 0.6, 0.75, 0.9, 1];

export default function PreviewPanel({
  children,
  type = "resume", // "resume" | "portfolio"
  title = "Preview",
  externalLink = null,
  className = "",
}) {
  const [device, setDevice] = useState("desktop");
  const [zoomIndex, setZoomIndex] = useState(type === "resume" ? 1 : 2); // default 50% for resume, 60% for portfolio
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const deviceWidth = DEVICE_WIDTHS[device];

  // Measure container width for auto-scaling
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-fit: if content width * zoom > container width, suggest lower zoom
  const contentWidth = deviceWidth || (type === "resume" ? 816 : 1200); // 816px = 8.5in
  const scaledWidth = contentWidth * zoom;
  const needsScroll = scaledWidth > containerWidth - 32; // 32px padding

  const zoomIn = () => setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  const zoomOut = () => setZoomIndex((i) => Math.max(i - 1, 0));

  const DeviceIcon = ({ d }) => {
    if (d === "desktop") return <Monitor size={16} />;
    if (d === "tablet") return <Tablet size={16} />;
    return <Smartphone size={16} />;
  };

  // Fullscreen modal content
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-100 bg-black/80 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
          <h3 className="font-semibold text-sm">{title} — Fullscreen Preview</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-lg p-1 gap-1">
              {Object.keys(DEVICE_WIDTHS).map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`p-1.5 rounded-md transition-colors ${
                    device === d ? "bg-background shadow-sm" : "text-foreground/40 hover:text-foreground"
                  }`}
                  title={d.charAt(0).toUpperCase() + d.slice(1)}
                >
                  <DeviceIcon d={d} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button onClick={zoomOut} disabled={zoomIndex === 0} className="p-1.5 rounded-md hover:bg-background disabled:opacity-30">
                <ZoomOut size={14} />
              </button>
              <span className="text-xs font-medium w-10 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={zoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} className="p-1.5 rounded-md hover:bg-background disabled:opacity-30">
                <ZoomIn size={14} />
              </button>
            </div>
            {externalLink && (
              <a
                href={externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-muted text-foreground/60 hover:text-foreground"
                title="Open in new tab"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded-md hover:bg-muted text-foreground/60 hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto flex items-start justify-center p-8">
          <div
            style={{
              width: deviceWidth ? `${deviceWidth}px` : "100%",
              maxWidth: "100%",
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`} ref={containerRef}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border rounded-t-xl">
        <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          {/* Device toggles (portfolio only, or all for resume too) */}
          <div className="flex items-center bg-background rounded-lg p-0.5 gap-0.5 border border-border">
            {Object.keys(DEVICE_WIDTHS).map((d) => (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`p-1 rounded-md transition-colors ${
                  device === d ? "bg-accent/10 text-accent" : "text-foreground/40 hover:text-foreground"
                }`}
                title={d.charAt(0).toUpperCase() + d.slice(1)}
              >
                <DeviceIcon d={d} />
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-border">
            <button onClick={zoomOut} disabled={zoomIndex === 0} className="p-1 rounded-md hover:bg-muted disabled:opacity-30">
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] font-medium w-8 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={zoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} className="p-1 rounded-md hover:bg-muted disabled:opacity-30">
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-1 rounded-md hover:bg-background text-foreground/40 hover:text-foreground border border-border"
            title="Fullscreen preview"
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Scroll hint */}
      {needsScroll && device !== "desktop" && (
        <div className="px-3 py-1 bg-amber-50 border-b border-amber-200 text-[10px] text-amber-700 text-center">
          Content wider than panel — scroll horizontally or zoom out
        </div>
      )}

      {/* Preview viewport */}
      <div className="flex-1 overflow-auto bg-[#f0f0f0] rounded-b-xl relative" style={{ minHeight: "400px" }}>
        <div className="absolute inset-0 flex items-start justify-center p-4">
          <div
            className="bg-white shadow-lg"
            style={{
              width: deviceWidth ? `${deviceWidth}px` : type === "resume" ? "816px" : "100%",
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}