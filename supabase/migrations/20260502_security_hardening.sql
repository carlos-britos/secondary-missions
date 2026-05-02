-- Security hardening migration (applied in 2 phases to remote)
-- Fixes: SECURITY DEFINER callable by anon, mutable search_path,
--         overly permissive policies, RLS performance, missing index,
--         consolidated missions policies, users table RLS

-- ============================================================
-- 1. Fix functions: add SET search_path, keep SECURITY DEFINER
-- ============================================================

CREATE OR REPLACE FUNCTION increment_completion_count(mission_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE missions
  SET completion_count = completion_count + 1
  WHERE id = mission_id_input AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION increment_adoption_count(mission_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE missions
    SET adoption_count = adoption_count + 1
  WHERE id = mission_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public;
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated, anon, public';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname = 'handle_updated_at') THEN
    ALTER FUNCTION public.handle_updated_at() SET search_path = public;
  END IF;
END $$;

-- ============================================================
-- 2. Revoke EXECUTE from anon/public on SECURITY DEFINER funcs
--    Grant only to authenticated (intentional access)
-- ============================================================

REVOKE EXECUTE ON FUNCTION delete_user_account() FROM anon, public;
REVOKE EXECUTE ON FUNCTION increment_completion_count(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION increment_adoption_count(uuid) FROM anon, public;

GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_completion_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_adoption_count(uuid) TO authenticated;

-- ============================================================
-- 3. Drop overly permissive "Service can insert achievements"
--    service_role bypasses RLS, so no INSERT policy needed.
-- ============================================================

DROP POLICY IF EXISTS "Service can insert achievements" ON achievements;

-- ============================================================
-- 4. Consolidate missions SELECT/UPDATE policies
--    Avoids multiple permissive policy evaluations per query
-- ============================================================

DROP POLICY IF EXISTS "Users can read own missions" ON missions;
DROP POLICY IF EXISTS "Anyone can read public approved missions" ON missions;
DROP POLICY IF EXISTS "Admins can read all missions" ON missions;

CREATE POLICY "Anon can read public approved missions"
  ON missions FOR SELECT TO anon
  USING (public_status = 'approved' AND is_public = true);

CREATE POLICY "Authenticated can read missions"
  ON missions FOR SELECT TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR (public_status = 'approved' AND is_public = true)
    OR EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND is_admin = true)
  );

DROP POLICY IF EXISTS "Users can update own missions" ON missions;
DROP POLICY IF EXISTS "Admins can update any mission" ON missions;

CREATE POLICY "Authenticated can update missions"
  ON missions FOR UPDATE TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND is_admin = true)
  );

DROP POLICY IF EXISTS "Users can create missions" ON missions;
CREATE POLICY "Users can create missions"
  ON missions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own missions" ON missions;
CREATE POLICY "Users can delete own missions"
  ON missions FOR DELETE
  USING ((select auth.uid()) = user_id);

-- ============================================================
-- 5. Optimize RLS on other tables with (select auth.uid())
-- ============================================================

-- mission_completions
DROP POLICY IF EXISTS "Users can read own completions" ON mission_completions;
CREATE POLICY "Users can read own completions"
  ON mission_completions FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own completions" ON mission_completions;
CREATE POLICY "Users can create own completions"
  ON mission_completions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- user_achievements
DROP POLICY IF EXISTS "Users can read own unlocked achievements" ON user_achievements;
CREATE POLICY "Users can read own unlocked achievements"
  ON user_achievements FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

-- notifications
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = (select auth.uid()) AND is_admin = true)
  );

-- users table
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON users;
CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  USING ((select auth.uid()) = id);

-- storage policies
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'completion-photos'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

DROP POLICY IF EXISTS "Users can read own photos" ON storage.objects;
CREATE POLICY "Users can read own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'completion-photos'
    AND (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ============================================================
-- 6. Add missing foreign key index
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_notifications_mission_id ON notifications(mission_id);

-- ============================================================
-- 7. Disable public listing on avatars bucket
-- ============================================================

UPDATE storage.buckets SET public = false WHERE id = 'avatars';
