-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enable Row Level Security
alter table if exists news enable row level security;
alter table if exists events enable row level security;
alter table if exists members enable row level security;
alter table if exists partners enable row level security;
alter table if exists newsletter_subscriptions enable row level security;
alter table if exists contact_messages enable row level security;

-- News table
create table if not exists news (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  excerpt text,
  content text,
  image_url text,
  category text,
  author_id uuid references auth.users,
  published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events table
create table if not exists events (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  date date not null,
  time text,
  location text,
  image_url text,
  category text,
  type text check (type in ('online', 'in-person', 'hybrid')),
  max_participants integer,
  current_participants integer default 0,
  registration_deadline timestamp with time zone,
  price numeric(10,2),
  status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Members table
create table if not exists members (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users,
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  birth_date date,
  address text,
  city text,
  member_type text not null check (member_type in ('player', 'club', 'partner')),
  status text default 'pending' check (status in ('pending', 'active', 'suspended', 'expired')),
  membership_start date,
  membership_end date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Partners table
create table if not exists partners (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  logo_url text,
  website text,
  description text,
  partnership_type text not null check (partnership_type in ('sponsor', 'technical', 'media', 'institutional')),
  contact_name text,
  contact_email text,
  contact_phone text,
  partnership_start date,
  partnership_end date,
  status text default 'active' check (status in ('active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Event registrations table
create table if not exists event_registrations (
  id uuid default uuid_generate_v4() primary key,
  event_id uuid references events not null,
  member_id uuid references members not null,
  registration_date timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text default 'pending' check (payment_status in ('pending', 'completed', 'failed')),
  payment_amount numeric(10,2),
  payment_date timestamp with time zone,
  unique(event_id, member_id)
);

-- Newsletter subscriptions table
create table if not exists newsletter_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  whatsapp text,
  status text default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Contact messages table
create table if not exists contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  status text default 'unread' check (status in ('unread', 'read', 'replied')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
-- News policies
create policy "Enable read access for all users" on news for select using (true);
create policy "Enable insert for authenticated users only" on news for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on news for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on news for delete using (auth.role() = 'authenticated');

-- Events policies
create policy "Enable read access for all users" on events for select using (true);
create policy "Enable insert for authenticated users only" on events for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on events for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on events for delete using (auth.role() = 'authenticated');

-- Members policies
create policy "Enable read access for authenticated users" on members for select using (auth.role() = 'authenticated');
create policy "Enable insert for all users" on members for insert with check (true);
create policy "Enable update for own profile" on members for update using (auth.uid() = user_id);
create policy "Enable delete for own profile" on members for delete using (auth.uid() = user_id);

-- Partners policies
create policy "Enable read access for all users" on partners for select using (true);
create policy "Enable insert for authenticated users only" on partners for insert with check (auth.role() = 'authenticated');
create policy "Enable update for authenticated users only" on partners for update using (auth.role() = 'authenticated');
create policy "Enable delete for authenticated users only" on partners for delete using (auth.role() = 'authenticated');

-- Event registrations policies
create policy "Enable read access for authenticated users" on event_registrations for select using (auth.role() = 'authenticated');
create policy "Enable insert for authenticated users" on event_registrations for insert with check (auth.role() = 'authenticated');
create policy "Enable update for own registrations" on event_registrations for update using (
  exists (
    select 1 from members
    where members.id = event_registrations.member_id
    and members.user_id = auth.uid()
  )
);

-- Newsletter subscriptions policies
create policy "Enable insert for all users" on newsletter_subscriptions for insert with check (true);
create policy "Enable read for authenticated users" on newsletter_subscriptions for select using (auth.role() = 'authenticated');
create policy "Enable update for own subscription" on newsletter_subscriptions for update using (email = auth.email());

-- Contact messages policies
create policy "Enable insert for all users" on contact_messages for insert with check (true);
create policy "Enable read for authenticated users" on contact_messages for select using (auth.role() = 'authenticated');
create policy "Enable update for authenticated users" on contact_messages for update using (auth.role() = 'authenticated');