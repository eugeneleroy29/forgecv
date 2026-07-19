"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Info } from "lucide-react";

const PAGE_WIDTH = 816;

export default function CoverLetterPreviewPanel({ children, title = "Cover Letter Preview", className = "" }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(0.6);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const fit = () => {
      if (!wrapperRef.current) return;
      const panelWidth = wrapperRef.current.clientWidth - 24;
      const newScale = Math.min(1, panelWidth / PAGE_WIDTH);
      setScale(newScale);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const toolbar = (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-x border-t border-border rounded-t-xl">
      <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{title}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-foreground/40">{Math.round(scale * 100)}% fit</span>
        <button
          onClick={() => setIsFullscreen((v) => !v)}
          className="p-1 rounded-md hover:bg-background text-foreground/40 hover:text-foreground border border-border"
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>
    </div>
  );

  const previewBody = (
    <div
      className="overflow-auto bg-[#e5e5e5] rounded-b-xl border-x border-b border-border"
      style={{ height: isFullscreen ? "calc(100vh - 48px)" : "100%" }}
      ref={wrapperRef}
    >
      <div className="py-3 px-3 flex flex-col items-center gap-2">
        <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 bg-background/80 px-2.5 py-1 rounded-full border border-border">
          <Info size={10} />
          Live preview — actual print output may vary slightly
        </div>
        <div style={{ width: PAGE_WIDTH * scale, overflow: "hidden" }}>
          <div
            style={{
              width: PAGE_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              background: "white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  const fullscreenContent = (
    <div className="fixed inset-0 bg-black/90 flex flex-col" style={{ zIndex: 9999 }}>
      {toolbar}
      {previewBody}
    </div>
  );

  return (
    <>
      <div className={`flex flex-col h-full ${className}`}>
        {toolbar}
        {previewBody}
      </div>
      {isFullscreen && typeof document !== "undefined" && createPortal(fullscreenContent, document.body)}
    </>
  );
}