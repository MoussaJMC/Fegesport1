-- ============================================================
-- WAVE 2 — PHASE 3 : RPC get_signed_url
--
-- Single entry point for any user-facing download of a private file.
-- Enforces:
--   - Caller is an active admin (admin_users.is_active = true
--     OR is_admin() jwt claim returns true).
--   - File exists in static_files (or official_documents — see
--     overload variants below if needed).
--   - Signed URL is issued by storage.objects with a short TTL
--     (default 15 minutes, max 1 hour for safety).
--   - The emission is journaled into download_logs.
--
-- Status : READY — NOT EXECUTED.
-- Run manually after wave2_01_infra_private_bucket_and_logs.sql
-- has been applied successfully.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Helper: is_active_admin()
--
-- Combines two strategies for robustness (matches the front-end
-- AdminGuard.tsx behaviour):
--   a. is_admin() — jwt-role-based fast path.
--   b. admin_users lookup with is_active = true — db-backed
--      ground truth.
--
-- A user is admin iff either strategy returns true.
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_admin boolean := false;
BEGIN
  -- Anonymous request -> never admin
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Strategy A: jwt claim
  BEGIN
    v_is_admin := public.is_admin();
  EXCEPTION WHEN OTHERS THEN
    v_is_admin := false;
  END;

  IF v_is_admin THEN
    RETURN true;
  END IF;

  -- Strategy B: db lookup on admin_users
  RETURN EXISTS (
    SELECT 1
      FROM public.admin_users a
     WHERE a.user_id = auth.uid()
       AND a.is_active = true
  );
END;
$$;

COMMENT ON FUNCTION public.is_active_admin() IS
  'Wave 2 helper: true if the caller is an active admin via either
   the is_admin() jwt fast-path or an admin_users row with is_active=true.';

-- Function is callable by any authenticated user (it returns boolean
-- without leaking data).
REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;

-- ============================================================
-- 2. Main RPC: get_signed_url(file_id, ttl_seconds)
--
-- Returns a signed URL for the file referenced by `file_id` in
-- the static_files table. TTL is clamped between 60s and 3600s.
--
-- Authorization
--   - Calling user MUST satisfy is_active_admin() = true.
--   - Any other caller raises 'unauthorized'.
--
-- Side effects
--   - Inserts an audit row into download_logs.
--
-- Returns
--   - text (the signed URL string).
--
-- Error contract
--   - unauthorized       -> caller is not an active admin
--   - file_not_found     -> no such file id in static_files
--   - file_missing_in_storage -> static_files row exists but bucket has no object
--   - invalid_ttl        -> caller asked for ttl < 60 or > 3600
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_signed_url(
  p_file_id      uuid,
  p_ttl_seconds  integer DEFAULT 900
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, pg_temp
AS $$
DECLARE
  v_clamped_ttl   integer;
  v_object_path   text;
  v_bucket        text := 'static-files-private';
  v_signed_url    text;
  v_filename      text;
BEGIN
  -- 1. Authorization gate
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'unauthorized'
      USING ERRCODE = '42501';
  END IF;

  -- 2. TTL clamp (60s..3600s)
  IF p_ttl_seconds IS NULL THEN
    v_clamped_ttl := 900;
  ELSIF p_ttl_seconds < 60 THEN
    RAISE EXCEPTION 'invalid_ttl: %s is below minimum 60', p_ttl_seconds
      USING ERRCODE = '22023';
  ELSIF p_ttl_seconds > 3600 THEN
    RAISE EXCEPTION 'invalid_ttl: %s exceeds maximum 3600', p_ttl_seconds
      USING ERRCODE = '22023';
  ELSE
    v_clamped_ttl := p_ttl_seconds;
  END IF;

  -- 3. Resolve the storage object path from static_files
  --    After Wave 2 migration, static_files.file_url holds the
  --    object path (not the public URL). For safety we accept both
  --    forms:
  --      - bare object key (e.g. 'uploads/abcd.pdf')
  --      - full URL (we strip the storage prefix)
  SELECT
    CASE
      WHEN sf.file_url LIKE 'https://%/storage/v1/object/%' THEN
        regexp_replace(
          sf.file_url,
          '^.*\/storage\/v1\/object\/(public|sign)\/[^/]+\/',
          ''
        )
      ELSE sf.file_url
    END,
    sf.original_filename
  INTO v_object_path, v_filename
  FROM public.static_files sf
  WHERE sf.id = p_file_id;

  IF v_object_path IS NULL THEN
    RAISE EXCEPTION 'file_not_found: %', p_file_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 4. Verify the object exists in the private bucket
  IF NOT EXISTS (
    SELECT 1 FROM storage.objects
     WHERE bucket_id = v_bucket
       AND name = v_object_path
  ) THEN
    RAISE EXCEPTION 'file_missing_in_storage: % in %', v_object_path, v_bucket
      USING ERRCODE = 'P0002';
  END IF;

  -- 5. Issue the signed URL.
  --    NOTE: storage.signed_url is not a built-in SQL helper. Two
  --    safe options are documented for the operator:
  --    Option A (default — relies on a helper installed by Supabase):
  --      SELECT extensions.create_signed_url(v_bucket, v_object_path, v_clamped_ttl)
  --      INTO v_signed_url;
  --    Option B (no extension available): call this RPC from the
  --      client and have the client follow up with
  --      supabase.storage.from(bucket).createSignedUrl(...) using the
  --      object path returned by THIS function (rename it
  --      get_signed_url_path).
  --
  --    Because not every Supabase project ships
  --    extensions.create_signed_url, we use a defensive pattern:
  --    we try to call it, and if it fails we fall back to returning
  --    the object path with a sentinel prefix that the client treats
  --    as "please call createSignedUrl yourself, you have permission".
  --    The audit log still records the emission either way.
  BEGIN
    EXECUTE format(
      'SELECT extensions.create_signed_url(%L, %L, %L::int)',
      v_bucket, v_object_path, v_clamped_ttl
    )
    INTO v_signed_url;
  EXCEPTION WHEN undefined_function OR undefined_table THEN
    -- Fallback contract:
    -- Return a synthetic "object://" URI. The frontend resolves it
    -- with the standard supabase-js call. Because the bucket is
    -- private and policies only allow admin access, this still
    -- requires an active admin session client-side.
    v_signed_url := 'object://' || v_bucket || '/' || v_object_path;
  END;

  -- 6. Audit log
  INSERT INTO public.download_logs (
    file_id,
    user_id,
    downloaded_at,
    ip_address,
    user_agent,
    source,
    filename_snapshot,
    bucket_snapshot
  )
  VALUES (
    p_file_id,
    auth.uid(),
    now(),
    -- Supabase populates these via request headers when available.
    -- They may be null when the RPC is invoked without an HTTP context
    -- (e.g. from another function), which is acceptable for audit.
    current_setting('request.header.x-forwarded-for', true),
    current_setting('request.header.user-agent', true),
    'rpc:get_signed_url',
    v_filename,
    v_bucket
  );

  RETURN v_signed_url;
END;
$$;

COMMENT ON FUNCTION public.get_signed_url(uuid, integer) IS
  'Wave 2 RPC: returns a short-lived signed URL for a static_files row.
   Requires is_active_admin(). Inserts an audit row in download_logs.
   TTL clamped to [60, 3600] seconds (default 900).';

-- Lock down execution: anon must not even see this function.
REVOKE ALL ON FUNCTION public.get_signed_url(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signed_url(uuid, integer) TO authenticated;

-- ============================================================
-- 3. Optional overload: get_signed_url_for_document(document_id)
--
-- Same contract but resolves the object via official_documents
-- instead of static_files. Useful for the OfficialDocumentsSection
-- which queries a different table. Body intentionally mirrors the
-- main RPC to keep audit + authz behaviour identical.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_signed_url_for_document(
  p_document_id  uuid,
  p_ttl_seconds  integer DEFAULT 900
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage, pg_temp
AS $$
DECLARE
  v_file_url text;
  v_proxy_static_files_id uuid;
BEGIN
  -- 1. Authorization
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'unauthorized'
      USING ERRCODE = '42501';
  END IF;

  -- 2. Resolve official_documents.file_url -> object path
  SELECT od.file_url
    INTO v_file_url
    FROM public.official_documents od
   WHERE od.id = p_document_id;

  IF v_file_url IS NULL THEN
    RAISE EXCEPTION 'document_not_found: %', p_document_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Try to find the same physical file in static_files by file_url
  --    match. If found, delegate to the main RPC (which handles signing
  --    + audit log). Otherwise, raise: a document must be backed by a
  --    static_files row.
  SELECT sf.id INTO v_proxy_static_files_id
    FROM public.static_files sf
   WHERE sf.file_url = v_file_url
   LIMIT 1;

  IF v_proxy_static_files_id IS NULL THEN
    RAISE EXCEPTION 'document_has_no_static_file: %', p_document_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN public.get_signed_url(v_proxy_static_files_id, p_ttl_seconds);
END;
$$;

COMMENT ON FUNCTION public.get_signed_url_for_document(uuid, integer) IS
  'Wave 2 RPC: same as get_signed_url but accepts an official_documents
   row id. Delegates to get_signed_url for actual signing + audit.';

REVOKE ALL ON FUNCTION public.get_signed_url_for_document(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_signed_url_for_document(uuid, integer) TO authenticated;

-- ============================================================
-- 4. Sanity check (read-only)
-- ============================================================

SELECT
  'rpc_get_signed_url' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc
     WHERE proname = 'get_signed_url' AND pronamespace = 'public'::regnamespace
  ) THEN 'OK' ELSE 'MISSING' END AS status;

SELECT
  'rpc_is_active_admin' AS check_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM pg_proc
     WHERE proname = 'is_active_admin' AND pronamespace = 'public'::regnamespace
  ) THEN 'OK' ELSE 'MISSING' END AS status;

COMMIT;
