import { ArrowUpRight, ExternalLink, Github, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import type { ProjectItem } from '@/types/portfolio.types';

interface ProjectCardProps {
  project: ProjectItem;
  onViewDetails: (project: ProjectItem) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <GlassCard
      accent="blue"
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
          gap: '1rem',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            background: '#070b15',
            aspectRatio: '16 / 9',
          }}
        >
          <img
            src={project.imageUrl}
            alt={`${project.name} concept visual`}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '0.65rem',
              left: '0.65rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.26rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(5, 8, 17, 0.78)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '0.7rem',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Sparkles size={11} />
            {project.category}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <h3
              className="font-display"
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
              }}
            >
              {project.name}
            </h3>
            <span
              className="font-mono"
              style={{
                fontSize: '0.68rem',
                padding: '0.22rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(96, 165, 250, 0.25)',
                color: '#93c5fd',
                whiteSpace: 'nowrap',
              }}
            >
              {project.statusLabel}
            </span>
          </div>

          <p
            style={{
              margin: 0,
              fontSize: '0.92rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
            }}
          >
            {project.description}
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.4rem',
              marginTop: 'auto',
              paddingTop: '0.45rem',
            }}
          >
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="font-mono"
                style={{
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.72)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#cbd5e1',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.6rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <button
            type="button"
            className="glass-btn glass-btn-secondary"
            onClick={() => onViewDetails(project)}
            style={{ padding: '0.55rem 0.95rem', fontSize: '0.84rem' }}
          >
            View Details
            <ArrowUpRight size={15} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn glass-btn-secondary"
                style={{ padding: '0.5rem 0.7rem', fontSize: '0.8rem' }}
                aria-label={`${project.name} GitHub repository`}
              >
                <Github size={15} />
              </a>
            ) : null}

            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-btn glass-btn-primary"
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                aria-label={`${project.name} live demo`}
              >
                <ExternalLink size={15} />
              </a>
            ) : null}

            {!project.githubUrl && !project.liveUrl && (
              <span
                className="font-mono"
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                }}
              >
                Links pending
              </span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

