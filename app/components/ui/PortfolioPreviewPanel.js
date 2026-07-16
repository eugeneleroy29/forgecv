"use client";

import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, ExternalLink, Smartphone } from "lucide-react";

const MOBILE_WIDTH = 375;

export default function PortfolioPreviewPanel({
  children,
  title = "Portfolio Preview",
  externalLink = null,
  className = "",
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [srcdoc, setSrcdoc] = useState("");
  const wrapperRef = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    if (!captureRef.current) return;
    const timer = setTimeout(() => {
      const html = captureRef.current.innerHTML;
      let allCss = "";
      try {
        allCss = Array.from(document.styleSheets)
          .map((s) => { try { return Array.from(s.cssRules).map((r) => r.cssText).join("\n"); } catch (e) { return ""; } })
          .join("\n");
      } catch (e) {}
      const inlineCss = Array.from(document.querySelectorAll("style")).map((el) => el.textContent).join("\n");
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((el) => `<link rel="stylesheet" href="${el.href}" />`).join("\n");

      setSrcdoc(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=${MOBILE_WIDTH}, initial-scale=1">${links}<style>${allCss}${inlineCss}html,body{margin:0;padding:0}body{background:white}</style></head><body>${html}</body></html>`
      );
    }, 100);
    return () => clearTimeout(timer);
  }, [children]);

  useEffect(() => {
    const fit = () => {
      if (!wrapperRef.current) return;
      const panelWidth = wrapperRef.current.clientWidth - 24;
      const newScale = Math.min(1, panelWidth / MOBILE_WIDTH);
      setScale(newScale);
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const toolbar = (
    <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-x border-t border-border rounded-t-xl">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">{title}</span>
        <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
          <Smartphone size={10} /> Mobile
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-foreground/40">{Math.round(scale * 100)}% fit</span>
        {externalLink && (
          <a href={externalLink} target="_blank" rel="noopener noreferrer" className="text-[10px] font-medium text-accent hover:underline flex items-center gap-1">
            Open live <ExternalLink size={10} />
          </a>
        )}
        <button onClick={() => setIsFullscreen((v) => !v)} className="p-1 rounded-md hover:bg-background text-foreground/40 hover:text-foreground border border-border">
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
      </div>
    </div>
  );

  const previewBody = (
    <div
      className="overflow-auto bg-[#e5e5e5] rounded-b-xl border-x border-b border-border flex justify-center"
      style={{ height: isFullscreen ? "calc(100vh - 48px)" : "100%" }}
      ref={wrapperRef}
    >
      <div className="py-3 px-3">
        <div style={{ width: MOBILE_WIDTH * scale, overflow: "hidden" }}>
          <iframe
            srcDoc={srcdoc}
            style={{
              width: MOBILE_WIDTH,
              height: 1200,
              border: "none",
              background: "white",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              display: "block",
            }}
            title={title}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div ref={captureRef} style={{ position: "fixed", left: "-99999px", top: 0, visibility: "hidden", width: MOBILE_WIDTH }}>
        {children}
      </div>
      {isFullscreen ? (
        <div className="fixed inset-0 z-100 bg-black/90 flex flex-col">
          {toolbar}
          {previewBody}
        </div>
      ) : (
        <div className={`flex flex-col h-full ${className}`}>
          {toolbar}
          {previewBody}
        </div>
      )}
    </>
  );
}