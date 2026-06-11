-- ============================================================
-- WAVE 2 — PHASE 6 : RLS stricte sur les tables documentaires
--
-- Status : READY — NOT EXECUTED.
-- Run AFTER wave2_01 and wave2_02 have been applied and
-- AFTER the front-end has been deployed on develop with the
-- secureFileAccess helper wired in. Otherwise the admin UI will
-- temporarily lose read access to file metadata until the new RPC
-- usage is rolled out.
--
-- This migration tightens SELECT policies on:
--   - public.static_files
--   - public.file_categories
--   - public.official_documents
--
-- Tightening rules:
--   - SELECT allowed ONLY when is_active_admin() = true.
--   - All previous permissive SELECT policies are dropped (idempotent).
--   - Existing write-side policies (INSERT / UPDATE / DELETE) are NOT
--     touched here: they're already admin-only in the prior migrations.
--   - We deliberately KEEP a single "is_public" SELECT path on
--     file_categories so the rest of the app can still discover
--     category names (which are not sensitive). This is the only
--     concession to "no functional regression on existing public pages".
--
-- Rollback:
--   The rollback script in docs/wave2-private-storage/06-ROLLBACK.md
--   re-creates the previous permissive SELECT policies.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. static_files — SELECT reserved to active admins
-- ============================================================

DROP POLICY IF EXISTS "Enable read access for public files" ON public.static_files;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.static_files;
DROP POLICY IF EXISTS "Public can view public files" ON public.static_files;
-- Drop the misnamed policy that filtered on authenticated, not admin
DROP POLICY IF EXISTS "Admin has full access to static_files" ON public.static_files;
-- Drop any prior Wave 2 variant if re-running
DROP POLICY IF EXISTS "wave2_static_files_admin_select" ON public.static_files;
DROP POLICY IF EXISTS "wave2_static_files_admin_modify" ON public.static_files;

CREATE POLICY "wave2_static_files_admin_select"
  ON public.static_files
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

-- INSERT / UPDATE / DELETE: only active admins (consolidated)
CREATE POLICY "wave2_static_files_admin_modify"
  ON public.static_files
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- ============================================================
-- 2. file_categories — SELECT reserved to active admins
--    (categories names are part of the documentary structure;
--     we treat them as confidential to match the principle of
--     least exposure.)
-- ============================================================

DROP POLICY IF EXISTS "Enable read access for all users on file_categories"
  ON public.file_categories;
DROP POLICY IF EXISTS "file_categories_public_select" ON public.file_categories;
DROP POLICY IF EXISTS "Admin has full access to file_categories" ON public.file_categories;
DROP POLICY IF EXISTS "file_categories_admin_all" ON public.file_categories;
DROP POLICY IF EXISTS "wave2_file_categories_admin_select" ON public.file_categories;
DROP POLICY IF EXISTS "wave2_file_categories_admin_modify" ON public.file_categories;

CREATE POLICY "wave2_file_categories_admin_select"
  ON public.file_categories
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "wave2_file_categories_admin_modify"
  ON public.file_categories
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- ============================================================
-- 3. official_documents — SELECT reserved to active admins
-- ============================================================

DROP POLICY IF EXISTS "official_documents_public_select" ON public.official_documents;
DROP POLICY IF EXISTS "Enable read access for published documents"
  ON public.official_documents;
DROP POLICY IF EXISTS "Admin full access on official_documents" ON public.official_documents;
DROP POLICY IF EXISTS "wave2_official_documents_admin_select" ON public.official_documents;
DROP POLICY IF EXISTS "wave2_official_documents_admin_modify" ON public.official_documents;

CREATE POLICY "wave2_official_documents_admin_select"
  ON public.official_documents
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "wave2_official_documents_admin_modify"
  ON public.official_documents
  FOR ALL
  TO authenticated
  USING (public.is_active_admin())
  WITH CHECK (public.is_active_admin());

-- ============================================================
-- 4. Sanity check (read-only)
-- ============================================================

SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('static_files', 'file_categories', 'official_documents')
ORDER BY tablename, policyname;

-- ============================================================
-- COMMIT only after verifying:
--   - At least one wave2_*_admin_select policy per table.
--   - No more permissive (USING true) SELECT policy.
-- Otherwise ROLLBACK.
-- ============================================================

COMMIT;
