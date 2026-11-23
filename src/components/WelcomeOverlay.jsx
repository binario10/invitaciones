import { useState } from 'react';
import './WelcomeOverlay.css';

export default function WelcomeOverlay({ isOpen, welcome, onEnter }) {
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenEnvelope = () => {
    if (isOpening) return;
    setIsOpening(true);
    // Dispara inmediatamente la entrada/música dentro del gesto del usuario
    // mientras la solapa del sobre se abre suavemente
    setTimeout(() => {
      onEnter();
    }, 420);
  };

  const nmbuttonLabel = welcome.buttonText || 'Abrir Invitación';

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
          <p className="welcome-text">{welcome.message}</p>
        </div>

        {/* Sello de cera dorado en el centro */}
        <div className="wax-seal-center">
          <button
            type="button"
            className="gold-wax-seal-btn"
            onClick={handleOpenEnvelope}
            aria-label={buttonLabel}
          >
            <span className="seal-initials">{welcome.initials}</span>
            <span className="seal-action-label">Abrir</span>
          </button>

          <span className="envelope-tap-hint">{buttonLabel}</span>
        </div>
      </div>
    </div>
  );
}
