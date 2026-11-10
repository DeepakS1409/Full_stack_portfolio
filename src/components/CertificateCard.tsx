import { useState } from 'react';
import { Calendar, Eye, FileText, ShieldCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';
import type { Certificate } from '@/types/certificate.types';

interface CertificateCardProps {
  certificate: Certificate;
  onSelect: (certificate: Certificate) => void;
}

export function CertificateCard({ certificate, onSelect }: CertificateCardProps) {
  const [imageError, setImageError] = useState(false);

  const previewSrc =
    certificate.assetType === 'pdf'
      ? certificate.thumbnailUrl ?? ''
      : certificate.assetUrl;

  return (
    <GlassCard
      accent="violet"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: '1.15rem',
          gap: '0.95rem',
        }}
      >
        {/* Preview Frame (supports image or PDF) */}
        <button
          type="button"
          onClick={() => onSelect(certificate)}
          aria-label={`Preview ${certificate.title} certificate`}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            background: '#070b15',
            padding: 0,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {certificate.assetType === 'pdf' && !certificate.thumbnailUrl ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background:
                  'linear-gradient(145deg, rgba(17, 24, 42, 0.9), rgba(8, 12, 24, 0.95))',
                color: 'var(--text-secondary)',
              }}
            >
              <FileText size={32} color="var(--accent-cyan)" />
              <span className="font-mono" style={{ fontSize: '0.75rem' }}>
                PDF Certificate Preview
              </span>
            </div>
          ) : !imageError && previewSrc ? (
            <img
              src={previewSrc}
              alt={`${certificate.title} preview`}
              loading="lazy"
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                color: 'var(--text-muted)',
              }}
            >
              <ShieldCheck size={28} color="var(--accent-cyan)" />
              <span className="font-mono" style={{ fontSize: '0.72rem' }}>
                Certificate Preview
              </span>
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, transparent 50%, rgba(5, 7, 13, 0.72) 100%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '0.6rem',
              right: '0.6rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(8, 12, 23, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              fontSize: '0.72rem',
              color: '#e2e8f0',
            }}
          >
            <Eye size={13} color="var(--accent-cyan)" />
            Inspect
          </div>
        </button>

        {/* Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--accent-cyan)',
              }}
            >
              {certificate.organization}
            </span>
            <span
              className="font-mono"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
              }}
            >
              <Calendar size={12} />
              {certificate.year}
            </span>
          </div>

          <h3
            className="font-display"
            style={{
              margin: 0,
              fontSize: '1.14rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
            }}
          >
            {certificate.title}
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {certificate.description}
          </p>

          {certificate.highlights && certificate.highlights.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                marginTop: 'auto',
                paddingTop: '0.45rem',
              }}
            >
              {certificate.highlights.map((tag) => (
                <span
                  key={tag}
                  className="font-mono"
                  style={{
                    fontSize: '0.7rem',
                    padding: '0.22rem 0.55rem',
                    borderRadius: '8px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(167, 139, 250, 0.22)',
                    color: '#ddd6fe',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

