import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ExternalLink, Github, X } from 'lucide-react';
import { modalBackdropVariants, modalPanelVariants } from '@/animations/motionPresets';
import type { ProjectItem } from '@/types/portfolio.types';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!project) return;
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(3, 6, 14, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
          }}
        >
          <motion.div
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'clamp(1.25rem, 3vw, 2rem)',
              background:
                'linear-gradient(155deg, rgba(16, 24, 44, 0.94) 0%, rgba(8, 12, 24, 0.96) 100%)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                marginBottom: '1.2rem',
              }}
            >
              <div>
                <div
                  className="font-mono"
                  style={{
                    fontSize: '0.74rem',
                    color: 'var(--accent-cyan)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {project.category} · {project.statusLabel}
                </div>
                <h3
                  id="project-modal-title"
                  className="font-display"
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.35rem, 2.5vw, 1.75rem)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {project.name}
                </h3>
                <p
                  style={{
                    margin: '0.35rem 0 0',
                    fontSize: '0.92rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {project.tagline}
                </p>
              </div>

              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close project details"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                marginBottom: '1.35rem',
                aspectRatio: '16 / 9',
                background: '#060912',
              }}
            >
              <img
                src={project.imageUrl}
                alt={`${project.name} preview`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <p
              style={{
                margin: '0 0 1.25rem',
                color: '#cbd5e1',
                fontSize: '0.97rem',
                lineHeight: 1.7,
              }}
            >
              {project.details}
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <h4
                className="font-mono"
                style={{
                  margin: '0 0 0.65rem',
                  fontSize: '0.76rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                Key Concept & Feature Scope
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                {project.highlights.map((point) => (
                  <li
                    key={point}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.55rem',
                      fontSize: '0.92rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <CheckCircle2 size={15} color="var(--accent-cyan)" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '1.4rem' }}>
              <h4
                className="font-mono"
                style={{
                  margin: '0 0 0.6rem',
                  fontSize: '0.76rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                }}
              >
                Technologies & Domains
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {project.technologies.map((tech) => (
                  <span key={tech} className="glass-pill font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {project.githubUrl ? (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn glass-btn-secondary"
                  >
                    <Github size={16} />
                    View Repository
                  </a>
                ) : (
                  <span
                    className="glass-pill font-mono"
                    style={{ fontSize: '0.74rem' }}
                  >
                    Repository link can be added in projects.data.ts
                  </span>
                )}

                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-btn glass-btn-primary"
                  >
                    <ExternalLink size={16} />
                    Open Live Demo
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="glass-btn glass-btn-secondary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

