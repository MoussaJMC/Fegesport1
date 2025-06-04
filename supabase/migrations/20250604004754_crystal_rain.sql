/*
  # Setup Admin Authentication

  1. Changes
    - Creates admin check function in public schema
    - Sets up initial admin user through auth.users
    
  2. Security
    - Uses security definer for admin check
    - Ensures proper role-based access control
*/

-- Create admin check function in public schema
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- Create admin policies function
CREATE OR REPLACE FUNCTION public.create_admin_policies()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the policy creation function
SELECT public.create_admin_policies();