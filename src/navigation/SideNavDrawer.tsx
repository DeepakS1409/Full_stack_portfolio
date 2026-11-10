import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Code2,
  Cpu,
  FolderGit2,
  GraduationCap,
  Home,
  Mail,
  Menu,
  ShieldCheck,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { navItems } from './navItems';
import type { SectionId } from '@/types/portfolio.types';
import './SideNavDrawer.css';

interface SideNavDrawerProps {
  isOpen: boolean;
  activeSection: SectionId;
  onOpen: () => void;
  onClose: () => void;
  onSelectSection: (sectionId: SectionId) => void;
}

const SECTION_ICONS: Record<SectionId, LucideIcon> = {
  home: Home,
  about: User,
  skills: Code2,
  projects: FolderGit2,
  certificates: ShieldCheck,
  achievements: Award,
  education: GraduationCap,
  'tech-interests': Cpu,
  contact: Mail,
};

export function SideNavDrawer({
  isOpen,
  activeSection,
  onOpen,
  onClose,
  onSelectSection,
}: SideNavDrawerProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const activeItem = navItems.find((item) => item.id === activeSection);

  return (
    <>
      {!isOpen && (
        <button
          ref={triggerRef}
          type="button"
          className="side-nav-trigger"
          onClick={onOpen}
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="portfolio-side-navigation"
        >
          <Menu size={18} strokeWidth={1.9} color="var(--accent-cyan)" />
          <span className="side-nav-trigger-label">
            {activeItem ? activeItem.label : 'Menu'}
          </span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="side-nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />

            <motion.aside
              id="portfolio-side-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Portfolio sections navigation"
              className="side-nav-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="side-nav-header">
                <div className="side-nav-brand">
                  <span
                    className="font-display"
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      color: 'var(--text-primary)',
                    }}
                  >
                    DEEPAK S
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)' }}
                  >
                    B.Tech IT · 2026–2030
                  </span>
                </div>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="side-nav-close"
                  onClick={() => {
                    onClose();
                    triggerRef.current?.focus();
                  }}
                  aria-label="Close navigation menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav aria-label="Primary sections" style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                <ul className="side-nav-list">
                  {navItems.map((item) => {
                    const Icon = SECTION_ICONS[item.id];
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={`side-nav-link ${isActive ? 'is-active' : ''}`}
                          onClick={() => onSelectSection(item.id)}
                          aria-current={isActive ? 'location' : undefined}
                        >
                          <span className="side-nav-link-left">
                            <Icon
                              size={17}
                              strokeWidth={1.85}
                              color={isActive ? 'var(--accent-cyan)' : 'currentColor'}
                            />
                            <span>{item.label}</span>
                          </span>
                          <span className="side-nav-index">{item.index}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="side-nav-footer font-mono">
                <span>Press Esc to close</span>
                <span style={{ color: 'var(--accent-cyan)' }}>9 Sections</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

