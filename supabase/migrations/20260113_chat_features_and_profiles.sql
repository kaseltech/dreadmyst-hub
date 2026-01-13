-- Chat Features and Profile Enhancements
-- Adds: archived conversations, blocked users, bookmarked users, character alts

-- Archived conversations (per-user archive status)
CREATE TABLE IF NOT EXISTS archived_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  archived_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, conversation_id)
);

-- Blocked users
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  UNIQUE(blocker_id, blocked_id)
);

-- Bookmarked/friended users
CREATE TABLE IF NOT EXISTS bookmarked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  bookmarked_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  nickname TEXT, -- optional nickname for the bookmarked user
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bookmarked_id)
);

-- Character alts (multiple characters per user)
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  class_name VARCHAR(50),
  level INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add hide_ign column for admins who don't want their IGN shown
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hide_ign BOOLEAN DEFAULT FALSE;

-- RLS Policies
ALTER TABLE archived_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Archived conversations policies
CREATE POLICY "Users can view their own archived conversations"
  ON archived_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can archive their own conversations"
  ON archived_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unarchive their own conversations"
  ON archived_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Blocked users policies
CREATE POLICY "Users can view their own blocks"
  ON blocked_users FOR SELECT
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
  ON blocked_users FOR DELETE
  USING (auth.uid() = blocker_id);

-- Bookmarked users policies
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarked_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark others"
  ON bookmarked_users FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove bookmarks"
  ON bookmarked_users FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update bookmark nicknames"
  ON bookmarked_users FOR UPDATE
  USING (auth.uid() = user_id);

-- Characters policies
CREATE POLICY "Users can view their own characters"
  ON characters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create characters"
  ON characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their characters"
  ON characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their characters"
  ON characters FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_archived_conversations_user ON archived_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);
CREATE INDEX IF NOT EXISTS idx_bookmarked_users_user ON bookmarked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_user ON characters(user_id);
