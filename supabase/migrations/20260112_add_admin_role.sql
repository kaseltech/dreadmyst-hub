-- Add admin role to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Set initial admins
UPDATE profiles SET is_admin = TRUE WHERE username IN ('jaded', 'barelypoor');

-- Add index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;
