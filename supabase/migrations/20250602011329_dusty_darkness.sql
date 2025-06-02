-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    image_url TEXT,
    category TEXT,
    published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TEXT,
    location TEXT,
    image_url TEXT,
    category TEXT,
    type TEXT CHECK (type IN ('online', 'in-person', 'hybrid')),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    birth_date DATE,
    address TEXT,
    city TEXT,
    member_type TEXT NOT NULL CHECK (member_type IN ('player', 'club', 'partner')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'expired')),
    membership_start DATE,
    membership_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    description TEXT,
    partnership_type TEXT NOT NULL CHECK (partnership_type IN ('sponsor', 'technical', 'media', 'institutional')),
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    partnership_start DATE,
    partnership_end DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    whatsapp TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin user
INSERT INTO auth.users (
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
)
VALUES (
    'admin@fegesport224.org',
    '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
    '{"name": "Admin FEGESPORT"}'::jsonb,
    true,
    crypt('Admin@Fegesport224', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE
SET 
    raw_app_meta_data = EXCLUDED.raw_app_meta_data,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    is_super_admin = EXCLUDED.is_super_admin,
    encrypted_password = EXCLUDED.encrypted_password,
    updated_at = NOW();

-- Enable RLS and create policies
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.news FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins" ON public.news FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.events FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins" ON public.events FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.members FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins" ON public.members FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Enable write access for admins" ON public.partners FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
) WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all users" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for admins" ON public.contact_messages FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
);

ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable insert for all users" ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for admins" ON public.newsletter_subscriptions FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
);