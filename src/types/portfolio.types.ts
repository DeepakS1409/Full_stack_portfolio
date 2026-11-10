export interface ProfileData {
  name: string;
  displayName: string;
  degree: string;
  college: string;
  batch: string;
  shortRole: string;
  professionalTitle: string;
  heroIntro: string;
  aboutParagraphs: string[];
  learningJourney: string;
  emailPlaceholder: string;
  githubUrl: string;
  linkedinUrl: string | null;
  linkedinPlaceholderNote: string;
  profileImageUrl: string;
  isProfileImagePlaceholder: boolean;
}

export interface SkillGroup {
  id: string;
  title: string;
  subtitle: string;
  accent: 'cyan' | 'blue' | 'violet';
  items: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  category: string;
  statusLabel: string;
  technologies: string[];
  highlights: string[];
  imageUrl: string;
  isPlaceholderImage: boolean;
  githubUrl: string | null;
  liveUrl: string | null;
}

export interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  organization: string;
  year: string;
  badgeText: string;
  description: string;
  accent: 'cyan' | 'blue' | 'violet';
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  status: string;
  focusAreas: string[];
  description: string;
}

export interface TechInterestItem {
  id: string;
  name: string;
  category: 'AI & Intelligence' | 'IoT & Microcontrollers' | 'Robotics & Hardware';
  description: string;
  explorationNote: string;
}

export type SectionId =
  | 'home'
  | 'about'
  | 'skills'
  | 'projects'
  | 'certificates'
  | 'achievements'
  | 'education'
  | 'tech-interests'
  | 'contact';

export interface NavItem {
  id: SectionId;
  label: string;
  index: string;
}

