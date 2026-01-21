/*
  # Fix Security Issues
  
  ## Performance Improvements
  1. Add missing indexes for foreign keys
  2. Drop unused indexes
  
  ## Security Improvements
  3. Fix function search paths for all functions
  
  ## Notes
  - Handles trigger dependencies properly
  - Conservative approach focusing on clear security issues
*/

-- ============================================================================
-- PART 1: ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_file_usage_file_id ON public.file_usage(file_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_new ON public.profiles(user_id);

-- ============================================================================
-- PART 2: DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_event_registrations_member_id;
DROP INDEX IF EXISTS public.idx_members_user_id;
DROP INDEX IF EXISTS public.idx_news_author_id;
DROP INDEX IF EXISTS public.idx_static_files_uploaded_by;

-- ============================================================================
-- PART 3: FIX FUNCTION SEARCH PATHS
-- ============================================================================

-- Fix simple auth helper functions (no dependencies)
CREATE OR REPLACE FUNCTION public.role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    current_setting('request.jwt.claim.role', true)
  )::text;
$$;

CREATE OR REPLACE FUNCTION public.uid()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claim.sub', true)
  )::uuid;
$$;

CREATE OR REPLACE FUNCTION public.email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    current_setting('request.jwt.claim.email', true)
  )::text;
$$;

CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.role();
$$;

CREATE OR REPLACE FUNCTION public.auth_uid()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.uid();
$$;

CREATE OR REPLACE FUNCTION public.auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.email();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
    false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_translation(
  p_translation_key text,
  p_language text DEFAULT 'en'
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_translation text;
BEGIN
  SELECT translation INTO v_translation
  FROM public.translations
  WHERE translation_key = p_translation_key
  AND language = p_language;
  
  RETURN COALESCE(v_translation, p_translation_key);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_full_translation(
  p_language text DEFAULT 'en'
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_translations jsonb;
BEGIN
  SELECT jsonb_object_agg(translation_key, translation) INTO v_translations
  FROM public.translations
  WHERE language = p_language;
  
  RETURN COALESCE(v_translations, '{}'::jsonb);
END;
$$;