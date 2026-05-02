-- Feature 4: Mission completions

-- Add completed_at to missions
ALTER TABLE missions ADD COLUMN completed_at timestamptz;

-- Mission completions table (individual completion records)
CREATE TABLE mission_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note text,
  photo_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_completions_mission ON mission_completions(mission_id);
CREATE INDEX idx_completions_user ON mission_completions(user_id);

-- RLS
ALTER TABLE mission_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own completions"
  ON mission_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own completions"
  ON mission_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Atomic increment function (avoids race conditions)
CREATE OR REPLACE FUNCTION increment_completion_count(mission_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE missions
  SET completion_count = completion_count + 1
  WHERE id = mission_id_input AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Storage bucket for completion photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'completion-photos',
  'completion-photos',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can only access their own folder
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'completion-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can read own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'completion-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
