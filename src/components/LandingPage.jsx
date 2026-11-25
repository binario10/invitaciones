import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Lock,
} from 'lucide-react';
import './LandingPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const FALLBACK_LANDING = {
  brandName: 'Uber Reyes | Invitaciones Digitales',
  whatsappPhone: '5214531234567',
  whatsappMessage:
    '¡Hola! Vi su página y quiero apartar mi Invitación Digital con el precio especial de oferta.',
  hero: {
    eyebrow: 'Invitaciones Digitales Interactivas • Entrega Express 24 hrs',
    title: 'Haz que tu evento sea inolvidable desde el primer clic',
    subtitle:
      'Sorprende a tus invitados con un sobre animado con sello de lacre dorado, música personalizada, ubicación GPS, confirmación directa a tu WhatsApp y un Álbum QR en vivo.',
    primaryCtaText: 'Pedir mi Invitación por WhatsApp',
    secondaryCtaText: 'Ver Demo Interactivo',
    demoUrl: '/demo-boda-apatzingan',
    heroImage:
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
  },
  highlights: [
    {
      title: 'Entrega en 24 Horas',
      desc: 'Tu invitación lista y publicada en tiempo récord.',
    },
    {
      title: 'Envíos Ilimitados',
      desc: 'Compártela por WhatsApp con todos tus invitados sin costo extra.',
    },
    {
      title: 'Álbum QR en Vivo',
      desc: 'Tus invitados suben fotos y videos de la fiesta a un solo lugar.',
    },
    {
      title: '100% Personalizada',
      desc: 'Colores, música, tipografía y secciones a tu medida.',
    },
  ],
  demosSection: {
    subtitle: 'Pruébalas en tu celular',
    title: 'Diseños que enamoran a tus invitados',
    items: [
      {
        id: 'demo_boda',
        category: 'Boda en Apatzingán',
        title: 'Sofía & Alejandro',
        desc: 'Catedral de la Asunción y Quinta Real Apatzingán. Sobre con sello dorado, itinerario GPS, mesa de regalos y álbum QR.',
        image:
          'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        url: '/demo-boda-apatzingan',
      },
      {
        id: 'demo_xv',
        category: 'XV Años en Apatzingán',
        title: 'Valeria Guadalupe',
        desc: 'Parroquia del Sagrado Corazón y Salón La Hacienda. Paleta rose gold, galería carrusel y pase directo.',
        image:
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80',
        url: '/demo-xv-apatzingan',
      },
      {
        id: 'demo_social',
        category: 'Bautizo & Primer Año',
        title: 'Mateo Sebastián',
        desc: 'Parroquia de Guadalupe y Quinta Las Palmas. Paleta verde salvia campestre con confirmación directa por WhatsApp.',
        image:
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&q=80',
        url: '/demo-bautizo-apatzingan',
      },
    ],
  },
  featuresSection: {
    subtitle: 'Todo incluido en un solo enlace',
    title: 'Mucho más que una simple imagen',
    items: [],
  },
  pricing: {
    subtitle: 'Inversión Única • Sin Mensualidades',
    title: 'Aprovecha nuestro Precio Especial de Lanzamiento',
    offerBadge: '50% DE DESCUENTO • OFERTA POR TIEMPO LIMITADO',
    packageName: 'Paquete Invitación Digital Completa + Álbum QR',
    currency: 'MXN',
    showBasePrice: true,
    basePrice: 1000,
    offerPrice: 500,
    urgencyNote:
      'Aparta tu fecha hoy con este precio promocional antes de que regrese a su tarifa regular.',
    ctaText: '¡Quiero mi Invitación por $500!',
    includedItems: [],
  },
  faqs: [],
  finalCta: {
    eyebrow: '¿Listo para sorprender a tus invitados?',
    title: 'Asegura hoy tu invitación con precio de oferta',
    desc: 'Escríbenos por WhatsApp, cuéntanos la fecha de tu evento y en 24 horas tendrás tu invitación lista para compartir.',
    ctaText: 'Contactar por WhatsApp Ahora',
  },
};

function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return num.toLocaleString('es-MX');
}

export default function LandingPage() {
  const [landing, setLanding] = useState(FALLBACK_LANDING);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/landing_config.php`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.success && data?.landing) {
          setLanding(data.landing);
          if (data.landing.brandName) {
            document.title = data.landing.brandName;
          }
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const cleanPhone = String(landing.whatsappPhone || '').replace(/\D/g, '');
  const offerFormatted = formatPrice(landing.pricing?.offerPrice ?? 500);
  const baseFormatted = formatPrice(landing.pricing?.basePrice ?? 1000);
  const currency = landing.pricing?.currency || 'MXN';

  const buildWhatsappHref = (customMsg) => {
    const baseMsg =
      customMsg ||
      landing.whatsappMessage ||
      `¡Hola! Me interesa contratar mi Invitación Digital ($${offerFormatted} ${currency}).`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(baseMsg)}`;
  };

  const heroBg = landing.hero?.heroImage
    ? `url("${landing.hero.heroImage}")`
    : undefined;

  return (
    <div className="lp-shell">
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <a href="#inicio" className="lp-brand">
            {landing.brandName}
          </a>

          <nav className="lp-nav-links">
            <a href="#demos" className="lp-nav-link">
              Demos
            </a>
            <a href="#beneficios" className="lp-nav-link">
              Incluye
            </a>
            <a href="#precio" className="lp-nav-link">
              Oferta
            </a>
            <a href="#faq" className="lp-nav-link">
              Dudas
            </a>
          </nav>

          <a
            href={buildWhatsappHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-nav-cta"
          >
            <MessageCircle size={14} /> Cotizar
          </a>
        </div>
      </header>

      <section
        id="inicio"
        className="lp-hero"
        style={{ backgroundImage: heroBg }}
      >
        <div className="lp-hero-overlay" />
        <div className="lp-hero-content">
          {landing.hero?.eyebrow && (
            <span className="lp-eyebrow">{landing.hero.eyebrow}</span>
          )}
          <h1 className="lp-hero-title">{landing.hero?.title}</h1>
          <p className="lp-hero-subtitle">{landing.hero?.subtitle}</p>

          <div className="lp-hero-actions">
            <a
              href={buildWhatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-btn-wa"
            >
              <MessageCircle size={18} />
              {landing.hero?.primaryCtaText || 'Pedir por WhatsApp'}
            </a>

            {landing.hero?.demoUrl && (
              <a
                href={landing.hero.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn-demo"
              >
                <ExternalLink size={16} />
                {landing.hero?.secondaryCtaText || 'Ver Demo en Vivo'}
              </a>
            )}
          </div>

          <p className="lp-hero-price-pill">
            Hoy por promoción:{' '}
            <strong>
              ${offerFormatted} {currency}
            </strong>{' '}
            {landing.pricing?.showBasePrice && (
              <span>(Precio normal ${baseFormatted})</span>
            )}{' '}
            • Pago único
          </p>
        </div>
      </section>

      {Array.isArray(landing.highlights) && landing.highlights.length > 0 && (
        <section className="lp-highlights">
          <div className="lp-highlights-grid">
            {landing.highlights.map((item, idx) => (
              <div key={idx} className="lp-highlight-item">
                <h3 className="lp-highlight-title">{item.title}</h3>
                <p className="lp-highlight-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(landing.demosSection?.items) &&
        landing.demosSection.items.length > 0 && (
          <section id="demos" className="lp-section">
            <span className="lp-sec-sub">
              {landing.demosSection.subtitle}
            </span>
            <h2 className="lp-sec-title">{landing.demosSection.title}</h2>

            <div className="lp-demos-grid">
              {landing.demosSection.items.map((demo, idx) => (
                <article key={demo.id || idx} className="lp-demo-card">
                  <img
                    src={demo.image}
                    alt={demo.title}
                    className="lp-demo-img"
                    loading="lazy"
                  />
                  <div className="lp-demo-body">
                    <span className="lp-demo-cat">{demo.category}</span>
                    <h3 className="lp-demo-title">{demo.title}</h3>
                    <p className="lp-demo-desc">{demo.desc}</p>
                    <a
                      href={demo.url || '/demo-boda-apatzingan'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lp-demo-btn"
                    >
                      <ExternalLink size={14} /> Probar Invitación en Vivo
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

      {Array.isArray(landing.featuresSection?.items) &&
        landing.featuresSection.items.length > 0 && (
          <div id="beneficios" className="lp-section-alt">
            <section className="lp-section">
              <span className="lp-sec-sub">
                {landing.featuresSection.subtitle}
              </span>
              <h2 className="lp-sec-title">{landing.featuresSection.title}</h2>

              <div className="lp-features-grid">
                {landing.featuresSection.items.map((feat, idx) => (
                  <div key={idx} className="lp-feature-card">
                    <div className="lp-feature-icon">
                      <Sparkles size={19} />
                    </div>
                    <h3 className="lp-feature-title">{feat.title}</h3>
                    <p className="lp-feature-desc">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      <section id="precio" className="lp-section">
        <span className="lp-sec-sub">{landing.pricing?.subtitle}</span>
        <h2 className="lp-sec-title">{landing.pricing?.title}</h2>

        <div className="lp-pricing-card">
          {landing.pricing?.offerBadge && (
            <span className="lp-offer-ribbon">
              {landing.pricing.offerBadge}
            </span>
          )}

          <h3 className="lp-pkg-name">{landing.pricing?.packageName}</h3>

          <div className="lp-price-box">
            {landing.pricing?.showBasePrice && (
              <span className="lp-base-price">
                ${baseFormatted} {currency}
              </span>
            )}
            <span className="lp-offer-price">${offerFormatted}</span>
            <span className="lp-currency">{currency}</span>
          </div>

          {landing.pricing?.urgencyNote && (
            <p className="lp-urgency-text">{landing.pricing.urgencyNote}</p>
          )}

          {Array.isArray(landing.pricing?.includedItems) &&
            landing.pricing.includedItems.length > 0 && (
              <ul className="lp-included-list">
                {landing.pricing.includedItems.map((inc, idx) => (
                  <li key={idx}>
                    <CheckCircle2 size={18} className="lp-included-check" />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            )}

          <a
            href={buildWhatsappHref(
              `¡Hola! Quiero aprovechar la oferta de $${offerFormatted} ${currency} para crear mi Invitación Digital.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn-wa"
            style={{ width: '100%', maxWidth: '420px' }}
          >
            <MessageCircle size={19} />
            {landing.pricing?.ctaText ||
              `¡Quiero mi Invitación por $${offerFormatted}!`}
          </a>
        </div>
      </section>

      {Array.isArray(landing.faqs) && landing.faqs.length > 0 && (
        <div id="faq" className="lp-section-alt">
          <section className="lp-section">
            <span className="lp-sec-sub">Resolvemos tus dudas</span>
            <h2 className="lp-sec-title">Preguntas Frecuentes</h2>

            <div className="lp-faq-list">
              {landing.faqs.map((item, idx) => (
                <div key={idx} className="lp-faq-item">
                  <h3 className="lp-faq-q">{item.q}</h3>
                  <p className="lp-faq-a">{item.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      <section className="lp-final-cta">
        <span
          className="lp-sec-sub"
          style={{ color: '#f6e29f', marginBottom: '0.85rem' }}
        >
          {landing.finalCta?.eyebrow}
        </span>
        <h2>{landing.finalCta?.title}</h2>
        <p>{landing.finalCta?.desc}</p>
        <a
          href={buildWhatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-btn-wa"
        >
          <MessageCircle size={19} />
          {landing.finalCta?.ctaText || 'Contactar por WhatsApp'}
        </a>
      </section>

      <footer className="lp-footer">
        <span>
          © {new Date().getFullYear()} {landing.brandName}
        </span>
        <Link
          to="/admin"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Lock size={12} /> Administración
        </Link>
      </footer>
    </div>
  );
}
