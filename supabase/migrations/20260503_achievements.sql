-- Feature 5: Achievements system

CREATE TABLE achievements (
  id text PRIMARY KEY,
  name_key text NOT NULL,
  description_key text NOT NULL,
  icon text NOT NULL DEFAULT '★',
  category text NOT NULL DEFAULT 'catalog',
  condition_type text NOT NULL,
  condition_value jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can read own unlocked achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can insert auto-generated achievements
CREATE POLICY "Service can insert achievements"
  ON achievements FOR INSERT
  WITH CHECK (true);

-- Seed predefined achievements
INSERT INTO achievements (id, name_key, description_key, icon, category, condition_type, condition_value) VALUES
  ('first_mission',    'first_mission',    'first_mission_desc',    '🎯', 'catalog', 'completed_total',    '{"threshold": 1}'),
  ('novice',           'novice',           'novice_desc',           '⚔️', 'catalog', 'completed_one_time', '{"threshold": 5}'),
  ('adventurer',       'adventurer',       'adventurer_desc',       '🗺️', 'catalog', 'completed_one_time', '{"threshold": 10}'),
  ('veteran',          'veteran',          'veteran_desc',          '🛡️', 'catalog', 'completed_one_time', '{"threshold": 25}'),
  ('legend',           'legend',           'legend_desc',           '👑', 'catalog', 'completed_one_time', '{"threshold": 50}'),
  ('weekly_starter',   'weekly_starter',   'weekly_starter_desc',   '🔄', 'catalog', 'weekly_count',       '{"threshold": 10}'),
  ('weekly_master',    'weekly_master',    'weekly_master_desc',    '🔥', 'catalog', 'weekly_count',       '{"threshold": 50}'),
  ('weekly_legend',    'weekly_legend',    'weekly_legend_desc',    '💎', 'catalog', 'weekly_count',       '{"threshold": 100}'),
  ('rare_hunter',      'rare_hunter',      'rare_hunter_desc',      '💙', 'catalog', 'rarity_count',       '{"rarity": "rare", "threshold": 5}'),
  ('epic_hunter',      'epic_hunter',      'epic_hunter_desc',      '💜', 'catalog', 'rarity_count',       '{"rarity": "epic", "threshold": 3}'),
  ('legendary_hunter', 'legendary_hunter', 'legendary_hunter_desc', '💛', 'catalog', 'rarity_count',       '{"rarity": "legendary", "threshold": 1}'),
  ('diversifier',      'diversifier',      'diversifier_desc',      '🏷️', 'catalog', 'unique_tags',        '{"threshold": 10}'),
  ('early_bird',       'early_bird',       'early_bird_desc',       '🌅', 'catalog', 'time_of_day',        '{"before_hour": 8}'),
  ('night_owl',        'night_owl',        'night_owl_desc',        '🦉', 'catalog', 'time_of_day',        '{"after_hour": 0}'),
  ('marathoner',       'marathoner',       'marathoner_desc',       '🏃', 'catalog', 'completions_in_day', '{"threshold": 3}'),
  ('resilient',        'resilient',        'resilient_desc',        '🔁', 'catalog', 'resilient',          '{}'),
  ('publisher',        'publisher',        'publisher_desc',        '📢', 'catalog', 'public_approved',    '{"threshold": 3}'),
  ('inspirer',         'inspirer',         'inspirer_desc',         '✨', 'catalog', 'adopted_count',      '{"threshold": 10}'),
  ('photographer',     'photographer',     'photographer_desc',     '📸', 'catalog', 'photos_count',       '{"threshold": 10}'),
  ('explorer',         'explorer',         'explorer_desc',         '🧭', 'catalog', 'adopted_missions',   '{"threshold": 5}');
