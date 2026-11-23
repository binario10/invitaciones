import { Church, Wine, Sparkles, Utensils, CalendarHeart, MapPin } from 'lucide-react';
import './EventLocations.css';

const ICON_MAP = {
  church: Church,
  wine: Wine,
  sparkles: Sparkles,
  utensils: Utensils,
  default: CalendarHeart,
};

export default function EventLocations({ events }) {
  const activeEvents = (events || []).filter((ev) => ev.enabled !== false);
  if (activeEvents.length === 0) return null;

  return (
    <section className="locations-bg">
      <div className="section-container">
        <span className="section-subtitle">Itinerario</span>
        <h2 className="section-title">¿Dónde y Cuándo?</h2>

        <div className="events-grid">
          {activeEvents.map((event, idx) => {
            const IconComponent = ICON_MAP[event.icon] || ICON_MAP.default;
            return (
              <article key={event.id || idx} className="event-card">
                <div className="event-icon">
                  <IconComponent size={36} strokeWidth={1.2} />
                </div>
                <h3 className="event-type">{event.type}</h3>
                <span className="event-time">{event.time}</span>
                <p className="event-venue">{event.venue}</p>
                <p className="event-address">{event.address}</p>
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    <MapPin size={15} />
                    Ver Ubicación
                  </a>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
