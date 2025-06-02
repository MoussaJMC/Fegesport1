-- Create admin role
CREATE ROLE admin;

-- Grant admin role full access to public schema
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Create admin user using Supabase's auth.users() function
SELECT auth.create_user(
  'admin@fegesport224.org',
  'Admin@Fegesport224',
  '{
    "role": "admin",
    "name": "Admin FEGESPORT",
    "is_super_admin": true
  }'::jsonb
);

-- Update RLS policies to allow admin access
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