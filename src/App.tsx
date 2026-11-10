import { MotionConfig } from 'framer-motion';
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

export function App() {
  return (
    <MotionConfig reducedMotion="user">
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
    </MotionConfig>
  );
}

export default App;

