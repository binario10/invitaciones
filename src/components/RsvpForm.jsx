import { useState } from 'react';
import { Send } from 'lucide-react';
import './RsvpForm.css';

export default function RsvpForm({ rsvp }) {
  const [formData, setFormData] = useState({
    name: '',
    attendance: 'Sí, asistiré con gusto',
    guests: '1',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `${rsvp.whatsappIntro}%0A%0A*Nombre:* ${formData.name}%0A*Asistencia:* ${formData.attendance}%0A*Número de pases:* ${formData.guests}%0A*Mensaje:* ${formData.message || '¡Muchas felicidades!'}`;
    window.open(`https://wa.me/${rsvp.whatsappPhone}?text=${text}`, '_blank');
    setSubmitted(true);
  };

  return (
    <section className="section-container">
      <span className="section-subtitle">R.S.V.P.</span>
      <h2 className="section-title">Confirma tu Asistencia</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
        {rsvp.deadlineText}
      </p>

      {submitted ? (
        <div className="rsvp-success">
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', marginBottom: '0.5rem' }}>
            ¡Gracias por confirmar, {formData.name}!
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Se ha abierto WhatsApp para enviar tus datos directamente.
          </p>
          <button className="btn-outline" onClick={() => setSubmitted(false)}>
            Enviar otra confirmación
          </button>
        </div>
      ) : (
        <form className="rsvp-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre Completo *</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-control"
              placeholder="Ej. Familia Pérez López"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="attendance">¿Podrás acompañarnos?</label>
            <select
              id="attendance"
              name="attendance"
              className="form-control"
              value={formData.attendance}
              onChange={handleChange}
            >
              <option value="Sí, asistiré con gusto">Sí, asistiré con gusto</option>
              <option value="Lo siento, no podré asistir">Lo siento, no podré asistir</option>
            </select>
          </div>

          {formData.attendance.startsWith('Sí') && (
            <div className="form-group">
              <label htmlFor="guests">Número de personas</label>
              <select
                id="guests"
                name="guests"
                className="form-control"
                value={formData.guests}
                onChange={handleChange}
              >
                <option value="1">1 Persona</option>
                <option value="2">2 Personas</option>
                <option value="3">3 Personas</option>
                <option value="4">4 Personas</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="message">Dedicatoria o alergias alimentarias (opcional)</label>
            <textarea
              id="message"
              name="message"
              rows="3"
              className="form-control"
              placeholder="Escribe tus buenos deseos..."
              value={formData.message}
              onChange={handleChange}
            />
          </div>

          <div className="rsvp-submit-wrapper">
            <button type="submit" className="btn-solid">
              <Send size={15} />
              Confirmar por WhatsApp
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
