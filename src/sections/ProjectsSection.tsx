import { useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectModal } from '@/components/ProjectModal';
import { SectionHeader } from '@/components/SectionHeader';
import { portfolioService } from '@/services/portfolio.service';
import type { ProjectItem } from '@/types/portfolio.types';
import './sections.css';

export function ProjectsSection() {
  const projects = portfolioService.getProjects();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <section id="projects" className="section-wrapper">
      <div className="section-container">
        <SectionHeader
          eyebrow="04 · Projects & Concepts"
          title="Selected Builds & System Concepts"
          subtitle="A collection of web applications and AI / smart-infrastructure concepts designed to explore real-world workflows."
        />

        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={setSelectedProject}
            />
          ))}
        </div>

        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      </div>
    </section>
  );
}

