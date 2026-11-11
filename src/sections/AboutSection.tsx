import { motion } from 'framer-motion';
import { BookOpen, Compass, Cpu, GraduationCap } from 'lucide-react';
import { fadeSlideUp, viewportOnce } from '@/animations/motionPresets';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

export function AboutSection() {
  const { data: profile } = usePortfolioQuery(
    portfolioService.getProfile,
    portfolioService.getFallbackProfile(),
    isSupabaseConfigured,
  );

  return (
    <section id="about" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="02 · About Me"
          title="Curious Builder Exploring Software, AI & Systems"
          subtitle="A grounded introduction to my academic focus, learning mindset, and areas of technological curiosity."
        />

        <div className="about-grid">
          {/* Profile Placeholder & Quick Facts */}
          <GlassCard accent="cyan" style={{ padding: '1.35rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div
                style={{
                  borderRadius: '14px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.09)',
                  aspectRatio: '1 / 1',
                  background: '#060a14',
                }}
              >
                <img
                  src={profile.profileImageUrl}
                  alt={
                    profile.isProfileImagePlaceholder
                      ? `${profile.name} portrait placeholder`
                      : `${profile.name} portrait`
                  }
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <GraduationCap size={16} color="var(--accent-cyan)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {profile.degree}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BookOpen size={16} color="var(--accent-blue)" />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {profile.college} ({profile.batch})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Cpu size={16} color="var(--accent-violet)" />
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Software · AI · Hardware Integration
                  </span>
                </div>
              </div>

              {profile.isProfileImagePlaceholder && (
                <p
                  className="font-mono"
                  style={{
                    margin: 0,
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.07)',
                  }}
                >
                  Profile image is an editable placeholder in{' '}
                  <code>src/data/profile.data.ts</code>.
                </p>
              )}
            </div>
          </GlassCard>

          {/* Narrative & Learning Journey */}
          <motion.div
            variants={fadeSlideUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
          >
            <div className="glass-panel" style={{ padding: 'clamp(1.35rem, 3vw, 2rem)' }}>
              <h3
                className="font-display"
                style={{
                  margin: '0 0 1rem',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
              >
                Personal Introduction
              </h3>
              <div style={{ display: 'grid', gap: '0.95rem' }}>
                {profile.aboutParagraphs.map((para) => (
                  <p
                    key={para}
                    style={{
                      margin: 0,
                      color: 'var(--text-secondary)',
                      fontSize: '0.98rem',
                      lineHeight: 1.72,
                    }}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  marginBottom: '0.65rem',
                }}
              >
                <Compass size={18} color="var(--accent-cyan)" />
                <h3
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: '1.12rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  Learning Journey
                </h3>
              </div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.7,
                }}
              >
                {profile.learningJourney}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

