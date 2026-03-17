-- ============================================================
-- SAAMH System Migration
-- ============================================================

-- Helper function to check admin role (SECURITY DEFINER avoids RLS recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================
-- PROFILES (linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  school TEXT DEFAULT '',
  member_type TEXT DEFAULT 'สามัญ' CHECK (member_type IN ('กิตติมศักดิ์','สามัญ','วิสามัญ')),
  role TEXT NOT NULL DEFAULT 'pending' CHECK (role IN ('admin','member','pending','rejected')),
  member_code TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, phone, school, member_type, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'school', ''),
    COALESCE(NEW.raw_user_meta_data->>'member_type', 'สามัญ'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'pending')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'ข่าวสาร' CHECK (category IN ('ข่าวสาร','กิจกรรม','ประชาสัมพันธ์')),
  image_urls TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES profiles(id),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published news"
  ON news FOR SELECT
  USING (published = true);

CREATE POLICY "Admins manage news"
  ON news
  USING (is_admin());

DROP TRIGGER IF EXISTS news_updated_at ON news;
CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- COMMITTEE
-- ============================================================
CREATE TABLE IF NOT EXISTS committee (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  school TEXT DEFAULT '',
  photo_id TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE committee ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read committee"
  ON committee FOR SELECT
  USING (true);

CREATE POLICY "Admins manage committee"
  ON committee
  USING (is_admin());

-- ============================================================
-- SEMINARS
-- ============================================================
CREATE TABLE IF NOT EXISTS seminars (
  id SERIAL PRIMARY KEY,
  project_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  registration_fee NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  start_date DATE,
  end_date DATE,
  location TEXT DEFAULT '',
  max_participants INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read seminars"
  ON seminars FOR SELECT
  USING (true);

CREATE POLICY "Admins manage seminars"
  ON seminars
  USING (is_admin());

-- ============================================================
-- SEMINAR REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS seminar_registrations (
  id SERIAL PRIMARY KEY,
  seminar_id INTEGER REFERENCES seminars(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id),
  is_member BOOLEAN DEFAULT false,
  registrant_name TEXT NOT NULL,
  registrant_email TEXT NOT NULL,
  registrant_phone TEXT DEFAULT '',
  registrant_organization TEXT DEFAULT '',
  payment_slip_url TEXT DEFAULT '',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','verified','rejected')),
  receipt_number TEXT DEFAULT '',
  receipt_name TEXT DEFAULT '',
  receipt_address TEXT DEFAULT '',
  receipt_tax_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seminar_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert registration"
  ON seminar_registrations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own registrations"
  ON seminar_registrations FOR SELECT
  USING (
    profile_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Admins can update registrations"
  ON seminar_registrations FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete registrations"
  ON seminar_registrations FOR DELETE
  USING (is_admin());

-- ============================================================
-- INITIAL DATA NOTES
-- ============================================================
-- To create admin user:
-- 1. Go to Supabase Dashboard > Authentication > Users > Add User
--    Email: admin@saamh.ac.th
--    Password: Am12345678
--    (check "Auto Confirm User")
-- 2. Then run:
--    UPDATE profiles SET role='admin', full_name='ผู้ดูแลระบบ' WHERE email='admin@saamh.ac.th';
