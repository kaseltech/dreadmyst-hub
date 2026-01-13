-- Comprehensive RLS fix - drop all and recreate cleanly

-- =====================
-- LISTINGS TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;

-- Simple public read - no auth check needed for viewing
CREATE POLICY "Anyone can view listings" ON listings
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid());

CREATE POLICY "Sellers can update own listings" ON listings
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY "Sellers can delete own listings" ON listings
  FOR DELETE USING (seller_id = auth.uid());

-- =====================
-- PROFILES TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- =====================
-- CONVERSATIONS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;

CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (buyer_id = auth.uid() OR seller_id = auth.uid());

CREATE POLICY "Authenticated users can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================
-- MESSAGES TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;

CREATE POLICY "Users can view messages in their conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations" ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can mark messages as read" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.buyer_id = auth.uid() OR c.seller_id = auth.uid())
    )
  );

-- =====================
-- BUILDS TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view builds" ON builds;
DROP POLICY IF EXISTS "Builds are viewable by everyone" ON builds;
DROP POLICY IF EXISTS "Authenticated users can create builds" ON builds;
DROP POLICY IF EXISTS "Users can update own builds" ON builds;

CREATE POLICY "Anyone can view builds" ON builds
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create builds" ON builds
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================
-- BUILD_VOTES TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view build votes" ON build_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON build_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON build_votes;

CREATE POLICY "Anyone can view build votes" ON build_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own votes" ON build_votes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own votes" ON build_votes
  FOR DELETE USING (user_id = auth.uid());

-- =====================
-- DISCUSSIONS TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view discussions" ON discussions;
DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON discussions;
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON discussions;

CREATE POLICY "Anyone can view discussions" ON discussions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON discussions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================
-- REPLIES TABLE
-- =====================
DROP POLICY IF EXISTS "Anyone can view replies" ON replies;
DROP POLICY IF EXISTS "Anyone can insert replies" ON replies;
DROP POLICY IF EXISTS "Public access" ON replies;

CREATE POLICY "Anyone can view replies" ON replies
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert replies" ON replies
  FOR INSERT WITH CHECK (true);

-- =====================
-- ARCHIVED_CONVERSATIONS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view their own archived conversations" ON archived_conversations;
DROP POLICY IF EXISTS "Users can archive their own conversations" ON archived_conversations;
DROP POLICY IF EXISTS "Users can unarchive their own conversations" ON archived_conversations;

CREATE POLICY "Users can view their own archived conversations" ON archived_conversations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can archive their own conversations" ON archived_conversations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unarchive their own conversations" ON archived_conversations
  FOR DELETE USING (user_id = auth.uid());

-- =====================
-- BLOCKED_USERS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;

CREATE POLICY "Users can view their own blocks" ON blocked_users
  FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "Users can block others" ON blocked_users
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others" ON blocked_users
  FOR DELETE USING (blocker_id = auth.uid());

-- =====================
-- BOOKMARKED_USERS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarked_users;
DROP POLICY IF EXISTS "Users can bookmark others" ON bookmarked_users;
DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarked_users;
DROP POLICY IF EXISTS "Users can update bookmark nicknames" ON bookmarked_users;

CREATE POLICY "Users can view their own bookmarks" ON bookmarked_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can bookmark others" ON bookmarked_users
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove bookmarks" ON bookmarked_users
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can update bookmark nicknames" ON bookmarked_users
  FOR UPDATE USING (user_id = auth.uid());

-- =====================
-- CHARACTERS TABLE
-- =====================
DROP POLICY IF EXISTS "Users can view their own characters" ON characters;
DROP POLICY IF EXISTS "Users can create characters" ON characters;
DROP POLICY IF EXISTS "Users can update their characters" ON characters;
DROP POLICY IF EXISTS "Users can delete their characters" ON characters;

CREATE POLICY "Users can view their own characters" ON characters
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create characters" ON characters
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their characters" ON characters
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their characters" ON characters
  FOR DELETE USING (user_id = auth.uid());
