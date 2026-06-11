-- ============================================================
-- WAVE 2 — PHASE 2 : Infrastructure
-- Bucket prive `static-files-private` + table `download_logs` + index
-- ============================================================
--
-- Status : READY — NOT EXECUTED.
-- Run manually after review (Dashboard SQL Editor OR Supabase CLI).
--
-- This migration is IDEMPOTENT (CREATE IF NOT EXISTS / DO blocks).
-- Re-running it has no side effect.
--
-- What it does
--   1. Creates the storage bucket `static-files-private` (PRIVATE).
--   2. Locks the bucket so anonymous/public clients cannot read files
--      directly. Reads are only possible via signed URLs (issued by the
--      RPC defined in wave2_02_rpc_get_signed_url.sql).
--   3. Creates the `download_logs` table for audit trail.
--   4. Adds indexes for fast querying by file, user, time window.
--
-- What it does NOT touch
--   - The existing `static-files` (public) bucket.
--   - The existing tables: static_files, file_categories, official_documents,
--     admin_users (their RLS will be tightened in phase 6).
--   - Anything related to public pages, routing, SEO, llms.txt, etc.
--
-- Rollback
--   See doc 06-ROLLBACK.md for full procedure. Safe rollback consists of:
--     DROP TABLE IF EXISTS public.download_logs CASCADE;
--     -- then in Dashboard: delete the `static-files-private` bucket
--     -- (only if it's still empty).
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Create the private bucket
-- ============================================================
-- Using INSERT ON CONFLICT so the migration is idempotent.
-- `public = false` is the critical flag: it prevents anonymous reads
-- and requires signed URLs for every object access.
--
-- file_size_limit: 50 MB cap (matches existing app-level convention).
-- allowed_mime_types: NULL means all types allowed; tighten later if
-- the federation wants to restrict (e.g. PDF + images only).

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
)
VALUES (
  'static-files-private',
  'static-files-private',
  false,
  52428800,            -- 50 MB
  NULL,                -- all MIME types allowed (can be tightened later)
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
  SET public = false,                       -- enforce private on re-run
      file_size_limit = EXCLUDED.file_size_limit,
      updated_at = now();

-- ============================================================
-- 2. Storage policies for the new private bucket
-- ============================================================
-- IMPORTANT: even with public=false on the bucket, RLS policies on
-- storage.objects must be explicit. Otherwise admin tools (Dashboard
-- UI, supabase-cli) may still be allowed by built-in policies.
--
-- Policy model:
--   - NO SELECT policy for `anon` or `authenticated` -> impossible to
--     read object metadata anonymously.
--   - SELECT allowed only to is_admin() (for admin file management UI).
--   - INSERT / UPDATE / DELETE allowed only to is_admin().
--   - Read by end users goes EXCLUSIVELY through the RPC, which uses
--     the service-role key internally (SECURITY DEFINER).
-- ============================================================

-- Drop any leftover Wave 2 policies if a previous run left them
DROP POLICY IF EXISTS "wave2_private_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "wave2_private_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "wave2_private_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "wave2_private_admin_delete" ON storage.objects;

CREATE POLICY "wave2_private_admin_select"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'static-files-private'
    AND is_admin()
  );

CREATE POLICY "wave2_private_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'static-files-private'
    AND is_admin()
  );

CREATE POLICY "wave2_private_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'static-files-private' AND is_admin())
  WITH CHECK (bucket_id = 'static-files-private' AND is_admin());

CREATE POLICY "wave2_private_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'static-files-private' AND is_admin());

-- ============================================================
-- 3. Audit table: download_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.download_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id         uuid NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at   timestamptz NOT NULL DEFAULT now(),
  ip_address      text,
  user_agent      text,

  -- Optional context: where the request came from (admin UI, public
  -- gated viewer, etc.). Helps audit later without coupling to a
  -- specific feature.
  source          text,

  -- Optional file metadata snapshot — useful if file_id is later deleted
  filename_snapshot   text,
  bucket_snapshot     text
);

COMMENT ON TABLE public.download_logs IS
  'Wave 2 audit trail: one row per signed-URL emission. Inserted by the
   get_signed_url RPC. Read access reserved to is_admin().';

-- ============================================================
-- 4. Indexes for audit queries
-- ============================================================

CREATE INDEX IF NOT EXISTS download_logs_file_id_idx
  ON public.download_logs (file_id);

CREATE INDEX IF NOT EXISTS download_logs_user_id_idx
  ON public.download_logs (user_id);

CREATE INDEX IF NOT EXISTS download_logs_downloaded_at_idx
  ON public.download_logs (downloaded_at DESC);

-- Composite index for "recent downloads by user" admin queries
CREATE INDEX IF NOT EXISTS download_logs_user_recent_idx
  ON public.download_logs (user_id, downloaded_at DESC);

-- ============================================================
-- 5. RLS on download_logs
-- ============================================================

ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

-- Insertion: ONLY the RPC `get_signed_url` (running SECURITY DEFINER)
-- will write here. We also grant INSERT to authenticated as a safety
-- net so a buggy direct-call (debug) still logs. To restrict to RPC
-- only, replace the INSERT policy with `USING (false) WITH CHECK (false)`
-- and rely entirely on the SECURITY DEFINER bypass.

DROP POLICY IF EXISTS "download_logs_rpc_insert" ON public.download_logs;
DROP POLICY IF EXISTS "download_logs_admin_select" ON public.download_logs;
DROP POLICY IF EXISTS "download_logs_admin_delete" ON public.download_logs;

CREATE POLICY "download_logs_rpc_insert"
  ON public.download_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only allow inserting when the calling row matches the requesting
    -- user. The RPC sets user_id = auth.uid() explicitly.
    user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "download_logs_admin_select"
  ON public.download_logs
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "download_logs_admin_delete"
  ON public.download_logs
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- No UPDATE policy: audit logs must be immutable.

-- ============================================================
-- 6. Sanity check (read-only)
-- ============================================================

SELECT
  'storage_bucket' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets
     WHERE id = 'static-files-private' AND public = false
  ) THEN 'OK' ELSE 'MISSING' END AS status;

SELECT
  'download_logs_table' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = 'download_logs'
  ) THEN 'OK' ELSE 'MISSING' END AS status;

SELECT
  'download_logs_indexes' AS check_name,
  (SELECT count(*) FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'download_logs')::text
  AS status;

-- ============================================================
-- If all 3 checks above return OK, COMMIT. Otherwise ROLLBACK
-- and investigate before re-running.
-- ============================================================

COMMIT;
