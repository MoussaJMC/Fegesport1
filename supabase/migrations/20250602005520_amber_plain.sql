-- Create admin role if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin') THEN
        CREATE ROLE admin;
    END IF;
END
$$;

-- Grant admin role full access to public schema
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Create admin user using Supabase's auth schema
INSERT INTO auth.users (
  email,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  encrypted_password
)
VALUES (
  'admin@fegesport224.org',
  '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
  '{"name": "Admin FEGESPORT"}'::jsonb,
  true,
  crypt('Admin@Fegesport224', gen_salt('bf'))
)
ON CONFLICT (email) DO UPDATE
SET 
  raw_app_meta_data = EXCLUDED.raw_app_meta_data,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  is_super_admin = EXCLUDED.is_super_admin,
  encrypted_password = EXCLUDED.encrypted_password;

-- Update RLS policies to allow admin access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin has full access to news" ON public.news;
    DROP POLICY IF EXISTS "Admin has full access to events" ON public.events;
    DROP POLICY IF EXISTS "Admin has full access to members" ON public.members;
    DROP POLICY IF EXISTS "Admin has full access to partners" ON public.partners;
    DROP POLICY IF EXISTS "Admin has full access to contact_messages" ON public.contact_messages;
    DROP POLICY IF EXISTS "Admin has full access to newsletter_subscriptions" ON public.newsletter_subscriptions;
END
$$;

ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to news" ON public.news 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to events" ON public.events 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to members" ON public.members 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to partners" ON public.partners 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to contact_messages" ON public.contact_messages 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to newsletter_subscriptions" ON public.newsletter_subscriptions 
FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');