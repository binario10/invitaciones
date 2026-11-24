import { useState } from 'react';
import './WelcomeOverlay.css';

export default function WelcomeOverlay({ isOpen, welcome, onEnter }) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Ejecutar onEnter de forma síncrona dentro del gesto de clic del usuario
    // para que los navegadores móviles (iOS Safari / Chrome) permitan reproducir el audio
    if (typeof onEnter === 'function') {
      onEnter(true);
    }
  };

  const initials = welcome?.initials || 'I';
  const message =
    welcome?.message || 'Estás invitado a celebrar este gran momento';
  const buttonLabel = welcome?.buttonText || 'Abrir Invitación';

  return (
    <div
      className={`welcome-overlay ${isOpening ? 'opening' : ''} ${
        !isOpen ? 'hidden' : ''
      }`}
    >
      <div className="envelope-stage">
        <div className="envelope-paper-texture" />

        {/* Pliegues geométricos del sobre */}
        <div className="envelope-flap-left" />
        <div className="envelope-flap-right" />
        <div className="envelope-flap-bottom" />
        <div className="envelope-flap-top" />
        <div className="envelope-gold-trim" />

        {/* Mensaje superior */}
        <div className="envelope-header-text">
          <span className="envelope-eyebrow">Invitación Especial</span>
          <p className="welcome-text">{message}</p>
        </div>

        {/* Sello de cera dorado en el centro */}
        <div className="wax-seal-center">
          <button
            type="button"
            className="gold-wax-seal-btn"
            onClick={handleOpenEnvelope}
            aria-label={buttonLabel}
          >
            <span className="seal-initials">{initials}</span>
            <span className="seal-action-label">Abrir</span>
          </button>

          <span className="envelope-tap-hint">{buttonLabel}</span>
        </div>
      </div>
    </div>
  );
}
