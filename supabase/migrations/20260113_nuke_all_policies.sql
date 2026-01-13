-- NUCLEAR OPTION: Drop ALL policies on ALL tables and start fresh
-- Run this in Supabase SQL Editor

-- First, let's see what we're working with (this is informational)
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- =====================
-- DROP EVERY SINGLE POLICY ON PUBLIC TABLES
-- =====================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- =====================
-- RECREATE ALL POLICIES WITH OPTIMIZATION
-- Using (select auth.uid()) pattern everywhere
-- =====================

-- LISTINGS (public read, authenticated write)
CREATE POLICY "listings_select" ON public.listings FOR SELECT USING (true);
CREATE POLICY "listings_insert" ON public.listings FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL AND seller_id = (select auth.uid()));
CREATE POLICY "listings_update" ON public.listings FOR UPDATE
  USING (seller_id = (select auth.uid()));
CREATE POLICY "listings_delete" ON public.listings FOR DELETE
  USING (seller_id = (select auth.uid()));

-- PROFILES (public read, owner write)
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
  WITH CHECK (id = (select auth.uid()));
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = (select auth.uid()));

-- CONVERSATIONS (participants only)
CREATE POLICY "conversations_select" ON public.conversations FOR SELECT
  USING (buyer_id = (select auth.uid()) OR seller_id = (select auth.uid()));
CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- MESSAGES (conversation participants only)
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
  )
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  sender_id = (select auth.uid()) AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
  )
);
CREATE POLICY "messages_update" ON public.messages FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
    AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
  )
);

-- BUILDS (public read, authenticated create)
CREATE POLICY "builds_select" ON public.builds FOR SELECT USING (true);
CREATE POLICY "builds_insert" ON public.builds FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- BUILD_VOTES (public read, owner write)
CREATE POLICY "build_votes_select" ON public.build_votes FOR SELECT USING (true);
CREATE POLICY "build_votes_insert" ON public.build_votes FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "build_votes_delete" ON public.build_votes FOR DELETE
  USING (user_id = (select auth.uid()));

-- DISCUSSIONS (public read, authenticated create)
CREATE POLICY "discussions_select" ON public.discussions FOR SELECT USING (true);
CREATE POLICY "discussions_insert" ON public.discussions FOR INSERT
  WITH CHECK ((select auth.uid()) IS NOT NULL);

-- REPLIES (public read/write)
CREATE POLICY "replies_select" ON public.replies FOR SELECT USING (true);
CREATE POLICY "replies_insert" ON public.replies FOR INSERT WITH CHECK (true);

-- ARCHIVED_CONVERSATIONS (owner only)
CREATE POLICY "archived_conversations_select" ON public.archived_conversations FOR SELECT
  USING (user_id = (select auth.uid()));
CREATE POLICY "archived_conversations_insert" ON public.archived_conversations FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "archived_conversations_delete" ON public.archived_conversations FOR DELETE
  USING (user_id = (select auth.uid()));

-- BLOCKED_USERS (owner only)
CREATE POLICY "blocked_users_select" ON public.blocked_users FOR SELECT
  USING (blocker_id = (select auth.uid()));
CREATE POLICY "blocked_users_insert" ON public.blocked_users FOR INSERT
  WITH CHECK (blocker_id = (select auth.uid()));
CREATE POLICY "blocked_users_delete" ON public.blocked_users FOR DELETE
  USING (blocker_id = (select auth.uid()));

-- BOOKMARKED_USERS (owner only)
CREATE POLICY "bookmarked_users_select" ON public.bookmarked_users FOR SELECT
  USING (user_id = (select auth.uid()));
CREATE POLICY "bookmarked_users_insert" ON public.bookmarked_users FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "bookmarked_users_update" ON public.bookmarked_users FOR UPDATE
  USING (user_id = (select auth.uid()));
CREATE POLICY "bookmarked_users_delete" ON public.bookmarked_users FOR DELETE
  USING (user_id = (select auth.uid()));

-- CHARACTERS (owner only)
CREATE POLICY "characters_select" ON public.characters FOR SELECT
  USING (user_id = (select auth.uid()));
CREATE POLICY "characters_insert" ON public.characters FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));
CREATE POLICY "characters_update" ON public.characters FOR UPDATE
  USING (user_id = (select auth.uid()));
CREATE POLICY "characters_delete" ON public.characters FOR DELETE
  USING (user_id = (select auth.uid()));

-- =====================
-- ADD MISSING INDEXES FOR PERFORMANCE
-- These are suggested by the Supabase query analyzer
-- =====================

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON public.conversations USING btree (updated_at);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages USING btree (read);

-- =====================
-- VERIFY: Show final policy count
-- =====================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    RAISE NOTICE 'Total policies after migration: %', policy_count;
END $$;
