-- Create admin role check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT CASE 
      WHEN auth.jwt()->>'role' = 'admin' THEN true
      ELSE false
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies for admin access
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- News policies
CREATE POLICY "Allow read access for all users on news"
  ON news FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all access for admin users on news"
  ON news FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Events policies
CREATE POLICY "Allow read access for all users on events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all access for admin users on events"
  ON events FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Members policies
CREATE POLICY "Allow read access for authenticated users on members"
  ON members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow all access for admin users on members"
  ON members FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Partners policies
CREATE POLICY "Allow read access for all users on partners"
  ON partners FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all access for admin users on partners"
  ON partners FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Contact messages policies
CREATE POLICY "Allow insert for all users on contact_messages"
  ON contact_messages FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all access for admin users on contact_messages"
  ON contact_messages FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Newsletter subscriptions policies
CREATE POLICY "Allow insert for all users on newsletter_subscriptions"
  ON newsletter_subscriptions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all access for admin users on newsletter_subscriptions"
  ON newsletter_subscriptions FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());

-- Event registrations policies
CREATE POLICY "Allow read own registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id 
      FROM members 
      WHERE id = event_registrations.member_id
    )
  );

CREATE POLICY "Allow all access for admin users on event_registrations"
  ON event_registrations FOR ALL
  TO public
  USING (is_admin())
  WITH CHECK (is_admin());