import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, FolderOpen, Loader2, RefreshCw, Search } from 'lucide-react';
import { CertificateCard } from '@/components/CertificateCard';
import { CertificateModal } from '@/components/CertificateModal';
import { SectionHeader } from '@/components/SectionHeader';
import { certificateService, getPublishedCertificates } from '@/services/certificate.service';
import type { Certificate, CertificateCategory } from '@/types/certificate.types';
import './sections.css';

type FetchStatus = 'loading' | 'success' | 'error';

const CATEGORY_LABELS: Record<CertificateCategory | 'all', string> = {
  all: 'All',
  hackathon: 'Hackathons',
  membership: 'Memberships',
  certification: 'Certifications',
  workshop: 'Workshops',
};

export function CertificatesSection() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [categories, setCategories] = useState<CertificateCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<CertificateCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<FetchStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'local-data' | 'supabase' | 'remote-api'>('local-data');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const loadCertificates = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);

    try {
      const [response, availableCategories] = await Promise.all([
        getPublishedCertificates({
          category: activeCategory,
          search: searchQuery,
        }),
        certificateService.getAvailableCategories(),
      ]);

      setCertificates(response.data);
      setDataSource(response.source);
      setCategories(availableCategories);
      setStatus('success');
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to load certificates right now.',
      );
      setStatus('error');
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

  return (
    <section id="certificates" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="05 · Certificates"
          title="Dynamic Certificates Gallery"
          subtitle="Powered by a backend-ready certificate service layer. Any new entry added to the data source or future API automatically renders here."
        />

        {/* Controls Bar: Dynamic Category Filter + Search */}
        <div
          className="glass-panel"
          style={{
            padding: '0.95rem 1.15rem',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {(['all', ...categories] as const).map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className="font-mono"
                  style={{
                    padding: '0.42rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    border: isActive
                      ? '1px solid rgba(34, 211, 238, 0.45)'
                      : '1px solid rgba(255, 255, 255, 0.09)',
                    background: isActive
                      ? 'rgba(34, 211, 238, 0.14)'
                      : 'rgba(15, 23, 42, 0.55)',
                    color: isActive ? '#f8fafc' : 'var(--text-secondary)',
                    transition: 'all 180ms ease',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              flex: '1 1 240px',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{ position: 'relative', minWidth: '210px', flex: '0 1 280px' }}>
              <Search
                size={15}
                color="var(--text-muted)"
                style={{
                  position: 'absolute',
                  left: '0.8rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title or issuer..."
                aria-label="Filter certificates"
                className="glass-input"
                style={{ paddingLeft: '2.25rem', paddingTop: '0.52rem', paddingBottom: '0.52rem' }}
              />
            </div>

            <span
              className="font-mono"
              style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
            >
              {status === 'success'
                ? `${certificates.length} item${certificates.length === 1 ? '' : 's'} · ${dataSource}`
                : dataSource}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div
            className="glass-panel"
            role="status"
            aria-live="polite"
            style={{
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Loader2 size={26} color="var(--accent-cyan)" className="animate-spin" />
            <span className="font-mono" style={{ fontSize: '0.85rem' }}>
              Loading certificates...
            </span>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div
            className="glass-panel"
            role="alert"
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.9rem',
            }}
          >
            <AlertCircle size={28} color="#f87171" />
            <div>
              <h3 className="font-display" style={{ margin: '0 0 0.3rem', fontSize: '1.1rem' }}>
                Could Not Load Certificates
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadCertificates()}
              className="glass-btn glass-btn-secondary"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {status === 'success' && certificates.length === 0 && (
          <div
            className="glass-panel"
            style={{
              padding: '2.75rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0.75rem',
            }}
          >
            <FolderOpen size={28} color="var(--text-muted)" />
            <h3 className="font-display" style={{ margin: 0, fontSize: '1.12rem' }}>
              No Matching Certificates
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              No published certificates matched your current filter.
            </p>
            {(activeCategory !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="glass-btn glass-btn-secondary"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Dynamic Map Grid */}
        {status === 'success' && certificates.length > 0 && (
          <div className="certificates-grid">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onSelect={setSelectedCertificate}
              />
            ))}
          </div>
        )}

        <CertificateModal
          certificate={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
        />
      </div>
    </section>
  );
}

