-- FINAL RLS CLEANUP
-- This drops ALL policies and recreates them with:
-- 1. (select auth.uid()) optimization
-- 2. No duplicate policies

-- =====================
-- DROP ALL EXISTING POLICIES
-- =====================

-- LISTINGS
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Anyone can view listings" ON listings;
DROP POLICY IF EXISTS "Listings are viewable by everyone" ON listings;
DROP POLICY IF EXISTS "Public access" ON listings;
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Sellers can update own listings" ON listings;
DROP POLICY IF EXISTS "Sellers can delete own listings" ON listings;

-- PROFILES
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public access" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- CONVERSATIONS
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Public access" ON conversations;
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;

-- MESSAGES
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can mark messages as read" ON messages;
DROP POLICY IF EXISTS "Public access" ON messages;

-- BUILDS
DROP POLICY IF EXISTS "Anyone can view builds" ON builds;
DROP POLICY IF EXISTS "Builds are viewable by everyone" ON builds;
DROP POLICY IF EXISTS "Public access" ON builds;
DROP POLICY IF EXISTS "Authenticated users can create builds" ON builds;
DROP POLICY IF EXISTS "Users can update own builds" ON builds;

-- BUILD_VOTES
DROP POLICY IF EXISTS "Anyone can view build votes" ON build_votes;
DROP POLICY IF EXISTS "Anyone can view votes" ON build_votes;
DROP POLICY IF EXISTS "Public access" ON build_votes;
DROP POLICY IF EXISTS "Users can insert own votes" ON build_votes;
DROP POLICY IF EXISTS "Users can delete own votes" ON build_votes;

-- DISCUSSIONS
DROP POLICY IF EXISTS "Anyone can view discussions" ON discussions;
DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON discussions;
DROP POLICY IF EXISTS "Public access" ON discussions;
DROP POLICY IF EXISTS "Authenticated users can create discussions" ON discussions;

-- REPLIES
DROP POLICY IF EXISTS "Anyone can view replies" ON replies;
DROP POLICY IF EXISTS "Anyone can insert replies" ON replies;
DROP POLICY IF EXISTS "Public access" ON replies;

-- ARCHIVED_CONVERSATIONS
DROP POLICY IF EXISTS "Users can view their own archived conversations" ON archived_conversations;
DROP POLICY IF EXISTS "Users can archive their own conversations" ON archived_conversations;
DROP POLICY IF EXISTS "Users can unarchive their own conversations" ON archived_conversations;

-- BLOCKED_USERS
DROP POLICY IF EXISTS "Users can view their own blocks" ON blocked_users;
DROP POLICY IF EXISTS "Users can block others" ON blocked_users;
DROP POLICY IF EXISTS "Users can unblock others" ON blocked_users;

-- BOOKMARKED_USERS
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarked_users;
DROP POLICY IF EXISTS "Users can bookmark others" ON bookmarked_users;
DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarked_users;
DROP POLICY IF EXISTS "Users can update bookmark nicknames" ON bookmarked_users;

-- CHARACTERS
DROP POLICY IF EXISTS "Users can view their own characters" ON characters;
DROP POLICY IF EXISTS "Users can create characters" ON characters;
DROP POLICY IF EXISTS "Users can update their characters" ON characters;
DROP POLICY IF EXISTS "Users can delete their characters" ON characters;

-- =====================
-- RECREATE ALL POLICIES WITH OPTIMIZATION
-- =====================

-- LISTINGS (public read, auth write)
CREATE POLICY "listings_select" ON listings FOR SELECT USING (true);
CREATE POLICY "listings_insert" ON listings FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL AND seller_id = (select auth.uid()));
CREATE POLICY "listings_update" ON listings FOR UPDATE
  USING (seller_id = (select auth.uid()));
CREATE POLICY "listings_delete" ON listings FOR DELETE
  USING (seller_id = (select auth.uid()));

-- PROFILES (public read, owner write)
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (id = (select auth.uid()));
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = (select auth.uid()));

-- CONVERSATIONS (owner read/write)
CREATE POLICY "conversations_select" ON conversations FOR SELECT
  USING (buyer_id = (select auth.uid()) OR seller_id = (select auth.uid()));
CREATE POLICY "conversations_insert" ON conversations FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- MESSAGES (conversation participants only)
CREATE POLICY "messages_select" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
  )
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  sender_id = (select auth.uid()) AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
  )
);
CREATE POLICY "messages_update" ON messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
  )
);

-- BUILDS (public read, auth create)
CREATE POLICY "builds_select" ON builds FOR SELECT USING (true);
CREATE POLICY "builds_insert" ON builds FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- BUILD_VOTES (public read, owner write)
CREATE POLICY "build_votes_select" ON build_votes FOR SELECT USING (true);
CREATE POLICY "build_votes_insert" ON build_votes FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "build_votes_delete" ON build_votes FOR DELETE
  USING (user_id = (select auth.uid()));

-- DISCUSSIONS (public read, auth create)
CREATE POLICY "discussions_select" ON discussions FOR SELECT USING (true);
CREATE POLICY "discussions_insert" ON discussions FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- REPLIES (public read/write for now)
CREATE POLICY "replies_select" ON replies FOR SELECT USING (true);
CREATE POLICY "replies_insert" ON replies FOR INSERT WITH CHECK (true);

-- ARCHIVED_CONVERSATIONS (owner only)
CREATE POLICY "archived_conversations_select" ON archived_conversations FOR SELECT
  USING (user_id = (select auth.uid()));
CREATE POLICY "archived_conversations_insert" ON archived_conversations FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "archived_conversations_delete" ON archived_conversations FOR DELETE
  USING (user_id = (select auth.uid()));

-- BLOCKED_USERS (owner only)
CREATE POLICY "blocked_users_select" ON blocked_users FOR SELECT
  USING (blocker_id = (select auth.uid()));
CREATE POLICY "blocked_users_insert" ON blocked_users FOR INSERT
  WITH CHECK (blocker_id = (select auth.uid()));
CREATE POLICY "blocked_users_delete" ON blocked_users FOR DELETE
  USING (blocker_id = (select auth.uid()));

-- BOOKMARKED_USERS (owner only)
CREATE POLICY "bookmarked_users_select" ON bookmarked_users FOR SELECT
  USING (user_id = (select auth.uid()));
CREATE POLICY "bookmarked_users_insert" ON bookmarked_users FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "bookmarked_users_update" ON bookmarked_users FOR UPDATE
  USING (user_id = (select auth.uid()));
CREATE POLICY "bookmarked_users_delete" ON bookmarked_users FOR DELETE
  USING (user_id = (select auth.uid()));

-- CHARACTERS (owner only)
CREATE POLICY "characters_select" ON characters FOR SELECT
  USING (user_id = (select auth.uid()));
CREATE POLICY "characters_insert" ON characters FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "characters_update" ON characters FOR UPDATE
  USING (user_id = (select auth.uid()));
CREATE POLICY "characters_delete" ON characters FOR DELETE
  USING (user_id = (select auth.uid()));
