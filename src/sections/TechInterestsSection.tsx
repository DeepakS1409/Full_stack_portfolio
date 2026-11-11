import { Bot, BrainCircuit, CircuitBoard, Cpu, Layers, Radio, Wifi, Zap } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

const INTEREST_ICONS: Record<string, typeof Cpu> = {
  'artificial-intelligence': BrainCircuit,
  'internet-of-things': Wifi,
  arduino: CircuitBoard,
  esp32: Radio,
  robotics: Bot,
  'embedded-systems': Cpu,
  'sensors-electronics': Zap,
  'hardware-software-integration': Layers,
};

export function TechInterestsSection() {
  const { data: interests } = usePortfolioQuery(
    portfolioService.getTechInterests,
    portfolioService.getFallbackTechInterests(),
    isSupabaseConfigured,
  );

  return (
    <section id="tech-interests" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="08 · Tech Interests"
          title="Technology Domains I Am Exploring"
          subtitle="These represent active learning interests and areas of curiosity across intelligence, electronics, and connected systems—rather than completed commercial projects."
        />

        <div className="interests-grid">
          {interests.map((interest) => {
            const Icon = INTEREST_ICONS[interest.id] ?? Cpu;
            return (
              <GlassCard
                key={interest.id}
                accent="cyan"
                style={{ padding: '1.3rem' }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    height: '100%',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Icon size={18} color="var(--accent-cyan)" />
                    </div>
                    <span
                      className="font-mono"
                      style={{
                        fontSize: '0.68rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {interest.category}
                    </span>
                  </div>

                  <h3
                    className="font-display"
                    style={{
                      margin: 0,
                      fontSize: '1.08rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {interest.name}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      flex: 1,
                    }}
                  >
                    {interest.description}
                  </p>

                  <span
                    className="font-mono"
                    style={{
                      fontSize: '0.7rem',
                      color: '#a5f3fc',
                      paddingTop: '0.45rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    {interest.explorationNote}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
}

