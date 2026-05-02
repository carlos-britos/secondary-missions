CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Storage cleanup
  DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
      AND (storage.foldername(name))[1] = _user_id::text;

  DELETE FROM storage.objects
    WHERE bucket_id = 'completion-photos'
      AND (storage.foldername(name))[1] = _user_id::text;

  -- Related data
  DELETE FROM notifications WHERE user_id = _user_id;
  DELETE FROM user_achievements WHERE user_id = _user_id;
  DELETE FROM mission_completions WHERE user_id = _user_id;
  DELETE FROM missions WHERE user_id = _user_id;
  DELETE FROM users WHERE id = _user_id;

  -- Auth user
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;
