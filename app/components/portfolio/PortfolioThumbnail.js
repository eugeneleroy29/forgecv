"use client";

import PublicPortfolio from "./PublicPortfolio";
import { getSamplePortfolioContent } from "./samplePortfolioContent";
import { getPortfolioTheme } from "./portfolioThemes";

// Renders the real PublicPortfolio component at full size inside a fixed-size
// box, then scales it down visually. This gives an accurate, literal preview
// of the template rather than a separate mockup that could drift out of sync.

const FULL_WIDTH = 1000;
const FULL_HEIGHT = 1400;
const THUMB_WIDTH = 260;
const THUMB_HEIGHT = 364;

export default function PortfolioThumbnail({ template }) {
  const theme = getPortfolioTheme(template);
  const sampleContent = getSamplePortfolioContent(theme.label);
  const scale = THUMB_WIDTH / FULL_WIDTH;

  const fakePortfolio = {
    template,
    content: sampleContent,
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
      style={{ width: THUMB_WIDTH, height: THUMB_HEIGHT }}
    >
      <div
        style={{
          width: FULL_WIDTH,
          height: FULL_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          pointerEvents: "none",
        }}
      >
        <PublicPortfolio portfolio={fakePortfolio} />
      </div>
    </div>
  );
}
