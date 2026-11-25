import { useState } from 'react';
import { Send } from 'lucide-react';
import './RsvpForm.css';

export default function RsvpForm({ rsvp }) {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState('Sí, asistiremos con gusto');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const phone = String(rsvp?.whatsappPhone || '').replace(/\D/g, '');
    const isAttending = attending.startsWith('Sí');
    const guestCount = Number(guests) || 1;
    const guestLabel =
      guestCount === 1 ? '1 persona' : `${guestCount} personas`;

    const messageLines = [
      '¡Hola! Confirmo mi asistencia al evento:',
      '',
      `• *Nombre:* ${name.trim()}`,
      `• *Asistencia:* ${attending}`,
      isAttending ? `• *Número de personas:* ${guestLabel}` : null,
      notes.trim() ? `• *Mensaje / Restricciones:* ${notes.trim()}` : null,
    ].filter(Boolean);

    const encodedText = encodeURIComponent(messageLines.join('\n'));
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const guestOptions = Array.from({ length: 10 }, (_, idx) => idx + 1);

  return (
    <div id="confirmacion" className="rsvp-wrapper">
      <section className="rsvp-section">
        <span className="section-subtitle">Será un honor contar contigo</span>
        <h2 className="section-title">Confirma tu Asistencia</h2>
        <p className="rsvp-description">
          Por favor confírmanos tu asistencia a través de nuestro formulario
          directo a WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="rsvp-form">
          <div className="rsvp-field">
            <label htmlFor="rsvp-name" className="rsvp-label">
              Nombre completo o Familia *
            </label>
            <input
              id="rsvp-name"
              type="text"
              required
              className="rsvp-input"
              placeholder="Ej. Familia Pérez López"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="rsvp-field">
            <label htmlFor="rsvp-attending" className="rsvp-label">
              ¿Podrás acompañarnos?
            </label>
            <select
              id="rsvp-attending"
              className="rsvp-select"
              value={attending}
              onChange={(e) => setAttending(e.target.value)}
            >
              <option value="Sí, asistiremos con gusto">
                Sí, asistiremos con gusto
              </option>
              <option value="Lamentablemente no podremos asistir">
                Lamentablemente no podremos asistir
              </option>
            </select>
          </div>

          {attending.startsWith('Sí') && (
            <div className="rsvp-field">
              <label htmlFor="rsvp-guests" className="rsvp-label">
                Número de personas
              </label>
              <select
                id="rsvp-guests"
                className="rsvp-select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                {guestOptions.map((count) => (
                  <option key={count} value={String(count)}>
                    {count === 1 ? '1 persona' : `${count} personas`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="rsvp-field">
            <label htmlFor="rsvp-notes" className="rsvp-label">
              Mensaje para los anfitriones o alergias (opcional)
            </label>
            <textarea
              id="rsvp-notes"
              rows="3"
              className="rsvp-textarea"
              placeholder="Escribe aquí tus buenos deseos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-solid rsvp-submit">
            <Send size={15} /> Confirmar por WhatsApp
          </button>
        </form>
      </section>
    </div>
  );
}
