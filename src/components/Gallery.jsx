import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Play, Maximize2 } from 'lucide-react';
import './Gallery.css';

const VIDEO_EXT_REGEX = /\.(mp4|mov|webm|m4v|avi|mkv)(\?.*)?$/i;

function isVideoItem(item) {
  if (!item) return false;
  if (item.type === 'video') return true;
  return VIDEO_EXT_REGEX.test(item.url || '');
}

export default function Gallery({ gallery }) {
  const photos = Array.isArray(gallery?.photos)
    ? gallery.photos.filter((p) => Boolean(p?.url?.trim()))
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(null);

  const total = photos.length;
  const isCarousel = total > 1;

  // Asegurar índice válido si se reducen elementos
  const safeIndex = total > 0 ? currentIndex % total : 0;

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  // Autoplay suave cuando hay más de 1 elemento y no está pausado ni en lightbox
  useEffect(() => {
    if (!isCarousel || isPaused || lightboxIndex !== null) return;
    const currentItem = photos[safeIndex];
    // Si el slide actual es un video, damos más tiempo antes de avanzar
    const delay = isVideoItem(currentItem) ? 8000 : 4500;
    const timer = setInterval(goNext, delay);
    return () => clearInterval(timer);
  }, [isCarousel, isPaused, lightboxIndex, safeIndex, photos, goNext]);

  // Navegación con teclado dentro del lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft' && total > 1) {
        setLightboxIndex((prev) => (prev - 1 + total) % total);
      }
      if (e.key === 'ArrowRight' && total > 1) {
        setLightboxIndex((prev) => (prev + 1) % total);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, total]);

  if (!gallery?.enabled || total === 0) return null;

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e, inLightbox = false) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45 && total > 1) {
      if (inLightbox) {
        setLightboxIndex((prev) =>
          diff > 0 ? (prev + 1) % total : (prev - 1 + total) % total
        );
      } else {
        if (diff > 0) goNext();
        else goPrev();
      }
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  const renderMediaSlide = (item, idx) => {
    const video = isVideoItem(item);
    return (
      <div
        key={item.id || idx}
        className="gallery-slide"
        onClick={() => setLightboxIndex(idx)}
      >
        {video ? (
          <>
            <video
              src={item.url}
              muted
              loop
              autoPlay
              playsInline
              preload="metadata"
            />
            <span className="gallery-video-pill">
              <Play size={11} fill="#ffffff" /> Video
            </span>
          </>
        ) : (
          <img
            src={item.url}
            alt={item.alt || `Momento ${idx + 1}`}
            loading="lazy"
          />
        )}
        <span className="gallery-expand-hint">
          <Maximize2 size={11} /> Ver
        </span>
      </div>
    );
  };

  const activeLightboxItem =
    lightboxIndex !== null ? photos[lightboxIndex % total] : null;

  return (
    <section className="gallery-bg">
      <div className="section-container">
        <span className="section-subtitle">{gallery.subtitle}</span>
        <h2 className="section-title">{gallery.title}</h2>

        {!isCarousel ? (
          <div className="gallery-single-wrapper">
            <div className="gallery-viewport">
              <div className="gallery-track">
                {renderMediaSlide(photos[0], 0)}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="gallery-carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, false)}
          >
            <div className="gallery-viewport">
              <div
                className="gallery-track"
                style={{ transform: `translateX(-${safeIndex * 100}%)` }}
              >
                {photos.map((item, idx) => renderMediaSlide(item, idx))}
              </div>

              <button
                type="button"
                className="carousel-arrow prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Anterior"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                className="carousel-arrow next"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Siguiente"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="carousel-dots">
              {photos.map((item, idx) => (
                <button
                  key={item.id || idx}
                  type="button"
                  className={`carousel-dot ${idx === safeIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ir a elemento ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {activeLightboxItem && (
        <div
          className="lightbox-modal"
          onClick={() => setLightboxIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, true)}
        >
          {total > 1 && (
            <span className="lightbox-counter-badge">
              {(lightboxIndex % total) + 1} / {total}
            </span>
          )}

          <button
            type="button"
            className="modal-close"
            style={{ color: '#fff', top: '1.5rem', right: '1.5rem', zIndex: 9505 }}
            onClick={() => setLightboxIndex(null)}
            aria-label="Cerrar"
          >
            <X size={30} />
          </button>

          {total > 1 && (
            <>
              <button
                type="button"
                className="carousel-arrow prev"
                style={{ zIndex: 9505 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev - 1 + total) % total);
                }}
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                className="carousel-arrow next"
                style={{ zIndex: 9505 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev + 1) % total);
                }}
                aria-label="Siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            {isVideoItem(activeLightboxItem) ? (
              <video
                src={activeLightboxItem.url}
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={activeLightboxItem.url}
                alt={activeLightboxItem.alt || 'Vista previa'}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
