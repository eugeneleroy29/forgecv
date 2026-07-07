"use client"
import { getTemplateComponent } from './templates'
import { getSampleResumeContent } from './sampleResumeContent'

// Renders the real template component at full size inside a fixed-size box,
// then scales it down visually — same approach as PortfolioThumbnail, so the
// thumbnail is always an accurate, literal preview of the template.
const FULL_WIDTH = 850
const FULL_HEIGHT = 1100
const THUMB_WIDTH = 260
const THUMB_HEIGHT = 336

export default function ResumeThumbnail({ template }) {
  const TemplateComponent = getTemplateComponent(template)
  const sampleContent = getSampleResumeContent(template)
  const scale = THUMB_WIDTH / FULL_WIDTH

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
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
      >
        <TemplateComponent content={sampleContent} />
      </div>
    </div>
  )
}
