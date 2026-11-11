import { AlertCircle, Award, Loader2, Medal, RefreshCw, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

const ACCENT_ICON_MAP = {
  cyan: Award,
  blue: Medal,
  violet: ShieldCheck,
} as const;

export function AchievementsSection() {
  const {
    data: achievements,
    loading,
    error,
    refetch,
  } = usePortfolioQuery(
    portfolioService.getAchievements,
    isSupabaseConfigured ? [] : portfolioService.getFallbackAchievements(),
    isSupabaseConfigured,
  );

  return (
    <section id="achievements" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="06 · Achievements"
          title="Milestones & Recognitions"
          subtitle="Verified participation, national hackathon qualification, and engineering community membership."
        />

        {loading && (
          <div
            className="glass-panel"
            role="status"
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              color: 'var(--text-secondary)',
            }}
          >
            <Loader2 size={24} color="var(--accent-cyan)" className="animate-spin" />
            <span className="font-mono" style={{ fontSize: '0.84rem' }}>
              Loading achievements...
            </span>
          </div>
        )}

        {!loading && error && (
          <div
            className="glass-panel"
            role="alert"
            style={{
              padding: '2.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.8rem',
              textAlign: 'center',
            }}
          >
            <AlertCircle size={26} color="#f87171" />
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {error}
            </p>
            <button type="button" onClick={refetch} className="glass-btn glass-btn-secondary">
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {!loading && !error && achievements.length === 0 && (
          <div
            className="glass-panel"
            style={{
              padding: '2.25rem 1.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
            }}
          >
            No published achievements available yet.
          </div>
        )}

        {!loading && !error && achievements.length > 0 && (
          <div className="achievements-grid">
            {achievements.map((item) => {
              const Icon = ACCENT_ICON_MAP[item.accent];
              const accentColor =
                item.accent === 'cyan'
                  ? 'var(--accent-cyan)'
                  : item.accent === 'blue'
                    ? 'var(--accent-blue)'
                    : 'var(--accent-violet)';

              return (
                <GlassCard
                  key={item.id}
                  accent={item.accent}
                  style={{ padding: '1.5rem' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(15, 23, 42, 0.78)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <Icon size={20} color={accentColor} />
                      </div>

                      <span
                        className="font-mono"
                        style={{
                          fontSize: '0.72rem',
                          padding: '0.26rem 0.65rem',
                          borderRadius: '999px',
                          background: 'rgba(15, 23, 42, 0.75)',
                          border: '1px solid rgba(255, 255, 255, 0.11)',
                          color: accentColor,
                        }}
                      >
                        {item.badgeText}
                      </span>
                    </div>

                    {item.imageUrl && (
                      <div
                        style={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          aspectRatio: '16 / 9',
                          background: '#060a14',
                        }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}

                    <div>
                      <h3
                        className="font-display"
                        style={{
                          margin: 0,
                          fontSize: '1.16rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          lineHeight: 1.32,
                        }}
                      >
                        {item.title}
                      </h3>
                      <p
                        className="font-mono"
                        style={{
                          margin: '0.3rem 0 0',
                          fontSize: '0.76rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {item.organization} · {item.year}
                      </p>
                    </div>

                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.92rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.65,
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
