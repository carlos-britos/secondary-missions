-- SEV-CRIT-001: Prevent privilege escalation via is_admin self-assignment.
-- Trigger approach: blocks any client-side change to is_admin,
-- including via SECURITY DEFINER functions.

CREATE OR REPLACE FUNCTION prevent_admin_self_assign()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    RAISE EXCEPTION 'Cannot modify is_admin via client';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_admin_change
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_admin_self_assign();
