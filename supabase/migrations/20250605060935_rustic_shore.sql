/*
  # Fix Admin Policies and Functions

  1. Changes
    - Recreate create_admin_policies function with secure search path
    - Grant appropriate permissions

  2. Security
    - Set explicit search path to prevent injection
    - Function runs with SECURITY DEFINER
    - Proper permission grants
*/

-- Drop existing create_admin_policies function
DROP FUNCTION IF EXISTS public.create_admin_policies CASCADE;

-- Recreate function with explicit search path
CREATE OR REPLACE FUNCTION public.create_admin_policies()
RETURNS void
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql AS $$
BEGIN
  -- Add policies for each table that needs admin access
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'news' AND policyname = 'Admin has full access to news'
  ) THEN
    CREATE POLICY "Admin has full access to news" ON public.news
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' AND policyname = 'Admin has full access to events'
  ) THEN
    CREATE POLICY "Admin has full access to events" ON public.events
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Admin has full access to members'
  ) THEN
    CREATE POLICY "Admin has full access to members" ON public.members
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partners' AND policyname = 'Admin has full access to partners'
  ) THEN
    CREATE POLICY "Admin has full access to partners" ON public.partners
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' AND policyname = 'Admin has full access to contact_messages'
  ) THEN
    CREATE POLICY "Admin has full access to contact_messages" ON public.contact_messages
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.create_admin_policies TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_policies TO anon;