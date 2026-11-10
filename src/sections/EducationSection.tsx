import { Calendar, CheckCircle2, GraduationCap, MapPin } from 'lucide-react';
import { GlassCard } from '@/components/GlassCard';
import { SectionHeader } from '@/components/SectionHeader';
import { portfolioService } from '@/services/portfolio.service';
import './sections.css';

export function EducationSection() {
  const educationList = portfolioService.getEducation();

  return (
    <section id="education" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="07 · Education"
          title="Academic Foundation"
          subtitle="Formal undergraduate studies in Information Technology."
        />

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {educationList.map((edu) => (
            <GlassCard key={edu.id} accent="blue" style={{ padding: 'clamp(1.35rem, 3vw, 2rem)' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.15rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(59, 130, 246, 0.14)',
                        border: '1px solid rgba(96, 165, 250, 0.28)',
                        flexShrink: 0,
                      }}
                    >
                      <GraduationCap size={22} color="var(--accent-cyan)" />
                    </div>
                    <div>
                      <h3
                        className="font-display"
                        style={{
                          margin: 0,
                          fontSize: 'clamp(1.2rem, 2.2vw, 1.48rem)',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {edu.degree}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          marginTop: '0.35rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.96rem',
                        }}
                      >
                        <MapPin size={15} color="var(--accent-blue)" />
                        <span>{edu.institution}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem' }}>
                    <span className="glass-pill font-mono">
                      <Calendar size={13} color="var(--accent-cyan)" />
                      {edu.period}
                    </span>
                    <span
                      className="glass-pill font-mono"
                      style={{
                        color: '#67e8f9',
                        borderColor: 'rgba(34, 211, 238, 0.32)',
                        background: 'rgba(34, 211, 238, 0.1)',
                      }}
                    >
                      {edu.status}
                    </span>
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: 'var(--text-secondary)',
                    fontSize: '0.96rem',
                    lineHeight: 1.7,
                  }}
                >
                  {edu.description}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '0.65rem',
                    paddingTop: '0.5rem',
                  }}
                >
                  {edu.focusAreas.map((area) => (
                    <div
                      key={area}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px',
                        background: 'rgba(8, 12, 23, 0.56)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        fontSize: '0.88rem',
                        color: '#cbd5e1',
                      }}
                    >
                      <CheckCircle2 size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}

