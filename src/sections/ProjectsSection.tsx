import { useState } from 'react';
import { AlertCircle, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectModal } from '@/components/ProjectModal';
import { SectionHeader } from '@/components/SectionHeader';
import { usePortfolioQuery } from '@/hooks/usePortfolioQuery';
import { isSupabaseConfigured } from '@/lib/supabase';
import { portfolioService } from '@/services/portfolio.service';
import type { ProjectItem } from '@/types/portfolio.types';
import './sections.css';

export function ProjectsSection() {
  const {
    data: projects,
    loading,
    error,
    refetch,
  } = usePortfolioQuery(
    portfolioService.getProjects,
    isSupabaseConfigured ? [] : portfolioService.getFallbackProjects(),
    isSupabaseConfigured,
  );
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <section id="projects" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="04 · Projects & Concepts"
          title="Selected Builds & System Concepts"
          subtitle="A collection of web applications and AI / smart-infrastructure concepts designed to explore real-world workflows."
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
              Loading projects...
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

        {!loading && !error && projects.length === 0 && (
          <div
            className="glass-panel"
            style={{
              padding: '2.5rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.7rem',
              textAlign: 'center',
            }}
          >
            <FolderOpen size={26} color="var(--text-muted)" />
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              No published projects available yet.
            </p>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onViewDetails={setSelectedProject}
              />
            ))}
          </div>
        )}

        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
}
