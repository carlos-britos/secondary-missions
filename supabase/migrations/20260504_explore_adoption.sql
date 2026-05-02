-- Feature 6: Explore — adoption_count + RPC

ALTER TABLE missions ADD COLUMN IF NOT EXISTS adoption_count int DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_missions_approved
  ON missions(public_status, created_at DESC)
  WHERE public_status = 'approved' AND is_public = true;

CREATE OR REPLACE FUNCTION increment_adoption_count(mission_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE missions
    SET adoption_count = adoption_count + 1
  WHERE id = mission_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
