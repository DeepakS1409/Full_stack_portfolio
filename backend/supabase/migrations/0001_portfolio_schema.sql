-- ============================================================================
-- 0001_portfolio_schema.sql
-- Complete PostgreSQL schema, indexes, triggers, and Row Level Security (RLS)
-- for Deepak S Portfolio Backend.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Updated-at trigger helper
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- Admin authorization table & RLS helper
-- Only users registered here (via Supabase Dashboard / SQL / service_role)
-- are recognized as portfolio administrators.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

CREATE POLICY "Admins can view their own admin record"
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 1. Profiles
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE DEFAULT 'primary',
  name text NOT NULL,
  display_name text NOT NULL,
  degree text NOT NULL,
  college text NOT NULL,
  batch text NOT NULL,
  short_role text NOT NULL,
  professional_title text NOT NULL,
  hero_intro text NOT NULL,
  about_paragraphs jsonb NOT NULL DEFAULT '[]'::jsonb,
  learning_journey text NOT NULL,
  contact_email text NOT NULL DEFAULT '',
  profile_image_path text,
  profile_image_url text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. Social Links
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  label text NOT NULL,
  url text,
  placeholder_note text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  UNIQUE (profile_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_links_published_sort
  ON public.social_links (is_published, sort_order);

CREATE TRIGGER trg_social_links_updated_at
  BEFORE UPDATE ON public.social_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published social links"
  ON public.social_links
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to social links"
  ON public.social_links
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Certificates
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  title text NOT NULL,
  organization text NOT NULL,
  recipient_name text,
  year integer NOT NULL CHECK (year >= 1990 AND year <= 2100),
  issue_date text NOT NULL,
  valid_until text,
  credential_id text,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('hackathon', 'membership', 'certification', 'workshop')),
  asset_url text NOT NULL,
  storage_path text,
  asset_type text NOT NULL CHECK (asset_type IN ('image', 'pdf')),
  thumbnail_url text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_extracted_json jsonb,
  ai_reviewed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_certificates_status_sort
  ON public.certificates (status, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_certificates_category
  ON public.certificates (category);

CREATE TRIGGER trg_certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published certificates"
  ON public.certificates
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins have full access to certificates"
  ON public.certificates
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Projects
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL,
  details text NOT NULL DEFAULT '',
  category text NOT NULL,
  status_label text NOT NULL DEFAULT 'Project Build',
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_url text,
  storage_path text,
  github_url text,
  live_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_projects_published_sort
  ON public.projects (is_published, sort_order, created_at DESC);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published projects"
  ON public.projects
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Achievements
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  organization text NOT NULL,
  achieved_date text NOT NULL,
  badge_text text NOT NULL DEFAULT '',
  description text NOT NULL,
  accent text NOT NULL DEFAULT 'cyan' CHECK (accent IN ('cyan', 'blue', 'violet')),
  image_url text,
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_achievements_published_sort
  ON public.achievements (is_published, sort_order, created_at DESC);

CREATE TRIGGER trg_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published achievements"
  ON public.achievements
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to achievements"
  ON public.achievements
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Skills (covers Programming, Frontend, Tools, AI, and Currently Learning)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'skill' CHECK (kind IN ('skill', 'currently_learning')),
  group_key text NOT NULL,
  group_title text NOT NULL,
  group_subtitle text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'cyan' CHECK (accent IN ('cyan', 'blue', 'violet')),
  name text NOT NULL,
  focus_note text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_skills_published_kind_sort
  ON public.skills (is_published, kind, group_key, sort_order);

CREATE TRIGGER trg_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published skills"
  ON public.skills
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to skills"
  ON public.skills
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Education
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  degree text NOT NULL,
  institution text NOT NULL,
  period text NOT NULL,
  status_label text NOT NULL DEFAULT 'Currently Pursuing',
  focus_areas jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_education_published_sort
  ON public.education (is_published, sort_order);

CREATE TRIGGER trg_education_updated_at
  BEFORE UPDATE ON public.education
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published education"
  ON public.education
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to education"
  ON public.education
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Tech Interests
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tech_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('AI & Intelligence', 'IoT & Microcontrollers', 'Robotics & Hardware')),
  description text NOT NULL,
  exploration_note text NOT NULL DEFAULT 'Active Exploration Area',
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_tech_interests_published_sort
  ON public.tech_interests (is_published, sort_order);

CREATE TRIGGER trg_tech_interests_updated_at
  BEFORE UPDATE ON public.tech_interests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.tech_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published tech interests"
  ON public.tech_interests
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins have full access to tech interests"
  ON public.tech_interests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. Contact Messages & Rate Limiting (Private to Admin; inserted via Edge Function)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name text NOT NULL CHECK (char_length(sender_name) BETWEEN 2 AND 120),
  sender_email text NOT NULL CHECK (char_length(sender_email) BETWEEN 5 AND 254),
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 3 AND 200),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 4000),
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_status_created
  ON public.contact_messages (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contact_messages_ip_created
  ON public.contact_messages (ip_hash, created_at DESC);

CREATE TRIGGER trg_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Public cannot read, insert, update, or delete contact_messages directly.
-- Submissions go through the `submit-contact` Edge Function (service_role)
-- after validation, honeypot, and rate-limit enforcement.
CREATE POLICY "Admins can manage contact messages"
  ON public.contact_messages
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. Personal Knowledge Base (Strictly Private to Admin & AI Assistant)
-- Stores owner-supplied notes and manually exported/curated summaries.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.personal_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'chatgpt_export', 'project_note', 'career_note')),
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_personal_knowledge_active_updated
  ON public.personal_knowledge (is_active, updated_at DESC);

CREATE TRIGGER trg_personal_knowledge_updated_at
  BEFORE UPDATE ON public.personal_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.personal_knowledge ENABLE ROW LEVEL SECURITY;

-- Strictly admin-only; public visitors have zero access.
CREATE POLICY "Admins have full access to personal knowledge"
  ON public.personal_knowledge
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

