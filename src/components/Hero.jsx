import { ChevronDown } from 'lucide-react';
import './Hero.css';

export default function Hero({ hero }) {
  const hasTwoHonorees = Boolean(hero.secondaryName);

  return (
    <header
      className="hero-section"
      style={{ backgroundImage: `url(${hero.heroImage})` }}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        <span className="hero-tag">{hero.tag}</span>
        <h1 className="hero-names">
          {hero.primaryName}
          {hasTwoHonorees && (
            <>
              <span className="hero-ampersand">{hero.connector || '&'}</span>
              {hero.secondaryName}
            </>
          )}
        </h1>
        <div className="hero-divider" />
        <p className="hero-date">{hero.dateDisplay}</p>
      </div>
      <a href="#cuenta-regresiva" className="scroll-indicator" aria-label="Bajar">
        <ChevronDown size={28} strokeWidth={1.25} />
      </a>
    </header>
  );
}
