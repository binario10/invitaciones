import { useState } from 'react';
import { Heart, Crown, Cross, Sparkles } from 'lucide-react';
import { getEnvelopePresetById } from '../data/envelopePresets';
import './WelcomeOverlay.css';

function RingsSvgIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="13" r="5" />
      <circle cx="15" cy="11" r="5" />
    </svg>
  );
}

export default function WelcomeOverlay({
  isOpen,
  welcome,
  heroImage,
  dateDisplay,
  onEnter,
}) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);
    if (typeof onEnter === 'function') {
      onEnter(true);
    }
  };

  const preset = getEnvelopePresetById(welcome?.envelopeStyle || 'default');

  const initials = welcome?.initials || 'I';
  const message =
    welcome?.message || 'Estás invitado a celebrar este gran momento';
  const showButtonText = Boolean(welcome?.showButtonText);
  const customButtonText = welcome?.buttonText?.trim() || '';
  const visibleButtonLabel = showButtonText ? customButtonText : '';
  const ariaButtonLabel = customButtonText || 'Abrir Invitación';

  const paperBg = welcome?.envelopeBgColor?.trim() || preset.paperBg;
  const flapBg = welcome?.envelopeFlapColor?.trim() || preset.flapBg;
  const flapSideBg = welcome?.envelopeFlapColor?.trim() || preset.flapSideBg;
  const linerBg =
    welcome?.envelopeLinerColor?.trim() || preset.linerBg || preset.flapBg;
  const textColor = welcome?.envelopeTextColor?.trim() || preset.textColor;
  const eyebrowColor =
    welcome?.envelopeTextColor?.trim() || preset.eyebrowColor;
  const borderColor =
    welcome?.envelopeBorderColor?.trim() || preset.borderColor;
  const sealBg = welcome?.envelopeSealColor?.trim() || preset.sealBg;
  const sealColor = preset.sealColor || '#fffdf7';

  const sealShape = welcome?.sealShape || 'organic-wax';
  const sealIcon = welcome?.sealIcon || 'initials';
  const sealIdleAnimation = welcome?.sealIdleAnimation || 'pulse-glow';
  const initialsFont = welcome?.initialsFont || 'serif-editorial';
  const envelopeSize = welcome?.envelopeSize || 'standard';
  const openAnimation = welcome?.openAnimation || 'flap-up';

  const selectedBackdrop =
    !welcome?.backdropStyle || welcome.backdropStyle === 'auto'
      ? preset.defaultBackdrop || 'dark-blur'
      : welcome.backdropStyle;

  const customImage = welcome?.envelopeImage?.trim() || '';
  const imageOpacity =
    typeof welcome?.envelopeImageOpacity === 'number'
      ? welcome.envelopeImageOpacity
      : 0.35;

  const customSealTop =
    typeof welcome?.customSealTop === 'number' ? welcome.customSealTop : 54;
  const hideOverlayTextOnCustomImage = Boolean(
    welcome?.hideOverlayTextOnCustomImage
  );

  const stageStyle = {
    '--env-paper-bg': paperBg,
    '--env-flap-bg': flapBg,
    '--env-flap-side-bg': flapSideBg,
    '--env-liner-bg': linerBg,
    '--env-text-color': textColor,
    '--env-eyebrow-color': eyebrowColor,
    '--env-border-color': borderColor,
    '--env-seal-bg': sealBg,
    '--env-seal-color': sealColor,
    '--env-image-opacity': imageOpacity,
  };

  const renderSealCenter = () => {
    switch (sealIcon) {
      case 'heart':
        return <Heart size={26} strokeWidth={1.7} />;
      case 'rings':
        return <RingsSvgIcon size={28} />;
      case 'crown':
        return <Crown size={26} strokeWidth={1.7} />;
      case 'cross':
        return <Cross size={25} strokeWidth={1.7} />;
      case 'sparkles':
        return <Sparkles size={25} strokeWidth={1.7} />;
      case 'initials':
      default:
        return (
          <span className={`seal-initials font-${initialsFont}`}>
            {initials}
          </span>
        );
    }
  };

  const showPhotoBackdrop =
    heroImage &&
    (selectedBackdrop === 'photo-bw' || selectedBackdrop === 'photo-clear');

  const geometry =
    welcome?.envelopeStyle === 'custom-image'
      ? 'custom-image'
      : preset.geometry || 'standard';

  return (
    <div
      className={`welcome-overlay backdrop-${selectedBackdrop} anim-${openAnimation} ${
        envelopeSize === 'fullscreen' ? 'size-fullscreen-overlay' : ''
      } ${isOpening ? 'opening' : ''} ${!isOpen ? 'hidden' : ''}`}
    >
      {showPhotoBackdrop && (
        <div
          className="welcome-backdrop-photo"
          style={{ backgroundImage: `url("${heroImage}")` }}
        />
      )}

      {/* MODO 3: IMAGEN DE SOBRE COMPLETA SUBIDA POR EL USUARIO TAL CUAL */}
      {geometry === 'custom-image' && customImage ? (
        <div
          className={`envelope-stage geom-custom-image size-${envelopeSize}`}
          style={stageStyle}
        >
          <div
            className="custom-image-envelope-wrapper"
            onClick={handleOpenEnvelope}
          >
            <img
              src={customImage}
              alt={ariaButtonLabel}
              className="custom-image-envelope-img"
            />

            {!hideOverlayTextOnCustomImage && (
              <div
                className="custom-image-overlay-controls"
                style={{ top: `${customSealTop}%` }}
              >
                <button
                  type="button"
                  className={`gold-wax-seal-btn shape-${sealShape} idle-${sealIdleAnimation}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEnvelope();
                  }}
                  aria-label={ariaButtonLabel}
                >
                  {renderSealCenter()}
                  <span className="seal-action-label">Abrir</span>
                </button>

                {visibleButtonLabel && (
                  <span className="custom-image-text-pill envelope-tap-hint">
                    {visibleButtonLabel}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ) : geometry === 'open-liner' ? (
        <div
          className={`envelope-stage geom-open-liner style-${preset.id} size-${envelopeSize}`}
          style={stageStyle}
        >
          <div className="open-liner-shell">
            <div className="open-liner-top-outer" />
            <div className="open-liner-top-inner" />

            <div className="open-liner-body">
              <div className="open-liner-pocket-v" />
              <div className="open-liner-bottom-fold" />

              <div className="open-liner-ornament">❧ ✦ ❧</div>

              <div className="wax-seal-center">
                <button
                  type="button"
                  className={`gold-wax-seal-btn shape-${sealShape} idle-${sealIdleAnimation}`}
                  onClick={handleOpenEnvelope}
                  aria-label={ariaButtonLabel}
                >
                  {renderSealCenter()}
                  <span className="seal-action-label">Abrir</span>
                </button>
              </div>

              <div className="open-liner-message-box">
                <p
                  className="welcome-text"
                  style={{ fontSize: '0.94rem', lineHeight: 1.38 }}
                >
                  {message}
                </p>
                {visibleButtonLabel && (
                  <span
                    className="envelope-tap-hint"
                    style={{ display: 'block', marginTop: '0.35rem' }}
                  >
                    {visibleButtonLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : geometry === 'lace-pocket' ? (
        <div
          className={`envelope-stage geom-lace-pocket style-${preset.id} size-${envelopeSize}`}
          style={stageStyle}
        >
          <div className="lace-pocket-shell">
            <div className="lace-insert-card">
              {dateDisplay && (
                <span
                  className="envelope-eyebrow"
                  style={{ marginBottom: '0.35rem' }}
                >
                  {dateDisplay}
                </span>
              )}
              <span
                className={`seal-initials font-${
                  initialsFont === 'serif-editorial'
                    ? 'script-calligraphy'
                    : initialsFont
                }`}
                style={{
                  fontSize: 'clamp(1.85rem, 4.5vw, 2.3rem)',
                  color: borderColor,
                  marginBottom: '0.35rem',
                }}
              >
                {initials}
              </span>
              <p
                className="welcome-text"
                style={{ fontSize: '0.94rem', maxWidth: '290px' }}
              >
                {message}
              </p>
            </div>

            <div className="lace-pocket-front">
              <div className="lace-pocket-left-wing" />
              <div className="lace-pocket-right-wing" />
              <div className="lace-pocket-bottom-wing" />

              <div className="wax-seal-center">
                <button
                  type="button"
                  className={`gold-wax-seal-btn shape-${sealShape} idle-${sealIdleAnimation}`}
                  onClick={handleOpenEnvelope}
                  aria-label={ariaButtonLabel}
                >
                  {renderSealCenter()}
                  <span className="seal-action-label">Abrir</span>
                </button>
              </div>

              {visibleButtonLabel && (
                <span className="lace-pocket-footer-title">
                  {visibleButtonLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`envelope-stage geom-${geometry} style-${preset.id} size-${envelopeSize} ${
            preset.translucent ? 'is-translucent' : ''
          }`}
          style={stageStyle}
        >
          {customImage && (
            <div
              className="envelope-custom-bg-image"
              style={{ backgroundImage: `url("${customImage}")` }}
            />
          )}

          <div className={`envelope-paper-texture pattern-${preset.pattern}`} />

          <div className="envelope-flap-left" />
          <div className="envelope-flap-right" />
          <div className="envelope-flap-bottom" />
          <div className="envelope-flap-top" />
          <div className="envelope-gold-trim" />
          {preset.pattern === 'baroque' && (
            <div className="envelope-baroque-corners" />
          )}

          <div className="envelope-header-text">
            <span className="envelope-eyebrow">Invitación Especial</span>
            <p className="welcome-text">{message}</p>
          </div>

          <div className="wax-seal-center">
            <button
              type="button"
              className={`gold-wax-seal-btn shape-${sealShape} idle-${sealIdleAnimation}`}
              onClick={handleOpenEnvelope}
              aria-label={ariaButtonLabel}
            >
              {renderSealCenter()}
              <span className="seal-action-label">Abrir</span>
            </button>
          </div>

          {visibleButtonLabel && (
            <span className="envelope-tap-hint envelope-standard-footer-hint">
              {visibleButtonLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
