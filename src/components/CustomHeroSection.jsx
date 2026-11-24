import './CustomHeroSection.css';

export default function CustomHeroSection({ block }) {
  if (!block || block.enabled === false) return null;

  const hasBgImage = Boolean(block.backgroundImage?.trim());
  const overlayAlpha = Math.min(
    0.85,
    Math.max(0, (Number(block.overlayOpacity ?? 45) || 0) / 100)
  );
  const alignment = ['left', 'center', 'right'].includes(block.alignment)
    ? block.alignment
    : 'center';

  const hasButton = Boolean(block.buttonText?.trim() && block.buttonUrl?.trim());
  const isAnchor = hasButton && block.buttonUrl.trim().startsWith('#');

  return (
    <section
      id={block.id || undefined}
      className={`custom-hero-section ${!hasBgImage ? 'no-bg-image' : ''}`}
      style={
        hasBgImage
          ? { backgroundImage: `url("${block.backgroundImage.trim()}")` }
          : undefined
      }
    >
      {hasBgImage && (
        <div
          className="custom-hero-overlay"
          style={{
            background: `linear-gradient(to bottom, rgba(18, 16, 14, ${Math.max(
              0.15,
              overlayAlpha * 0.85
            )}) 0%, rgba(18, 16, 14, ${overlayAlpha}) 100%)`,
          }}
        />
      )}

      <div className={`custom-hero-inner align-${alignment}`}>
        {block.eyebrow?.trim() && (
          <span className="custom-hero-eyebrow">{block.eyebrow}</span>
        )}

        {block.title?.trim() && (
          <h2 className="custom-hero-title">{block.title}</h2>
        )}

        {(block.title?.trim() || block.eyebrow?.trim()) &&
          block.bodyText?.trim() && <div className="custom-hero-divider" />}

        {block.bodyText?.trim() && (
          <p className="custom-hero-body">{block.bodyText}</p>
        )}

        {hasButton && (
          <a
            href={block.buttonUrl.trim()}
            target={isAnchor ? undefined : '_blank'}
            rel={isAnchor ? undefined : 'noopener noreferrer'}
            className="custom-hero-cta"
          >
            {block.buttonText}
          </a>
        )}
      </div>
    </section>
  );
}
