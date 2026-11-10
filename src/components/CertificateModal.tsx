import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, ExternalLink, FileText, ShieldCheck, X } from 'lucide-react';
import { modalBackdropVariants, modalPanelVariants } from '@/animations/motionPresets';
import type { Certificate } from '@/types/certificate.types';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!certificate) return;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [certificate, onClose]);

  return (
    <AnimatePresence>
      {certificate && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="certificate-modal-title"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(3, 6, 14, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <motion.div
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '780px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              background:
                'linear-gradient(155deg, rgba(16, 24, 44, 0.95) 0%, rgba(7, 11, 22, 0.97) 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.15rem',
              }}
            >
              <div>
                <div
                  className="font-mono"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    fontSize: '0.75rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.35rem',
                  }}
                >
                  <ShieldCheck size={14} />
                  {certificate.organization}
                </div>
                <h3
                  id="certificate-modal-title"
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.3rem, 2.4vw, 1.7rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {certificate.title}
                </h3>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close certificate lightbox"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Image or PDF Viewer */}
            <div
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: '#060913',
                marginBottom: '1.25rem',
              }}
            >
              {certificate.assetType === 'pdf' ? (
                <div style={{ width: '100%', height: '420px', position: 'relative' }}>
                  <iframe
                    src={certificate.assetUrl}
                    title={`${certificate.title} PDF`}
                    style={{
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </div>
              ) : (
                <img
                  src={certificate.assetUrl}
                  alt={certificate.title}
                  style={{
                    width: '100%',
                    maxHeight: '440px',
                    objectFit: 'contain',
                    margin: '0 auto',
                  }}
                />
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.6rem',
                marginBottom: '1rem',
              }}
            >
              <span className="glass-pill font-mono">
                <Calendar size={13} color="var(--accent-cyan)" />
                Year: {certificate.year}
              </span>
              {certificate.validUntil && (
                <span className="glass-pill font-mono">
                  Valid Until: {certificate.validUntil}
                </span>
              )}
              {certificate.credentialId && (
                <span className="glass-pill font-mono">
                  Credential ID: {certificate.credentialId}
                </span>
              )}
              {certificate.isPlaceholderAsset && (
                <span
                  className="glass-pill font-mono"
                  style={{
                    borderColor: 'rgba(251, 191, 36, 0.25)',
                    color: '#fde68a',
                  }}
                >
                  Placeholder visual — awaiting official scan/PDF
                </span>
              )}
            </div>

            <p
              style={{
                margin: '0 0 1.2rem',
                color: '#cbd5e1',
                fontSize: '0.96rem',
                lineHeight: 1.7,
              }}
            >
              {certificate.description}
            </p>

            {certificate.highlights && certificate.highlights.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.45rem',
                  marginBottom: '1.25rem',
                }}
              >
                {certificate.highlights.map((item) => (
                  <span key={item} className="glass-pill font-mono">
                    {item}
                  </span>
                ))}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {certificate.assetType === 'pdf' ? (
                <a
                  href={certificate.assetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn glass-btn-primary"
                >
                  <FileText size={16} />
                  Open PDF in New Tab
                  <ExternalLink size={14} />
                </a>
              ) : (
                <span
                  className="font-mono"
                  style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                >
                  Category: {certificate.category}
                </span>
              )}

              <button
                type="button"
                onClick={onClose}
                className="glass-btn glass-btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

