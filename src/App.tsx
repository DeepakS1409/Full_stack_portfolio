import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CursorSparksCanvas } from '@/components/CursorSparksCanvas';
import { PortfolioLayout } from '@/layouts/PortfolioLayout';
import { AboutSection } from '@/sections/AboutSection';
import { AchievementsSection } from '@/sections/AchievementsSection';
import { CertificatesSection } from '@/sections/CertificatesSection';
import { ContactSection } from '@/sections/ContactSection';
import { EducationSection } from '@/sections/EducationSection';
import { FooterSection } from '@/sections/FooterSection';
import { HeroSection } from '@/sections/HeroSection';
import { ProjectsSection } from '@/sections/ProjectsSection';
import { SkillsSection } from '@/sections/SkillsSection';
import { TechInterestsSection } from '@/sections/TechInterestsSection';

const AdminApp = lazy(async () => {
  const [{ AdminAuthProvider }, { AdminDashboardPage }] = await Promise.all([
    import('@/admin/AdminAuthContext'),
    import('@/admin/AdminDashboardPage'),
  ]);

  return {
    default: function AdminShell({ onNavigateHome }: { onNavigateHome: () => void }) {
      return (
        <AdminAuthProvider>
          <AdminDashboardPage onNavigateHome={onNavigateHome} />
        </AdminAuthProvider>
      );
    },
  };
});

function isAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

export function App() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateHome = useCallback(() => {
    window.history.pushState({}, '', '/');
    setPathname('/');
  }, []);

  const showAdmin = isAdminPath(pathname);

  return (
    <MotionConfig reducedMotion="user">
      {showAdmin ? (
        <div style={{ position: 'relative', minHeight: '100vh' }}>
          <CursorSparksCanvas />
          <Suspense
            fallback={
              <div
                style={{
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-secondary)',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Loader2 size={22} color="var(--accent-cyan)" className="animate-spin" />
                <span className="font-mono">Loading Admin Console...</span>
              </div>
            }
          >
            <AdminApp onNavigateHome={navigateHome} />
          </Suspense>
        </div>
      ) : (
        <PortfolioLayout>
          <HeroSection />
          <div className="section-divider" aria-hidden="true" />
          <AboutSection />
          <div className="section-divider" aria-hidden="true" />
          <SkillsSection />
          <div className="section-divider" aria-hidden="true" />
          <ProjectsSection />
          <div className="section-divider" aria-hidden="true" />
          <CertificatesSection />
          <div className="section-divider" aria-hidden="true" />
          <AchievementsSection />
          <div className="section-divider" aria-hidden="true" />
          <EducationSection />
          <div className="section-divider" aria-hidden="true" />
          <TechInterestsSection />
          <div className="section-divider" aria-hidden="true" />
          <ContactSection />
          <FooterSection />
        </PortfolioLayout>
      )}
    </MotionConfig>
  );
}

export default App;
