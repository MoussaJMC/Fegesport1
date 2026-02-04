/*
  # Create Sponsors Table for LEG Page Carousel

  1. New Tables
    - `sponsors`
      - `id` (uuid, primary key)
      - `name` (text) - Sponsor name
      - `logo_url` (text) - URL to sponsor logo
      - `alt_text` (text) - Alt text for accessibility
      - `order_index` (integer) - Display order (lower = first)
      - `is_active` (boolean) - Whether sponsor is displayed
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `sponsors` table
    - Add policy for public read access to active sponsors
    - Add policies for admin users to manage sponsors

  3. Indexes
    - Index on `order_index` for sorting performance
    - Index on `is_active` for filtering active sponsors
*/

-- Create sponsors table
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text NOT NULL,
  alt_text text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_sponsors_order ON sponsors(order_index);
CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(is_active);

-- Public read policy for active sponsors
CREATE POLICY "Anyone can view active sponsors"
  ON sponsors
  FOR SELECT
  USING (is_active = true);

-- Admin policies
CREATE POLICY "Admins can view all sponsors"
  ON sponsors
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@fegesport224.org'
    )
  );

CREATE POLICY "Admins can insert sponsors"
  ON sponsors
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@fegesport224.org'
    )
  );

CREATE POLICY "Admins can update sponsors"
  ON sponsors
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@fegesport224.org'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@fegesport224.org'
    )
  );

CREATE POLICY "Admins can delete sponsors"
  ON sponsors
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'admin@fegesport224.org'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_sponsors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_sponsors_updated_at
  BEFORE UPDATE ON sponsors
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsors_updated_at();

-- Insert default sponsors
INSERT INTO sponsors (name, logo_url, alt_text, order_index, is_active) VALUES
  ('Red Bull', 'https://cdn.worldvectorlogo.com/logos/red-bull-2.svg', 'Red Bull', 1, true),
  ('Razer', 'https://cdn.worldvectorlogo.com/logos/razer-2.svg', 'Razer', 2, true),
  ('Intel', 'https://cdn.worldvectorlogo.com/logos/intel-2.svg', 'Intel', 3, true),
  ('Logitech', 'https://cdn.worldvectorlogo.com/logos/logitech-2.svg', 'Logitech', 4, true),
  ('Monster Energy', 'https://cdn.worldvectorlogo.com/logos/monster-energy-1.svg', 'Monster Energy', 5, true),
  ('Alienware', 'https://cdn.worldvectorlogo.com/logos/alienware-2.svg', 'Alienware', 6, true),
  ('NVIDIA', 'https://cdn.worldvectorlogo.com/logos/nvidia.svg', 'NVIDIA', 7, true),
  ('Kingston', 'https://cdn.worldvectorlogo.com/logos/kingston-3.svg', 'Kingston', 8, true)
ON CONFLICT DO NOTHING;
