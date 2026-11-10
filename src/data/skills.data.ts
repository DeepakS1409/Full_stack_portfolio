import type { SkillGroup } from '@/types/portfolio.types';

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    title: 'Programming',
    subtitle: 'Core languages for problem-solving and system logic',
    accent: 'cyan',
    items: ['C', 'C++', 'Python', 'JavaScript'],
  },
  {
    id: 'frontend',
    title: 'Frontend',
    subtitle: 'Interfaces, responsive layouts, and interactive components',
    accent: 'blue',
    items: ['HTML', 'CSS', 'React'],
  },
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'Development environments, version control, and prototyping',
    accent: 'violet',
    items: ['Git', 'GitHub', 'VS Code', 'Antigravity', 'Streamlit'],
  },
  {
    id: 'ai',
    title: 'AI',
    subtitle: 'Applied intelligence, prompting, and foundational concepts',
    accent: 'cyan',
    items: [
      'Generative AI',
      'AI Integration',
      'Prompt Engineering',
      'Machine Learning Fundamentals',
    ],
  },
];

export const currentlyLearningItems: {
  name: string;
  focus: string;
}[] = [
  {
    name: 'TypeScript & Modern React Architecture',
    focus: 'Type-safe frontend engineering and scalable component patterns',
  },
  {
    name: 'Agentic AI & Intelligent Routing',
    focus: 'Multi-step reasoning, multimodal inputs, and structured AI workflows',
  },
  {
    name: 'IoT & Embedded Prototyping',
    focus: 'Arduino, ESP32, sensors, and hardware–software integration',
  },
  {
    name: 'Interactive Web & 3D Graphics',
    focus: 'Three.js scenes and hardware-accelerated UI motion',
  },
];

