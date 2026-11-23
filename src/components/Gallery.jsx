import { useState } from 'react';
import { X } from 'lucide-react';
import './Gallery.css';

export default function Gallery({ gallery }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!gallery?.enabled || !gallery.photos?.length) return null;

  return (
    <section className="gallery-bg">
      <div className="section-container">
        <span className="section-subtitle">{gallery.subtitle}</span>
        <h2 className="section-title">{gallery.title}</h2>

        <div className="gallery-grid">
          {gallery.photos.map((photo, idx) => (
            <div
              key={photo.id || idx}
              className="gallery-item"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img src={photo.url} alt={photo.alt || `Foto ${idx + 1}`} loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="lightbox-modal"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="modal-close"
            style={{ color: '#fff', top: '1.5rem', right: '1.5rem' }}
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={30} />
          </button>
          <img src={selectedPhoto.url} alt={selectedPhoto.alt || 'Vista previa'} />
        </div>
      )}
    </section>
  );
}
