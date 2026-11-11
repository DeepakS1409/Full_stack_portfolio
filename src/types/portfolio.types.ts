export interface ProfileData {
  id?: string;
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
  profileImagePath?: string | null;
  isProfileImagePlaceholder: boolean;
}

export interface SocialLinkItem {
  id: string;
  profileId: string;
  platform: string;
  label: string;
  url: string | null;
  placeholderNote: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface SkillGroup {
  id: string;
  title: string;
  subtitle: string;
  accent: 'cyan' | 'blue' | 'violet';
  items: string[];
}

export interface SkillRecord {
  id: string;
  kind: 'skill' | 'currently_learning';
  groupKey: string;
  groupTitle: string;
  groupSubtitle: string;
  accent: 'cyan' | 'blue' | 'violet';
  name: string;
  focusNote: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface ProjectItem {
  id: string;
  slug?: string;
  name: string;
  tagline: string;
  description: string;
  details: string;
  category: string;
  statusLabel: string;
  technologies: string[];
  highlights: string[];
  imageUrl: string;
  storagePath?: string | null;
  isPlaceholderImage: boolean;
  githubUrl: string | null;
  liveUrl: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface AchievementItem {
  id: string;
  slug?: string;
  title: string;
  subtitle: string;
  organization: string;
  year: string;
  badgeText: string;
  description: string;
  accent: 'cyan' | 'blue' | 'violet';
  imageUrl?: string | null;
  storagePath?: string | null;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface EducationItem {
  id: string;
  slug?: string;
  degree: string;
  institution: string;
  period: string;
  status: string;
  focusAreas: string[];
  description: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface TechInterestItem {
  id: string;
  slug?: string;
  name: string;
  category: 'AI & Intelligence' | 'IoT & Microcontrollers' | 'Robotics & Hardware';
  description: string;
  explorationNote: string;
  sortOrder?: number;
  isPublished?: boolean;
}

export interface ContactMessageItem {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
}

export interface PersonalKnowledgeItem {
  id: string;
  title: string;
  sourceType: 'manual' | 'chatgpt_export' | 'project_note' | 'career_note';
  tags: string[];
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AssistantMode =
  | 'certificate_description'
  | 'linkedin_post'
  | 'project_summary'
  | 'category_suggestion'
  | 'clarity_polish'
  | 'portfolio_qa';

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
