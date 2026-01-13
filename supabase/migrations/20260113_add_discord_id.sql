-- Add discord_id column to profiles table for Discord DM links
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_id VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_discord_id ON profiles(discord_id);
