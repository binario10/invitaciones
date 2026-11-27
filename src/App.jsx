import { useState, useRef, useEffect, Component } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Link,
} from 'react-router-dom';
import WelcomeOverlay from './components/WelcomeOverlay';
import MusicPlayer from './components/MusicPlayer';
import Hero from './components/Hero';
import Countdown from './components/Countdown';
import FamilyAndQuote from './components/FamilyAndQuote';
import EventLocations from './components/EventLocations';
import DressCodeAndGifts from './components/DressCodeAndGifts';
import Gallery from './components/Gallery';
import AlbumSection from './components/AlbumSection';
import AlbumPage from './components/AlbumPage';
import RsvpForm from './components/RsvpForm';
import Footer from './components/Footer';
import CustomHeroSection from './components/CustomHeroSection';
import SectionBgWrapper from './components/SectionBgWrapper';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import './styles/variables.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const DEFAULT_SECTION_ORDER = [
  'countdown',
  'familyQuote',
  'locations',
  'dressCodeGifts',
  'gallery',
  'album',
  'rsvp',
];

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMsg: error?.message || 'Error inesperado al renderizar la página.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="state-screen">
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.2rem',
              marginBottom: '0.75rem',
            }}
          >
            Ocurrió un problema al cargar la invitación
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              maxWidth: '480px',
            }}
          >
            {this.state.errorMsg}
          </p>
          <button
            type="button"
            className="btn-solid"
            onClick={() => window.location.reload()}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function applyEventTheme(eventConfig, isAlbum = false) {
  if (!eventConfig) return;
  document.title = isAlbum
    ? `Álbum | ${eventConfig.pageTitle || 'Recuerdos'}`
    : eventConfig.pageTitle || 'Invitación Digital';

  if (eventConfig.theme && typeof eventConfig.theme === 'object') {
    Object.entries(eventConfig.theme).forEach(([cssVar, value]) => {
      if (value) {
        document.documentElement.style.setProperty(cssVar, value);
      }
    });
  }
}

function resolveMusicEnabled(hero) {
  if (!hero) return false;
  const flag = hero.musicEnabled;
  if (flag === false || flag === 'false' || flag === 0 || flag === '0') {
    return false;
  }
  return Boolean(hero.musicUrl && String(hero.musicUrl).trim().length > 0);
}

function resolveEffectiveSectionOrder(eventConfig) {
  const customHeroes = Array.isArray(eventConfig?.customHeroes)
    ? eventConfig.customHeroes
    : [];
  const customIds = customHeroes.map((h) => h.id).filter(Boolean);
  const validKeys = new Set([...DEFAULT_SECTION_ORDER, ...customIds]);

  const savedOrder = Array.isArray(eventConfig?.sectionOrder)
    ? eventConfig.sectionOrder.filter((key) => validKeys.has(key))
    : [];

  const result = [...savedOrder];
  for (const key of DEFAULT_SECTION_ORDER) {
    if (!result.includes(key)) {
      result.push(key);
    }
  }
  for (const cId of customIds) {
    if (!result.includes(cId)) {
      result.push(cId);
    }
  }
  return result;
}

function InvitationView({ eventConfig, slug }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const hero = eventConfig?.hero || {};
  const welcome = eventConfig?.welcome || {
    initials: 'I',
    message: 'Estás invitado a celebrar con nosotros',
  };
  const hasMusic = resolveMusicEnabled(hero);
  const resolvedMusicVolume =
    typeof hero?.musicVolume === 'number' && !Number.isNaN(hero.musicVolume)
      ? Math.min(1, Math.max(0, hero.musicVolume))
      : 0.35;
  const sectionBackgrounds = eventConfig?.sectionBackgrounds || {};
  const customHeroes = Array.isArray(eventConfig?.customHeroes)
    ? eventConfig.customHeroes
    : [];
  const orderedKeys = resolveEffectiveSectionOrder(eventConfig);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = resolvedMusicVolume;

    if (!hasMusic) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [hasMusic, hero.musicUrl, resolvedMusicVolume]);

  const handleEnter = (withMusic = true) => {
    setShowOverlay(false);

    if (!withMusic || !hasMusic || !audioRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    audioRef.current.volume = resolvedMusicVolume;
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
          const retryOnNextGesture = () => {
            if (audioRef.current && hasMusic) {
              audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
            window.removeEventListener('pointerdown', retryOnNextGesture);
          };
          window.addEventListener('pointerdown', retryOnNextGesture, {
            once: true,
          });
        });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current || !hasMusic) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.volume = resolvedMusicVolume;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const renderSectionByKey = (key) => {
    if (key === 'countdown') {
      if (!hero.dateISO) return null;
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.countdown}
        >
          <Countdown targetDate={hero.dateISO} eventConfig={eventConfig} />
        </SectionBgWrapper>
      );
    }

    if (key === 'familyQuote') {
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.familyQuote}
        >
          <FamilyAndQuote
            quote={eventConfig.quote}
            familySection={eventConfig.familySection}
          />
        </SectionBgWrapper>
      );
    }

    if (key === 'locations') {
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.locations}
        >
          <EventLocations events={eventConfig.events} />
        </SectionBgWrapper>
      );
    }

    if (key === 'dressCodeGifts') {
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.dressCodeGifts}
        >
          <DressCodeAndGifts
            dressCode={eventConfig.dressCode}
            gifts={eventConfig.gifts}
          />
        </SectionBgWrapper>
      );
    }

    if (key === 'gallery') {
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.gallery}
        >
          <Gallery gallery={eventConfig.gallery} />
        </SectionBgWrapper>
      );
    }

    if (key === 'album') {
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.album}
        >
          <AlbumSection album={eventConfig.album} slug={slug} />
        </SectionBgWrapper>
      );
    }

    if (key === 'rsvp') {
      if (!eventConfig.rsvp) return null;
      return (
        <SectionBgWrapper
          key={key}
          sectionBg={sectionBackgrounds.rsvp}
        >
          <RsvpForm rsvp={eventConfig.rsvp} />
        </SectionBgWrapper>
      );
    }

    // Sección Hero Personalizada
    const customBlock = customHeroes.find((item) => item.id === key);
    if (customBlock) {
      return <CustomHeroSection key={key} block={customBlock} />;
    }

    return null;
  };

  return (
    <>
      {hasMusic && (
        <audio
          ref={audioRef}
          src={hero.musicUrl}
          loop
          preload="auto"
          playsInline
        />
      )}

      <WelcomeOverlay
        isOpen={showOverlay}
        welcome={welcome}
        heroImage={hero?.heroImage}
        dateDisplay={hero?.dateDisplay}
        onEnter={handleEnter}
      />

      {!showOverlay && hasMusic && (
        <MusicPlayer isPlaying={isPlaying} onToggle={toggleMusic} />
      )}

      <Hero hero={hero} />

      {orderedKeys.map((sectionKey) => renderSectionByKey(sectionKey))}

      {eventConfig.footer && (
        <Footer
          footer={eventConfig.footer}
          dateDisplay={hero.dateDisplay || ''}
        />
      )}
    </>
  );
}

function DynamicEventLoader({ mode }) {
  const { slug } = useParams();
  const [eventConfig, setEventConfig] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');

    fetch(`${API_URL}/get_event.php?slug=${encodeURIComponent(slug)}&t=${Date.now()}`, {
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data.success && data.event) {
          setEventConfig(data.event);
          applyEventTheme(data.event, mode === 'album');
          setStatus('ready');
        } else {
          setStatus('not-found');
        }
      })
      .catch(() => {
        if (active) setStatus('not-found');
      });

    return () => {
      active = false;
    };
  }, [slug, mode]);

  if (status === 'loading') {
    return <div className="state-screen">Cargando invitación...</div>;
  }

  if (status === 'not-found' || !eventConfig) {
    return (
      <div className="state-screen">
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
          }}
        >
          Invitación no encontrada
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: '1.5rem',
          }}
        >
          Verifica que el enlace sea correcto o solicita el link actualizado a
          los anfitriones.
        </p>
        <Link to="/karina-brayan" className="btn-outline">
          Ver invitación de muestra
        </Link>
      </div>
    );
  }

  if (mode === 'album') {
    return <AlbumPage eventConfig={eventConfig} slug={slug} />;
  }

  return <InvitationView eventConfig={eventConfig} slug={slug} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/:slug"
            element={<DynamicEventLoader mode="invite" />}
          />
          <Route
            path="/:slug/album"
            element={<DynamicEventLoader mode="album" />}
          />
        </Routes>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}
