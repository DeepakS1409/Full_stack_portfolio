# Deepak S — Interactive Dark Glassmorphism 3D Portfolio

Frontend portfolio application built with React, TypeScript, Vite, Three.js, Framer Motion, and Lucide Icons. Architected cleanly for future backend integration (such as Supabase or a REST API) without rewriting UI components.

## Setup & Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Architecture Overview

```text
src/
├── animations/      # Reusable Framer Motion variants & viewport presets
├── assets/          # Organized local placeholders (profile, projects, certificates)
├── components/      # Reusable UI building blocks (CursorSparksCanvas, HeroThreeScene, GlassCard, CertificateCard, CertificateModal, ProjectCard, ProjectModal)
├── data/            # Editable content datasets (profile, skills, projects, certificates, achievements, education, techInterests)
├── layouts/         # PortfolioLayout with active-section scroll tracking
├── navigation/      # Collapsible left-side glassmorphism drawer navigation
├── sections/        # All 9 portfolio sections + footer
├── services/        # Backend-ready service abstraction layer
├── styles/          # CSS design tokens, glassmorphism utilities, global styles
└── types/           # TypeScript interfaces and backend adapter contracts
```

## Updating Content

- **Profile & Social Links**: Edit `src/data/profile.data.ts` (replace `profileImageUrl`, `emailPlaceholder`, and `linkedinUrl` when ready).
- **Projects**: Edit `src/data/projects.data.ts` (add `githubUrl` or `liveUrl` strings when available).
- **Certificates**: Edit `src/data/certificates.data.ts` and replace placeholder visuals in `src/assets/certificates/` with official image scans or PDF files (`assetType: 'image' | 'pdf'`).

## Connecting a Backend Later (Certificates & Content)

The certificate gallery (`src/sections/CertificatesSection.tsx`) calls `certificateService` (`src/services/certificate.service.ts`) rather than reading `certificates.data.ts` directly.

To connect a backend or Supabase later:
1. Implement `ICertificateAdapter` (`getAll`, `getById`, `getPublished`) or configure `RemoteApiCertificateAdapter`.
2. Call `certificateService.setAdapter(yourBackendAdapter)` at startup.
3. Newly uploaded certificates will render automatically in the responsive grid and lightbox modal without changing any UI components.

