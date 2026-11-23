import { useState, useRef, useEffect } from 'react';
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

function applyEventTheme(eventConfig, isAlbum = false) {
  if (!eventConfig) return;
  document.title = isAlbum
    ? `Álbum | ${eventConfig.pageTitle}`
    : eventConfig.pageTitle;

  if (eventConfig.theme) {
    Object.entries(eventConfig.theme).forEach(([cssVar, value]) => {
      document.documentElement.style.setProperty(cssVar, value);
    });
  }
}

function InvitationView({ eventConfig, slug }) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const hasMusic =
    eventConfig.hero.musicEnabled !== false &&
    Boolean(eventConfig.hero.musicUrl?.trim());

  const handleEnter = () => {
    setShowOverlay(false);
    if (hasMusic && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current || !hasMusic) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <>
      {hasMusic && (
        <audio
          ref={audioRef}
          src={eventConfig.hero.musicUrl}
          loop
          preload="none"
        />
      )}

      <WelcomeOverlay
        isOpen={showOverlay}
        welcome={eventConfig.welcome}
        onEnter={handleEnter}
      />

      {!showOverlay && hasMusic && (
        <MusicPlayer isPlaying={isPlaying} onToggle={toggleMusic} />
      )}

      <Hero hero={eventConfig.hero} />
      <Countdown targetDate={eventConfig.hero.dateISO} />
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
      <RsvpForm rsvp={eventConfig.rsvp} />
      <Footer
        footer={eventConfig.footer}
        dateDisplay={eventConfig.hero.dateDisplay}
      />
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
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '0.75rem' }}>
          Invitación no encontrada
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Verifica que el enlace sea correcto o solicita el link actualizado a los anfitriones.
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
      <Routes>
        <Route path="/" element={<Navigate to="/karina-brayan" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/:slug" element={<DynamicEventLoader mode="invite" />} />
        <Route path="/:slug/album" element={<DynamicEventLoader mode="album" />} />
      </Routes>
    </BrowserRouter>
  );
}
