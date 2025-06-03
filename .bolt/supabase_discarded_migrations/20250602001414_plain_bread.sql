-- Create admin role
CREATE ROLE admin;

-- Grant admin role full access to public schema
GRANT ALL ON SCHEMA public TO admin;
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
BEGIN
  -- Create admin user if it doesn't exist
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    is_super_admin
  )
  VALUES (
    'admin@fegesport224.org',
    crypt('Admin@Fegesport224', gen_salt('bf')),
    now(),
    'admin',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin FEGESPORT"}',
    now(),
    now(),
    '',
    '',
    true
  )
  ON CONFLICT (email) DO NOTHING;

  -- Grant admin role to the user
  INSERT INTO auth.users_roles (user_id, role)
  SELECT id, 'admin'
  FROM auth.users
  WHERE email = 'admin@fegesport224.org'
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_admin_user();

-- Update RLS policies to allow admin access
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access" ON public.news FOR ALL USING (
  auth.role() = 'admin'
) WITH CHECK (
  auth.role() = 'admin'
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access" ON public.events FOR ALL USING (
  auth.role() = 'admin'
) WITH CHECK (
  auth.role() = 'admin'
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access" ON public.members FOR ALL USING (
  auth.role() = 'admin'
) WITH CHECK (
  auth.role() = 'admin'
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access" ON public.partners FOR ALL USING (
  auth.role() = 'admin'
) WITH CHECK (
  auth.role() = 'admin'
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access" ON public.contact_messages FOR ALL USING (
  auth.role() = 'admin'
) WITH CHECK (
  auth.role() = 'admin'
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin has full access" ON public.newsletter_subscriptions FOR ALL USING (
  auth.role() = 'admin'
) WITH CHECK (
  auth.role() = 'admin'
);