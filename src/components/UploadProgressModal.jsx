import './UploadProgressModal.css';

export default function UploadProgressModal({
  isOpen,
  progress = 0,
  title = 'Subiendo archivo...',
  subtitle = '',
}) {
  if (!isOpen) return null;

  const isFinalizing = progress >= 99 && progress < 100;
  const isCompleted = progress >= 100;

  let statusText = 'No cierres ni recargues esta ventana';
  if (isFinalizing) {
    statusText = 'Procesando y guardando en el servidor...';
  } else if (isCompleted) {
    statusText = '¡Carga confirmada!';
  }

  return (
    <div
      className="global-upload-backdrop"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="global-upload-modal">
        <div className="global-upload-spinner" />
        <h3 className="global-upload-title">{title}</h3>
        {subtitle && <p className="global-upload-subtitle">{subtitle}</p>}

        <div className="global-progress-track">
          <div
            className="global-progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        <span className="global-progress-pct">{progress}%</span>
        <span className="global-upload-hint">{statusText}</span>
      </div>
    </div>
  );
}
