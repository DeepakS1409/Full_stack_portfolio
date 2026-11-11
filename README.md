# Deepak S — Interactive Dark Glassmorphism 3D Portfolio (Full-Stack)

Full-stack portfolio built with **React + TypeScript + Vite + Three.js + Framer Motion** on the frontend and **Supabase (PostgreSQL, Auth, Storage, Edge Functions) + OpenAI Vision/Responses API** on the backend.

## Folder Structure

```text
Portfolio_full_stack/
├── .env.example
├── vercel.json                       # SPA rewrites for /admin routes on Vercel
├── index.html
├── package.json
├── src/                              # Existing dark glassmorphism frontend + private /admin console
│   ├── admin/                        # Private /admin login, auth guard, AI & CRUD dashboard tabs
│   ├── animations/
│   ├── assets/
│   ├── components/
│   ├── data/                         # Local fallback data when Supabase env vars are not set
│   ├── hooks/
│   ├── layouts/
│   ├── lib/supabase.ts               # Browser Supabase client (anon key only)
│   ├── navigation/
│   ├── sections/
│   ├── services/                     # Supabase + fallback adapters (certificates, portfolio, auth, contact, AI, storage)
│   ├── styles/
│   └── types/
└── backend/                          # Supabase database, storage, and Edge Functions
    ├── README.md
    └── supabase/
        ├── config.toml
        ├── migrations/
        │   ├── 0001_portfolio_schema.sql
        │   ├── 0002_storage_buckets.sql
        │   └── 0003_seed_initial_data.sql
        └── functions/
            ├── _shared/
            ├── analyze-certificate/
            ├── ai-assistant/
            └── submit-contact/
```

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local
npm run dev
```

- Public Portfolio: `http://localhost:5173/`
- Private Admin Console: `http://localhost:5173/admin`

## Connecting the Existing Vercel Frontend to Supabase

1. Follow `backend/README.md` to create your Supabase project, apply the 3 SQL migrations, create your admin user in `auth.users` + `public.admin_users`, set Edge Function secrets (`OPENAI_API_KEY`, `ALLOWED_ORIGIN`, etc.), and deploy the 3 Edge Functions.
2. In **Vercel -> Project -> Settings -> Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase Project URL (`https://<ref>.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY` = your Supabase **anon / public** key
3. **Never** add `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to Vercel frontend variables.
4. Trigger a Vercel redeploy (`git push` or **Deployments -> Redeploy**).
5. Visit `https://your-domain.vercel.app/admin` to sign in and manage certificates, AI extraction, projects, achievements, skills, profile, knowledge base, and messages.
