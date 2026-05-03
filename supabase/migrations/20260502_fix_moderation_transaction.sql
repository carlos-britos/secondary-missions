-- SEV-MED-003: Moderation operations must be transactional.
-- RPC functions that validate admin + update mission + insert notification atomically.

CREATE OR REPLACE FUNCTION approve_mission(p_mission_id uuid)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_title text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Only admins can approve missions';
  END IF;

  SELECT user_id, title INTO v_user_id, v_title
    FROM missions
   WHERE id = p_mission_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Mission not found';
  END IF;

  UPDATE missions
     SET public_status = 'approved', rejection_reason = NULL
   WHERE id = p_mission_id;

  INSERT INTO notifications (user_id, type, title, message, mission_id)
  VALUES (v_user_id, 'mission_approved', 'mission_approved', v_title, p_mission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION reject_mission(p_mission_id uuid, p_reason text DEFAULT NULL)
RETURNS void AS $$
DECLARE
  v_user_id uuid;
  v_title text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Only admins can reject missions';
  END IF;

  SELECT user_id, title INTO v_user_id, v_title
    FROM missions
   WHERE id = p_mission_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Mission not found';
  END IF;

  UPDATE missions
     SET public_status = 'rejected', rejection_reason = p_reason
   WHERE id = p_mission_id;

  INSERT INTO notifications (user_id, type, title, message, mission_id)
  VALUES (v_user_id, 'mission_rejected', 'mission_rejected', COALESCE(p_reason, v_title), p_mission_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
