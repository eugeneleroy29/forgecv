import SectionWrapper from "../SectionWrapper";
import VideoEmbed from "../VideoEmbed";

export default function VideoSection({ videoUrl = "", headingClass = "", isAurora = false, theme = {} }) {
  if (!videoUrl) return null;
  return (
    <SectionWrapper id="video" background="white" className="mb-16 sm:mb-20" isAurora={isAurora} accentColor={theme.accent}>
      <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-6 sm:mb-8 ${headingClass}`}>
        Introduction
      </h2>
      <VideoEmbed url={videoUrl} title="Video introduction" />
    </SectionWrapper>
  );
}