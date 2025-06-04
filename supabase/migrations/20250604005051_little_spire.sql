/*
  # Admin Authentication Setup

  1. Functions
    - Creates public schema functions for admin role checking
    - Adds helper functions for policy management
    
  2. Security
    - Implements secure role checking
    - Adds necessary grants and permissions
*/

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO anon;

-- Create admin-only policies for each table
DO $$ 
BEGIN
  -- News table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'news' AND policyname = 'Admin has full access'
  ) THEN
    CREATE POLICY "Admin has full access" ON public.news
      FOR ALL
      TO public
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  -- Events table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'events' AND policyname = 'Admin has full access'
  ) THEN
    CREATE POLICY "Admin has full access" ON public.events
      FOR ALL
      TO public
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  -- Members table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'members' AND policyname = 'Admin has full access'
  ) THEN
    CREATE POLICY "Admin has full access" ON public.members
      FOR ALL
      TO public
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  -- Partners table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'partners' AND policyname = 'Admin has full access'
  ) THEN
    CREATE POLICY "Admin has full access" ON public.partners
      FOR ALL
      TO public
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;

  -- Contact messages table policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contact_messages' AND policyname = 'Admin has full access'
  ) THEN
    CREATE POLICY "Admin has full access" ON public.contact_messages
      FOR ALL
      TO public
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;