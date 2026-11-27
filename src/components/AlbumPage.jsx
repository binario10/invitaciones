import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Download,
  Plus,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import UploadProgressModal from './UploadProgressModal';
import { uploadWithProgress } from '../utils/xhrUpload';
import './AlbumPage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'invite_admin_token';

export default function AlbumPage({ eventConfig, slug }) {
  const { album, hero } = eventConfig;

  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState({
    active: false,
    progress: 0,
    title: 'Subiendo archivo...',
    subtitle: '',
  });
  const [activeIndex, setActiveIndex] = useState(null);

  const adminToken =
    typeof window !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) || '' : '';
  const isAdmin = Boolean(adminToken);

  const selfieInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const touchStartX = useRef(null);

  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/get_media.php?slug=${encodeURIComponent(slug)}`
      );
      const data = await response.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error('Error al cargar el álbum:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleFileUpload = async (fileList) => {
    if (!fileList || fileList.length === 0 || uploadState.active) return;

    const files = Array.from(fileList);
    const formData = new FormData();
    formData.append('slug', slug);
    files.forEach((file) => {
      formData.append('media[]', file);
    });

    setUploadState({
      active: true,
      progress: 0,
      title:
        files.length === 1
          ? 'Subiendo recuerdo...'
          : `Subiendo ${files.length} recuerdos...`,
      subtitle:
        files.length === 1
          ? files[0].name
          : `${files.length} archivos seleccionados`,
    });

    try {
      await uploadWithProgress({
        url: `${API_URL}/upload.php`,
        formData,
        onProgress: (pct) => {
          setUploadState((prev) => ({
            ...prev,
            progress: pct,
          }));
        },
      });

      await fetchMedia();
    } catch (err) {
      alert(
        err.message ||
          'Ocurrió un error al subir tus archivos. Verifica la conexión.'
      );
    } finally {
      setTimeout(() => {
        setUploadState({
          active: false,
          progress: 0,
          title: 'Subiendo archivo...',
          subtitle: '',
        });
      }, 400);
    }
  };

  const handleDeleteMedia = async (item, e) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('¿Eliminar permanentemente este archivo del álbum?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/delete_media.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          slug,
          filename: item.filename,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveIndex(null);
        fetchMedia();
      } else {
        alert(data.message || 'No se pudo eliminar el archivo');
      }
    } catch {
      alert('Error de conexión al eliminar');
    }
  };

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev - 1 + mediaList.length) % mediaList.length
    );
  }, [mediaList.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) =>
      prev === null ? null : (prev + 1) % mediaList.length
    );
  }, [mediaList.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, handlePrev, handleNext]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    touchStartX.current = null;
  };

  const currentItem = activeIndex !== null ? mediaList[activeIndex] : null;

  return (
    <div className="album-page">
      {/* Modal bloqueante unificado con barra de progreso real */}
      <UploadProgressModal
        isOpen={uploadState.active}
        progress={uploadState.progress}
        title={uploadState.title}
        subtitle={uploadState.subtitle}
      />

      <div className="album-topbar">
        <Link to={`/${slug}`} className="album-back-link">
          <ArrowLeft size={16} />
          Volver a la invitación
        </Link>

        {isAdmin && (
          <span className="album-admin-badge">Modo Administrador</span>
        )}
      </div>

      <header className="album-header">
        <div className="album-avatar-wrapper">
          <img
            src={album?.avatarImage || hero.heroImage}
            alt={album?.pageHeading || hero.primaryName}
            className="album-avatar"
          />
        </div>

        <h1 className="album-heading">
          {album?.pageHeading || hero.primaryName}
        </h1>
        <p className="album-subtitle">{album?.pageSubtitle}</p>

        <div className="album-pill-actions">
          <button
            type="button"
            className="pill-btn pill-btn-dark"
            disabled={uploadState.active}
            onClick={() => selfieInputRef.current?.click()}
          >
            <Camera size={17} />
            Tomar selfie
          </button>

          <a
            href={`${API_URL}/download_all.php?slug=${encodeURIComponent(slug)}`}
            className="pill-btn pill-btn-light"
          >
            <Download size={17} />
            Descargar todo
          </a>
        </div>

        <input
          ref={selfieInputRef}
          type="file"
          accept="image/*"
          capture="user"
          hidden
          disabled={uploadState.active}
          onChange={(e) => {
            handleFileUpload(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*,.mp4,.mov,.webm,.avi,.mkv,.3gp,.m4v"
          multiple
          hidden
          disabled={uploadState.active}
          onChange={(e) => {
            handleFileUpload(e.target.files);
            e.target.value = '';
          }}
        />
      </header>

      <main className="album-grid-container">
        {loading ? (
          <div className="album-empty-state">Cargando recuerdos...</div>
        ) : mediaList.length === 0 ? (
          <div className="album-empty-state">
            Aún no hay fotos ni videos. ¡Sé el primero en compartir un recuerdo
            tocando el botón <strong>+</strong>!
          </div>
        ) : (
          <div className="album-media-grid">
            {mediaList.map((item, idx) => (
              <div
                key={item.id || idx}
                className="album-media-card"
                onClick={() => setActiveIndex(idx)}
              >
                {isAdmin && (
                  <button
                    type="button"
                    className="card-delete-btn"
                    title="Eliminar archivo"
                    aria-label="Eliminar archivo"
                    onClick={(e) => handleDeleteMedia(item, e)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}

                {item.type === 'video' ? (
                  <>
                    <video
                      src={`${item.url}#t=0.1`}
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="video-badge-overlay">
                      <div className="video-play-circle">
                        <Play size={20} fill="#ffffff" />
                      </div>
                    </div>
                    <span className="video-pill-tag">Video</span>
                  </>
                ) : (
                  <img
                    src={item.thumbUrl || item.url}
                    alt={`Recuerdo ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <button
        type="button"
        className="fab-upload-btn"
        disabled={uploadState.active}
        onClick={() => galleryInputRef.current?.click()}
        aria-label="Subir fotos o videos de galería"
        title="Subir fotos o videos de galería"
      >
        <Plus size={28} strokeWidth={2.2} />
      </button>

      {currentItem && (
        <div
          className="album-lightbox"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => setActiveIndex(null)}
        >
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={() => setActiveIndex(null)}
            aria-label="Cerrar visor"
          >
            <X size={24} />
          </button>

          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav-btn lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Anterior"
              >
                <ChevronLeft size={26} />
              </button>

              <button
                type="button"
                className="lightbox-nav-btn lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Siguiente"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}

          <div
            className="lightbox-media-wrapper"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === 'video' ? (
              <video src={currentItem.url} controls autoPlay playsInline />
            ) : (
              <img
                src={currentItem.thumbUrl || currentItem.url}
                alt="Vista ampliada"
                decoding="async"
              />
            )}
          </div>

          <div
            className="lightbox-footer"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="lightbox-counter">
              {activeIndex + 1} / {mediaList.length}
            </span>
            <a
              href={currentItem.url}
              download={currentItem.filename || `recuerdo-${activeIndex + 1}`}
              className="pill-btn pill-btn-light"
            >
              <Download size={16} />
              Descargar
            </a>
            {isAdmin && (
              <button
                type="button"
                className="pill-btn pill-btn-danger"
                onClick={(e) => handleDeleteMedia(currentItem, e)}
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
