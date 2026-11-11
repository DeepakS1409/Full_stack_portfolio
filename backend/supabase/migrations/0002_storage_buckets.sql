-- ============================================================================
-- 0002_storage_buckets.sql
-- Supabase Storage buckets and strict RLS policies for media & documents.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'portfolio-certificates',
    'portfolio-certificates',
    true,
    10485760, -- 10 MB
    ARRAY['image/png', 'image/jpeg', 'application/pdf']
  ),
  (
    'portfolio-projects',
    'portfolio-projects',
    true,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'portfolio-achievements',
    'portfolio-achievements',
    true,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'portfolio-profile',
    'portfolio-profile',
    true,
    5242880, -- 5 MB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read access for published portfolio assets
CREATE POLICY "Public read access on portfolio storage buckets"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (
    bucket_id IN (
      'portfolio-certificates',
      'portfolio-projects',
      'portfolio-achievements',
      'portfolio-profile'
    )
  );

-- Only verified admins can upload new files
CREATE POLICY "Admins can upload to portfolio storage buckets"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    AND bucket_id IN (
      'portfolio-certificates',
      'portfolio-projects',
      'portfolio-achievements',
      'portfolio-profile'
    )
  );

-- Only verified admins can update existing files
CREATE POLICY "Admins can update portfolio storage objects"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin()
    AND bucket_id IN (
      'portfolio-certificates',
      'portfolio-projects',
      'portfolio-achievements',
      'portfolio-profile'
    )
  )
  WITH CHECK (public.is_admin());

-- Only verified admins can delete files
CREATE POLICY "Admins can delete portfolio storage objects"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin()
    AND bucket_id IN (
      'portfolio-certificates',
      'portfolio-projects',
      'portfolio-achievements',
      'portfolio-profile'
    )
  );

