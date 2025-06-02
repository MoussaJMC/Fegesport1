-- Create admin role
CREATE ROLE admin;

-- Grant admin role full access to public schema
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Create admin user with proper metadata
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  confirmed_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@fegesport224.org',
  crypt('Admin@Fegesport224', gen_salt('bf')),
  now(),
  now(),
  '',
  now(),
  '',
  now(),
  '',
  '',
  now(),
  now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
  '{"name": "Admin FEGESPORT"}'::jsonb,
  true,
  now(),
  now(),
  null,
  null,
  '',
  '',
  now(),
  '',
  0,
  null,
  '',
  now(),
  now()
);

-- Update RLS policies to allow admin access
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to news" ON public.news 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to events" ON public.events 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to members" ON public.members 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to partners" ON public.partners 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to contact_messages" ON public.contact_messages 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access to newsletter_subscriptions" ON public.newsletter_subscriptions 
FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'admin'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin'::text);