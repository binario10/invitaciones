import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Camera } from 'lucide-react';
import './AlbumSection.css';

export default function AlbumSection({ album, slug }) {
  if (!album?.enabled) return null;

  const albumPath = `/${slug}/album`;
  const fullQrUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${albumPath}`
      : albumPath;

  return (
    <section className="album-invite-section">
      <div className="section-container">
        <div className="album-invite-card">
          <Camera size={34} strokeWidth={1.2} className="album-invite-icon" />
          <span className="section-subtitle">{album.sectionSubtitle}</span>
          <h2 className="section-title">{album.sectionTitle}</h2>
          <p className="album-invite-desc">{album.sectionDescription}</p>

          <div className="qr-frame">
            <QRCodeSVG
              value={fullQrUrl}
              size={176}
              bgColor="#ffffff"
              fgColor="#2c2825"
              level="M"
            />
          </div>

          <span className="qr-caption">Escanea con tu cámara o entra aquí</span>

          <Link to={albumPath} className="btn-solid">
            <Camera size={16} />
            {album.buttonText}
          </Link>
        </div>
      </div>
    </section>
  );
}
