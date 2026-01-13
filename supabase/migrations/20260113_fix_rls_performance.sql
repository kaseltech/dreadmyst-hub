-- Fix RLS Performance Issues
-- Problem: auth.uid() is evaluated for every row, causing slow queries
-- Solution: Wrap with (select auth.uid()) so it's evaluated once

-- =====================
-- PROFILES TABLE
-- =====================

-- Drop duplicate policies
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;

-- Recreate with optimized auth check
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (id = (select auth.uid()));

-- Fix update policy
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = (select auth.uid()));

-- =====================
-- LISTINGS TABLE
-- =====================

DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (status = 'active' OR seller_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
CREATE POLICY "Authenticated users can create listings" ON listings
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
CREATE POLICY "Sellers can update own listings" ON listings
  FOR UPDATE USING (seller_id = (select auth.uid()));

DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;
CREATE POLICY "Sellers can delete own listings" ON listings
  FOR DELETE USING (seller_id = (select auth.uid()));

-- =====================
-- CONVERSATIONS TABLE
-- =====================

DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (buyer_id = (select auth.uid()) OR seller_id = (select auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;
CREATE POLICY "Authenticated users can create conversations" ON conversations
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================
-- MESSAGES TABLE
-- =====================

DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = (select auth.uid()) AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
CREATE POLICY "Users can mark messages as read" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
    )
  );

-- =====================
-- ARCHIVED_CONVERSATIONS TABLE
-- =====================

DROP POLICY IF EXISTS "Users can view their own archived conversations" ON archived_conversations;
CREATE POLICY "Users can view their own archived conversations" ON archived_conversations
  FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can archive their own conversations" ON archived_conversations;
CREATE POLICY "Users can archive their own conversations" ON archived_conversations
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unarchive their own conversations" ON archived_conversations;
CREATE POLICY "Users can unarchive their own conversations" ON archived_conversations
  FOR DELETE USING (user_id = (select auth.uid()));

-- =====================
-- BLOCKED_USERS TABLE
-- =====================

DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;
CREATE POLICY "Users can view their own blocks" ON blocked_users
  FOR SELECT USING (blocker_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
CREATE POLICY "Users can block others" ON blocked_users
  FOR INSERT WITH CHECK (blocker_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;
CREATE POLICY "Users can unblock others" ON blocked_users
  FOR DELETE USING (blocker_id = (select auth.uid()));

-- =====================
-- BOOKMARKED_USERS TABLE
-- =====================

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarked_users;
CREATE POLICY "Users can view their own bookmarks" ON bookmarked_users
  FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can bookmark others" ON bookmarked_users;
CREATE POLICY "Users can bookmark others" ON bookmarked_users
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarked_users;
CREATE POLICY "Users can remove bookmarks" ON bookmarked_users
  FOR DELETE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update bookmark nicknames" ON bookmarked_users;
CREATE POLICY "Users can update bookmark nicknames" ON bookmarked_users
  FOR UPDATE USING (user_id = (select auth.uid()));

-- =====================
-- CHARACTERS TABLE
-- =====================

DROP POLICY IF EXISTS "Users can view their own characters" ON characters;
CREATE POLICY "Users can view their own characters" ON characters
  FOR SELECT USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create characters" ON characters;
CREATE POLICY "Users can create characters" ON characters
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their characters" ON characters;
CREATE POLICY "Users can update their characters" ON characters
  FOR UPDATE USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their characters" ON characters;
CREATE POLICY "Users can delete their characters" ON characters
  FOR DELETE USING (user_id = (select auth.uid()));

-- =====================
-- BUILD_VOTES TABLE
-- =====================

DROP POLICY IF EXISTS "Users can insert own votes" ON build_votes;
CREATE POLICY "Users can insert own votes" ON build_votes
  FOR INSERT WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own votes" ON build_votes;
CREATE POLICY "Users can delete own votes" ON build_votes
  FOR DELETE USING (user_id = (select auth.uid()));

-- =====================
-- REPLIES TABLE - Fix duplicate policies
-- =====================

DROP POLICY IF EXISTS "Anyone can view replies" ON replies;
DROP POLICY IF EXISTS "Anyone can insert replies" ON replies;
DROP POLICY IF EXISTS "Public access" ON replies;

CREATE POLICY "Anyone can view replies" ON replies
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert replies" ON replies
  FOR INSERT WITH CHECK (true);

-- =====================
-- Add missing indexes for foreign keys
-- =====================

CREATE INDEX IF NOT EXISTS idx_archived_conversations_conversation_id
  ON archived_conversations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_bookmarked_users_bookmarked_id
  ON bookmarked_users(bookmarked_id);

CREATE INDEX IF NOT EXISTS idx_build_votes_user_id
  ON build_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id
  ON messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_replies_discussion_id
  ON replies(discussion_id);
