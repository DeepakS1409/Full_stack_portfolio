import { achievementsData } from '@/data/achievements.data';
import { educationData } from '@/data/education.data';
import { profileData } from '@/data/profile.data';
import { projectsData } from '@/data/projects.data';
import { currentlyLearningItems, skillGroups } from '@/data/skills.data';
import { techInterestsData } from '@/data/techInterests.data';

/**
 * Portfolio content service facade.
 * Keeps section components decoupled from direct static imports so
 * sections can migrate to remote API endpoints seamlessly later.
 */
export const portfolioService = {
  getProfile: () => profileData,
  getSkills: () => ({
    groups: skillGroups,
    currentlyLearning: currentlyLearningItems,
  }),
  getProjects: () => projectsData,
  getAchievements: () => achievementsData,
  getEducation: () => educationData,
  getTechInterests: () => techInterestsData,
};

