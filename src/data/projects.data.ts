import deepkartVisual from '@/assets/projects/project-deepkart.svg';
import factorymindVisual from '@/assets/projects/project-factorymind.svg';
import whatsappAiVisual from '@/assets/projects/project-whatsapp-ai.svg';
import padikaVisual from '@/assets/projects/project-padika.svg';
import smartParkingVisual from '@/assets/projects/project-smart-parking.svg';
import streetLightVisual from '@/assets/projects/project-street-light.svg';
import type { ProjectItem } from '@/types/portfolio.types';

/**
 * Editable project catalog.
 * Add `githubUrl` or `liveUrl` strings when repositories or deployments are available.
 */
export const projectsData: ProjectItem[] = [
  {
    id: 'deepkart',
    name: 'DeepKart',
    tagline: 'Full-featured E-Commerce Web Experience',
    description:
      'An e-commerce website with product browsing, cart, wishlist, checkout, orders and profile features.',
    details:
      'DeepKart explores end-to-end online retail workflows on the frontend: structured catalog browsing, interactive cart and wishlist state management, checkout flow design, order tracking views, and user profile management.',
    category: 'Web Application',
    statusLabel: 'Project Build',
    technologies: ['HTML', 'CSS', 'JavaScript', 'React'],
    highlights: [
      'Product browsing and category discovery',
      'Cart and wishlist state management',
      'Checkout, order overview, and profile flows',
    ],
    imageUrl: deepkartVisual,
    isPlaceholderImage: true,
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: 'factorymind-ai',
    name: 'FactoryMind AI',
    tagline: 'AI Digital Twin & Autonomous Scheduling Concept',
    description:
      'An AI Digital Twin and Autonomous Production Scheduling concept for industrial production management.',
    details:
      'FactoryMind AI conceptualizes a digital twin interface for manufacturing environments, combining real-time production visibility with AI-assisted autonomous scheduling to help optimize floor throughput and resource allocation.',
    category: 'AI Concept',
    statusLabel: 'System Concept',
    technologies: ['Generative AI', 'AI Integration', 'Python', 'Streamlit'],
    highlights: [
      'Digital twin production floor representation',
      'Autonomous scheduling workflow concept',
      'Decision-support insights for production management',
    ],
    imageUrl: factorymindVisual,
    isPlaceholderImage: true,
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: 'whatsapp-ai-intelligence-center',
    name: 'WhatsApp AI Intelligence Center',
    tagline: 'Multimodal Message Analysis & Routing System',
    description:
      'An AI-based message analysis and routing system with image and voice classification.',
    details:
      'Designed to process incoming conversational inputs across text, image, and voice formats, classify intent or urgency, and route messages intelligently to the appropriate workflow or responder.',
    category: 'AI & Automation',
    statusLabel: 'System Concept',
    technologies: ['AI Integration', 'Prompt Engineering', 'Python', 'Generative AI'],
    highlights: [
      'Automated message classification and routing',
      'Image and voice input analysis pipeline',
      'Centralized intelligence overview concept',
    ],
    imageUrl: whatsappAiVisual,
    isPlaceholderImage: true,
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: 'padika-ai',
    name: 'Padika AI',
    tagline: 'AI-Powered Educational Assistant Concept',
    description:
      'An AI-powered educational assistant concept for learning and academic information.',
    details:
      'Padika AI focuses on making academic information and learning support more accessible for students through structured, AI-guided explanations and interactive study assistance.',
    category: 'EdTech & AI',
    statusLabel: 'Product Concept',
    technologies: ['Generative AI', 'Prompt Engineering', 'JavaScript', 'React'],
    highlights: [
      'Student-oriented academic query assistance',
      'Structured learning explanations',
      'Clean, distraction-free study interface concept',
    ],
    imageUrl: padikaVisual,
    isPlaceholderImage: true,
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: 'smart-parking-system',
    name: 'Smart Parking System',
    tagline: 'QR Entry/Exit & Slot Navigation Concept',
    description:
      'A mobile parking application concept with QR-based entry and exit, booking and slot navigation.',
    details:
      'Addresses urban parking friction by combining advance slot booking, QR-code gate verification for seamless entry and exit, and guided in-lot navigation toward reserved spaces.',
    category: 'Smart Mobility Concept',
    statusLabel: 'Mobile Concept',
    technologies: ['JavaScript', 'React', 'QR Workflow', 'IoT Concept'],
    highlights: [
      'QR-based entry and exit verification flow',
      'Advance parking slot booking experience',
      'Guided slot navigation concept',
    ],
    imageUrl: smartParkingVisual,
    isPlaceholderImage: true,
    githubUrl: null,
    liveUrl: null,
  },
  {
    id: 'hybrid-smart-street-light',
    name: 'Hybrid Smart Street Light Fault Monitoring System',
    tagline: 'Smart Infrastructure & Field Routing Concept',
    description:
      'A smart infrastructure concept with fault monitoring, QR-based complaints, location tracking and worker routing.',
    details:
      'Combines sensor-aware fault detection concepts with citizen-friendly QR-code pole reporting, geolocation tagging, and optimized maintenance worker routing to reduce municipal streetlight downtime.',
    category: 'Smart Infrastructure Concept',
    statusLabel: 'Hardware–Software Concept',
    technologies: ['IoT Concept', 'Embedded Systems', 'Sensors', 'Web Dashboard'],
    highlights: [
      'Automated fault monitoring architecture',
      'QR-based public complaint intake per pole',
      'Location tracking and technician routing flow',
    ],
    imageUrl: streetLightVisual,
    isPlaceholderImage: true,
    githubUrl: null,
    liveUrl: null,
  },
];

