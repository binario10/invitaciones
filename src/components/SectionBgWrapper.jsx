export default function SectionBgWrapper({ sectionBg, children }) {
  const useImage =
    Boolean(sectionBg?.useImage) && Boolean(sectionBg?.imageUrl?.trim());

  if (!useImage) {
    return <>{children}</>;
  }

  const overlayAlpha = Math.min(
    0.88,
    Math.max(0.1, (Number(sectionBg?.overlayOpacity ?? 55) || 55) / 100)
  );

  return (
    <div
      className="section-with-bg-image"
      style={{
        backgroundImage: `url("${sectionBg.imageUrl.trim()}")`,
      }}
    >
      <div
        className="section-bg-image-overlay"
        style={{
          backgroundColor: `rgba(18, 16, 14, ${overlayAlpha})`,
        }}
      />
      <div className="section-bg-image-content">{children}</div>
    </div>
  );
}
