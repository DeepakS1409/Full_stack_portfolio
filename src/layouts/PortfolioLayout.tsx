import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { CursorSparksCanvas } from '@/components/CursorSparksCanvas';
import { SideNavDrawer } from '@/navigation/SideNavDrawer';
import { navItems } from '@/navigation/navItems';
import type { SectionId } from '@/types/portfolio.types';

interface PortfolioLayoutProps {
  children: ReactNode;
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('home');

  useEffect(() => {
    const sectionElements = navItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      {
        rootMargin: '-25% 0px -45% 0px',
        threshold: [0.1, 0.3, 0.6],
      },
    );

    for (const el of sectionElements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  const handleSelectSection = useCallback((sectionId: SectionId) => {
    setIsNavOpen(false);
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <CursorSparksCanvas />

      <SideNavDrawer
        isOpen={isNavOpen}
        activeSection={activeSection}
        onOpen={() => setIsNavOpen(true)}
        onClose={() => setIsNavOpen(false)}
        onSelectSection={handleSelectSection}
      />

      <main className="portfolio-shell">{children}</main>
    </div>
  );
}

