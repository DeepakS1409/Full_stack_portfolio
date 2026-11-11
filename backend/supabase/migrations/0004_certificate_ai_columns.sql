-- ============================================================================
-- 0004_certificate_ai_columns.sql
-- Idempotent additive migration enriching existing tables for AI certificate
-- analysis tracking and query compatibility without duplicating tables.
-- ============================================================================

-- Certificates: AI analysis metadata & generated compatibility columns
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS achievement_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_generated_description text,
  ADD COLUMN IF NOT EXISTS ai_analysis_status text NOT NULL DEFAULT 'pending'
    CHECK (ai_analysis_status IN ('pending', 'completed', 'failed', 'reviewed')),
  ADD COLUMN IF NOT EXISTS ai_confidence text
    CHECK (ai_confidence IN ('high', 'medium', 'low'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'certificates'
      AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.certificates
      ADD COLUMN is_published boolean GENERATED ALWAYS AS (status = 'published') STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'certificates'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.certificates
      ADD COLUMN display_order integer GENERATED ALWAYS AS (sort_order) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_certificates_published_display_order
  ON public.certificates (is_published, display_order, created_at DESC);

-- Projects: display_order generated alias
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'projects'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.projects
      ADD COLUMN display_order integer GENERATED ALWAYS AS (sort_order) STORED;
  END IF;
END $$;

-- Skills: is_currently_learning & display_order generated aliases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'skills'
      AND column_name = 'is_currently_learning'
  ) THEN
    ALTER TABLE public.skills
      ADD COLUMN is_currently_learning boolean GENERATED ALWAYS AS (kind = 'currently_learning') STORED;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'skills'
      AND column_name = 'display_order'
  ) THEN
    ALTER TABLE public.skills
      ADD COLUMN display_order integer GENERATED ALWAYS AS (sort_order) STORED;
  END IF;
END $$;

