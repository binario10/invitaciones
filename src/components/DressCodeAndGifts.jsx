import { useState } from 'react';
import { Shirt, Gift, CreditCard, X, Check } from 'lucide-react';
import './DressCodeAndGifts.css';

export default function DressCodeAndGifts({ dressCode, gifts }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const showDressCode = dressCode?.enabled !== false && Boolean(dressCode?.title?.trim() || dressCode?.description?.trim());
  const hasBank = gifts?.bank?.enabled !== false && Boolean(gifts?.bank?.clabe?.trim() || gifts?.bank?.bankName?.trim());
  const hasStore = gifts?.storeRegistry?.enabled !== false && Boolean(gifts?.storeRegistry?.storeName?.trim());
  const showGifts = Boolean(gifts?.enabled) && (hasBank || hasStore || Boolean(gifts?.message?.trim()));

  if (!showDressCode && !showGifts) return null;

  const handleCopyClabe = () => {
    navigator.clipboard.writeText((gifts.bank.clabe || '').replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="section-container">
      <div
        className="details-grid"
        style={
          !(showDressCode && showGifts)
            ? { maxWidth: '520px', margin: '0 auto' }
            : undefined
        }
      >
        {showDressCode && (
          <div className="detail-card">
            <Shirt size={34} strokeWidth={1.2} className="detail-icon" />
            <h3>Código de Vestimenta</h3>
            {dressCode.title && (
              <span className="detail-subtitle">{dressCode.title}</span>
            )}
            {dressCode.description && (
              <p className="detail-desc">{dressCode.description}</p>
            )}
          </div>
        )}

        {showGifts && (
          <div className="detail-card">
            <Gift size={34} strokeWidth={1.2} className="detail-icon" />
            <h3>Mesa de Regalos</h3>
            {gifts.subtitle && (
              <span className="detail-subtitle">{gifts.subtitle}</span>
            )}
            {gifts.message && (
              <p className="detail-desc">{gifts.message}</p>
            )}
            {(hasBank || hasStore) && (
              <div className="gift-buttons">
                {hasBank && (
                  <button
                    className="btn-outline"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <CreditCard size={15} />
                    Datos Bancarios
                  </button>
                )}
                {hasStore && (
                  <a
                    href={gifts.storeRegistry.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline"
                  >
                    Mesa {gifts.storeRegistry.storeName}
                    {gifts.storeRegistry.eventNumber
                      ? ` (#${gifts.storeRegistry.eventNumber})`
                      : ''}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && hasBank && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar"
            >
              <X size={22} />
            </button>
            <span className="section-subtitle">Transferencia</span>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>
              Datos Bancarios
            </h3>
            <div className="bank-info-box">
              {gifts.bank.bankName && (
                <p>
                  <strong>Banco:</strong> {gifts.bank.bankName}
                </p>
              )}
              {gifts.bank.holder && (
                <p>
                  <strong>Titular:</strong> {gifts.bank.holder}
                </p>
              )}
              {gifts.bank.clabe && (
                <p>
                  <strong>CLABE:</strong> {gifts.bank.clabe}
                </p>
              )}
            </div>
            {gifts.bank.clabe && (
              <button className="btn-solid" onClick={handleCopyClabe}>
                {copied ? (
                  <>
                    <Check size={16} /> CLABE Copiada
                  </>
                ) : (
                  'Copiar CLABE'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
