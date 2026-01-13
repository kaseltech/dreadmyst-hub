-- Fix missing SELECT policies that are blocking reads

-- =====================
-- PROFILES TABLE - Need public read access for joins
-- =====================
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles
  FOR SELECT USING (true);

-- =====================
-- BUILDS TABLE - Public read access
-- =====================
DROP POLICY IF EXISTS "Anyone can view builds" ON builds;
DROP POLICY IF EXISTS "Builds are viewable by everyone" ON builds;
CREATE POLICY "Anyone can view builds" ON builds
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create builds" ON builds;
CREATE POLICY "Authenticated users can create builds" ON builds
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own builds" ON builds;
CREATE POLICY "Users can update own builds" ON builds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = (select auth.uid())
      AND p.username = builds.author_name
    )
  );

-- =====================
-- DISCUSSIONS TABLE - Public read access
-- =====================
DROP POLICY IF EXISTS "Anyone can view discussions" ON discussions;
DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON discussions;
CREATE POLICY "Anyone can view discussions" ON discussions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create discussions" ON discussions;
CREATE POLICY "Authenticated users can create discussions" ON discussions
  FOR INSERT WITH CHECK ((select auth.uid()) IS NOT NULL);

-- =====================
-- WIKI_ARTICLES TABLE - Public read access
-- =====================
DROP POLICY IF EXISTS "Anyone can view wiki articles" ON wiki_articles;
DROP POLICY IF EXISTS "Wiki articles are viewable by everyone" ON wiki_articles;
CREATE POLICY "Anyone can view wiki articles" ON wiki_articles
  FOR SELECT USING (true);

-- =====================
-- BUILD_VOTES TABLE - Need select for vote checking
-- =====================
DROP POLICY IF EXISTS "Anyone can view build votes" ON build_votes;
CREATE POLICY "Anyone can view build votes" ON build_votes
  FOR SELECT USING (true);
