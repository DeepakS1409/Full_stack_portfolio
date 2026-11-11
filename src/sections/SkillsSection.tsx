import { BrainCircuit, Code2, Globe, Sparkles, Wrench } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

const GROUP_ICONS: Record<string, typeof Code2> = {
  programming: Code2,
  frontend: Globe,
  tools: Wrench,
  ai: BrainCircuit,
};

export function SkillsSection() {
  const {
    data: { groups, currentlyLearning },
  } = usePortfolioQuery(
    portfolioService.getSkills,
    portfolioService.getFallbackSkills(),
    isSupabaseConfigured,
  );

  return (
    <section id="skills" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="03 · Skills"
          title="Core Technical Stack & Active Learning"
          subtitle="Languages, frontend technologies, developer tools, and AI fundamentals I work with and build upon."
        />

        <div className="skills-grid" style={{ marginBottom: '1.65rem' }}>
          {groups.map((group) => {
            const Icon = GROUP_ICONS[group.id] ?? Code2;
            return (
              <GlassCard
                key={group.id}
                accent={group.accent}
                style={{ padding: '1.45rem' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '11px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Icon size={19} color="var(--accent-cyan)" />
                    </div>
                    <div>
                      <h3
                        className="font-display"
                        style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}
                      >
                        {group.title}
                      </h3>
                      <p
                        style={{
                          margin: '0.15rem 0 0',
                          fontSize: '0.84rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        {group.subtitle}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="glass-pill font-mono"
                        style={{
                          color: 'var(--text-primary)',
                          borderColor: 'rgba(255, 255, 255, 0.11)',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Separate Currently Learning Area */}
        <GlassCard accent="violet" style={{ padding: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={18} color="var(--accent-violet)" />
            <h3
              className="font-display"
              style={{ margin: 0, fontSize: '1.18rem', fontWeight: 600 }}
            >
              Currently Learning
            </h3>
          </div>

          <div className="learning-grid">
            {currentlyLearning.map((entry) => (
              <div
                key={entry.name}
                style={{
                  padding: '0.95rem 1.05rem',
                  borderRadius: '12px',
                  background: 'rgba(8, 12, 23, 0.56)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                }}
              >
                <div
                  className="font-display"
                  style={{
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#e2e8f0',
                    marginBottom: '0.25rem',
                  }}
                >
                  {entry.name}
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                  {entry.focus}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

