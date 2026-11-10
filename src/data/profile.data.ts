import profilePhoto from '@/assets/profile/deepak-profile.jpg';
import type { ProfileData } from '@/types/portfolio.types';

export const profileData: ProfileData = {
  name: 'Deepak S',
  displayName: 'DEEPAK S',
  degree: 'B.Tech Information Technology',
  college: 'Sri Eshwar College of Engineering',
  batch: '2026–2030',
  shortRole: 'Aspiring IT Professional',
  professionalTitle:
    'Aspiring IT Professional | Software Development | Artificial Intelligence | Technology Enthusiast',
  heroIntro:
    'An aspiring IT professional interested in software development, artificial intelligence, and innovative technology solutions. Passionate about learning, building projects, and exploring new technologies.',
  aboutParagraphs: [
    'I am Deepak S, an undergraduate student pursuing B.Tech Information Technology (2026–2030) at Sri Eshwar College of Engineering. My academic path is centered on building a solid foundation in programming, software systems, and modern computing.',
    'I am deeply interested in software development and artificial intelligence—particularly how generative AI, intelligent automation, and clean frontend engineering can come together to solve real-world problems.',
    'Alongside software, I actively explore hardware-oriented technologies such as IoT, Arduino, ESP32, robotics, and embedded systems, aiming to bridge software intelligence with physical hardware.',
  ],
  learningJourney:
    'Currently focused on strengthening core programming fundamentals in C, C++, Python, and JavaScript while building interactive web experiences with React and exploring practical AI integration workflows.',
  // Update with your real contact email when ready
  emailPlaceholder: 'deepaks.portfolio@example.com',
  githubUrl: 'https://github.com/DeepakS1409',
  // Replace `null` with your actual LinkedIn profile URL when ready
  linkedinUrl: null,
  linkedinPlaceholderNote:
    'LinkedIn profile URL placeholder — update `linkedinUrl` in src/data/profile.data.ts when available.',
  profileImageUrl: profilePhoto,
  isProfileImagePlaceholder: false,
};

