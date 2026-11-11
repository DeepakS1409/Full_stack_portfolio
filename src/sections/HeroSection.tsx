import { motion } from 'framer-motion';
import { ArrowDownRight, Compass, FolderGit2, Github, GraduationCap, Sparkles } from 'lucide-react';
import { HeroThreeScene } from '@/components/HeroThreeScene';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

export function HeroSection() {
  const { data: profile } = usePortfolioQuery(
    portfolioService.getProfile,
    portfolioService.getFallbackProfile(),
    isSupabaseConfigured,
  );

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="home" className="section-wrapper hero-section">
      <div className="section-container">
        <div className="hero-grid">
          {/* Editorial Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
              <span className="glass-pill font-mono" style={{ color: 'var(--accent-cyan)' }}>
                <Sparkles size={13} />
                {profile.shortRole}
              </span>
              <span className="glass-pill font-mono">
                {profile.degree} · {profile.batch}
              </span>
            </div>

            <div>
              <h1
                className="font-display text-gradient-subtle"
                style={{
                  margin: 0,
                  fontSize: 'clamp(2.65rem, 6vw, 4.4rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.04,
                }}
              >
                {profile.displayName}
              </h1>
              <p
                className="font-mono"
                style={{
                  margin: '0.85rem 0 0',
                  fontSize: 'clamp(0.84rem, 1.3vw, 0.96rem)',
                  color: '#bae6fd',
                  letterSpacing: '0.02em',
                }}
              >
                Software Development | Artificial Intelligence | Technology
              </p>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                color: 'var(--text-secondary)',
                fontSize: '0.95rem',
              }}
            >
              <GraduationCap size={18} color="var(--accent-violet)" />
              <span>{profile.college}</span>
            </div>

            <p
              style={{
                margin: 0,
                maxWidth: '600px',
                color: 'var(--text-secondary)',
                fontSize: 'clamp(1rem, 1.4vw, 1.1rem)',
                lineHeight: 1.72,
              }}
            >
              {profile.heroIntro}
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '0.85rem',
                paddingTop: '0.45rem',
              }}
            >
              <button
                type="button"
                className="glass-btn glass-btn-primary"
                onClick={() => scrollToSection('projects')}
              >
                <FolderGit2 size={17} />
                View My Projects
              </button>

              <button
                type="button"
                className="glass-btn glass-btn-secondary"
                onClick={() => scrollToSection('about')}
              >
                <Compass size={17} color="var(--accent-cyan)" />
                Explore My Journey
                <ArrowDownRight size={15} />
              </button>

              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn glass-btn-secondary"
              >
                <Github size={17} />
                GitHub
              </a>
            </div>
          </motion.div>

          {/* Right Column: Subtle Three.js Scene + Glassmorphism Profile Card */}
          <motion.div
            className="hero-visual-stage"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroThreeScene />

            <div className="glass-panel hero-profile-card">
              <div
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: '#060a14',
                  aspectRatio: '1 / 1',
                  marginBottom: '1.1rem',
                }}
              >
                <img
                  src={profile.profileImageUrl}
                  alt={
                    profile.isProfileImagePlaceholder
                      ? `${profile.name} profile placeholder`
                      : `${profile.name} portrait`
                  }
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    className="font-display"
                    style={{ fontSize: '1.15rem', fontWeight: 600 }}
                  >
                    {profile.name}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.7rem',
                      color: 'var(--accent-cyan)',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                      background: 'rgba(34, 211, 238, 0.1)',
                      border: '1px solid rgba(34, 211, 238, 0.25)',
                    }}
                  >
                    {profile.batch}
                  </span>
                </div>

                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {profile.degree}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}
                >
                  {profile.college}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

