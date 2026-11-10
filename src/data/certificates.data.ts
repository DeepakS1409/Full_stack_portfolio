import certIgenCard from '@/assets/certificates/igen-student-member.jpg';
import certBossCertificate from '@/assets/certificates/boss-hackathon-certificate.jpg';
import certZiroCertificate from '@/assets/certificates/ziro-agentic-ai-hackathon-2026.jpg';
import type { Certificate } from '@/types/certificate.types';

/**
 * Local certificate dataset acting as the initial frontend data source.
 * To replace a placeholder with a real certificate image or PDF:
 * 1. Place the file in `src/assets/certificates/` (or host it in `public/certificates/` or a backend bucket).
 * 2. Update `assetUrl`, set `assetType` to `'image'` or `'pdf'`, and set `isPlaceholderAsset: false`.
 */
export const certificatesData: Certificate[] = [
  {
    id: 'cert-ziro-national-agentic-ai-2026',
    title: 'National Agentic AI Hackathon 2026',
    organization: 'ziro.digital',
    year: 2026,
    issueDate: '31 October 2026',
    credentialId: '68CF2091B27644D194C6D492A9012582',
    description:
      'National-level achievement with Team TRIFORGE in the Ziro Agentic AI Hackathon 2026 organised by ziro.digital (among 2,600+ builders, 800+ teams, and 300+ agentic AI projects across India), earning National Qualification Rank #132 with an evaluation score of 116/180.',
    category: 'hackathon',
    assetUrl: certZiroCertificate,
    assetType: 'image',
    isPlaceholderAsset: false,
    highlights: [
      'Team TRIFORGE',
      'National Qualification Rank #132',
      'Evaluation Score: 116/180',
    ],
    status: 'published',
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'cert-boss-1000-contributor-hackathon',
    title: 'BOSS $1000 Contributor Hackathon',
    organization: 'BOSS Console (via Unstop)',
    year: 2026,
    issueDate: '2026',
    description:
      'Certificate of Participation awarded to Deepak S (Sri Eshwar College of Engineering) for participating in the BOSS $1000 Contributor Hackathon organised by BOSS Console.',
    category: 'hackathon',
    assetUrl: certBossCertificate,
    assetType: 'image',
    isPlaceholderAsset: false,
    highlights: ['Certificate of Participation', 'BOSS Console', 'Unstop'],
    status: 'published',
    sortOrder: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
  {
    id: 'cert-igen-student-member',
    title: 'IGEN Student Member',
    organization: 'The Institution of Green Engineers (IGEN)',
    year: 2026,
    issueDate: '2026',
    validUntil: 'October 2027',
    credentialId: 'IGEN/SM26M0606',
    description:
      'Official student membership with The Institution of Green Engineers as an IGEN Non-Donor Member (Membership ID: IGEN/SM26M0606), holding G Score 25 and valid through October 2027.',
    category: 'membership',
    assetUrl: certIgenCard,
    assetType: 'image',
    isPlaceholderAsset: false,
    highlights: [
      'Non-Donor Member',
      'G Score: 25',
      'Valid until Oct 2027',
    ],
    status: 'published',
    sortOrder: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-11-10T00:00:00.000Z',
  },
];

