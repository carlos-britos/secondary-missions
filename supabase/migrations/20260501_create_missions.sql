-- Feature 2: Missions table

-- Enums
CREATE TYPE mission_type AS ENUM ('one_time', 'weekly');
CREATE TYPE mission_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE mission_status AS ENUM ('active', 'completed', 'failed', 'expired');
CREATE TYPE public_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- Missions table
CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type mission_type NOT NULL DEFAULT 'one_time',
  rarity mission_rarity NOT NULL DEFAULT 'common',
  tags text[] DEFAULT '{}',
  expires_at timestamptz,
  is_public boolean DEFAULT false,
  public_status public_status DEFAULT 'draft',
  status mission_status DEFAULT 'active',
  weekly_reset_day smallint CHECK (weekly_reset_day BETWEEN 0 AND 6),
  completion_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_missions_user_id ON missions(user_id);
CREATE INDEX idx_missions_status ON missions(status);
CREATE INDEX idx_missions_public ON missions(is_public, public_status) WHERE is_public = true;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_missions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missions_updated_at
  BEFORE UPDATE ON missions
  FOR EACH ROW
  EXECUTE FUNCTION update_missions_updated_at();

-- RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own missions"
  ON missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create missions"
  ON missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions"
  ON missions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own missions"
  ON missions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public approved missions"
  ON missions FOR SELECT
  USING (public_status = 'approved' AND is_public = true);
