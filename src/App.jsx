import { useState, useRef, useEffect, Component } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  Navigate,
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
import AdminDashboard from './components/AdminDashboard';
import './styles/variables.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

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
  // Respeta false explícito (boolean o string 'false'/0) y requiere URL válida
  if (flag === false || flag === 'false' || flag === 0 || flag === '0') {
    return false;
  }
  return Boolean(hero.musicUrl && String(hero.musicUrl).trim().length > 0);
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

  // Sincronizar estado real del elemento <audio> y pausar si cambia a evento sin música
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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
  }, [hasMusic, hero.musicUrl]);

  const handleEnter = (withMusic = true) => {
    setShowOverlay(false);

    if (!withMusic || !hasMusic || !audioRef.current) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
          // Fallback: si un navegador estricto bloqueó la primera llamada,
          // reintentar automáticamente en el siguiente toque del usuario
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
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
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
        onEnter={handleEnter}
      />

      {!showOverlay && hasMusic && (
        <MusicPlayer isPlaying={isPlaying} onToggle={toggleMusic} />
      )}

      <Hero hero={hero} />
      {hero.dateISO && <Countdown targetDate={hero.dateISO} />}
      <FamilyAndQuote
        quote={eventConfig.quote}
        familySection={eventConfig.familySection}
      />
      <EventLocations events={eventConfig.events} />
      <DressCodeAndGifts
        dressCode={eventConfig.dressCode}
        gifts={eventConfig.gifts}
      />
      <Gallery gallery={eventConfig.gallery} />
      <AlbumSection album={eventConfig.album} slug={slug} />
      {eventConfig.rsvp && <RsvpForm rsvp={eventConfig.rsvp} />}
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

    fetch(`${API_URL}/get_event.php?slug=${encodeURIComponent(slug)}`)
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
          <Route path="/" element={<Navigate to="/karina-brayan" replace />} />
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
