import { Github } from 'lucide-react';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';

export function FooterSection() {
  const { data: profile } = usePortfolioQuery(
    portfolioService.getProfile,
    portfolioService.getFallbackProfile(),
    isSupabaseConfigured,
  );

  return (
    <footer
      style={{
        padding: '2.25rem clamp(1.25rem, 4vw, 2.5rem) 3rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      <div
        className="section-container"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span className="font-display" style={{ fontWeight: 600, fontSize: '0.98rem' }}>
            {profile.name}
          </span>
          <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {profile.degree} · {profile.college} · {profile.batch}
          </span>
        </div>

        <a
          href={profile.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-pill"
          style={{ textDecoration: 'none' }}
        >
          <Github size={14} color="var(--accent-cyan)" />
          github.com/DeepakS1409
        </a>
      </div>
    </footer>
  );
}
