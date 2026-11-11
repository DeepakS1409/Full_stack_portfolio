# Deepak S Portfolio — Supabase Backend & AI Edge Functions

This folder contains the complete PostgreSQL schema, Storage policies, initial seed data, and Deno-based Supabase Edge Functions powering the portfolio backend.

## Structure

```text
backend/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_portfolio_schema.sql      # Tables, triggers, indexes, RLS policies, is_admin()
│   │   ├── 0002_storage_buckets.sql       # Public-read / Admin-write buckets & MIME/size limits
│   │   ├── 0003_seed_initial_data.sql     # Initial profile, skills, projects, achievements, education, interests, KB
│   │   └── 0004_certificate_ai_columns.sql # AI certificate analysis columns & compatibility aliases
│   └── functions/
│       ├── _shared/
│       │   ├── auth.ts                    # JWT verification + public.admin_users check
│       │   └── cors.ts                    # CORS headers & JSON response helpers
│       ├── analyze-certificate/index.ts   # OpenAI Vision/PDF structured certificate extractor
│       ├── ai-assistant/index.ts          # Grounded private admin AI assistant
│       └── submit-contact/index.ts        # Validated, honeypot + rate-limited public contact handler
└── README.md
```

## Step-by-Step Setup

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Disable open public sign-ups under **Authentication -> Providers -> Email** (or **Authentication -> Sign In / Up -> Allow new users to sign up = OFF**) so only invited/created admin users exist.

### 2. Run Database & Storage Migrations
Using the **Supabase CLI** (recommended) or pasting each file into **Supabase Dashboard -> SQL Editor** in order:
1. `backend/supabase/migrations/0001_portfolio_schema.sql`
2. `backend/supabase/migrations/0002_storage_buckets.sql`
3. `backend/supabase/migrations/0003_seed_initial_data.sql`
4. `backend/supabase/migrations/0004_certificate_ai_columns.sql`

With Supabase CLI:
```bash
npx supabase login
npx supabase link --project-ref <YOUR_PROJECT_REF> --workdir backend
npx supabase db push --workdir backend
```

### 3. Create Your Admin Account
1. In **Supabase Dashboard -> Authentication -> Users**, click **Add user -> Create new user** with your email and a strong password (check **Auto Confirm User**).
2. Copy the created user's `UID` (`id`).
3. Register that user as an authorized portfolio admin in **SQL Editor**:
```sql
INSERT INTO public.admin_users (user_id, email, role)
VALUES ('<YOUR_AUTH_USER_UUID>', '<YOUR_ADMIN_EMAIL>', 'admin');
```
> Without an entry in `public.admin_users`, no authenticated user can read private tables (`contact_messages`, `personal_knowledge`) or mutate any portfolio data.

### 4. Configure Edge Function Secrets
Never place `OPENAI_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` in frontend environment variables. Set them strictly in Supabase Edge Function secrets:

```bash
npx supabase secrets set \
  OPENAI_API_KEY=sk-your-openai-key \
  OPENAI_VISION_MODEL=gpt-4o-mini \
  OPENAI_ASSISTANT_MODEL=gpt-4o-mini \
  ALLOWED_ORIGIN=https://your-vercel-domain.vercel.app \
  RATE_LIMIT_SALT=$(openssl rand -hex 16) \
  --workdir backend
```
(`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected into Supabase Edge Functions.)

### 5. Deploy Edge Functions
```bash
npx supabase functions deploy analyze-certificate --no-verify-jwt --workdir backend
npx supabase functions deploy ai-assistant --no-verify-jwt --workdir backend
npx supabase functions deploy submit-contact --no-verify-jwt --workdir backend
```
> Note: `analyze-certificate` and `ai-assistant` verify the Supabase JWT AND check `public.admin_users` inside `_shared/auth.ts` so `OPTIONS` CORS preflight passes cleanly while unauthorized requests still receive `401` / `403`.

### 6. Seed Your 3 Initial Certificates via `/admin`
Once connected, open `/admin` on your frontend, sign in, and upload your 3 existing certificate files (`ziro-agentic-ai-hackathon-2026.jpg`, `boss-hackathon-certificate.jpg`, `igen-student-member.jpg`), test **"Analyze with AI"**, review the extracted fields, and publish them into Supabase Storage + PostgreSQL.

