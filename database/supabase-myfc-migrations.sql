-- MYFC Database Schema for Supabase

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  intensity TEXT NOT NULL CHECK (intensity IN ('beginner', 'intermediate', 'advanced')),
  video_url TEXT,
  thumbnail_url TEXT,
  coach_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Focus Areas
CREATE TABLE IF NOT EXISTS focus_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT
);

-- Junction: Workout Focus Areas
CREATE TABLE IF NOT EXISTS workout_focus_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  focus_area_id UUID REFERENCES focus_areas(id) ON DELETE CASCADE
);

-- Movements
CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  focus_area_id UUID REFERENCES focus_areas(id) ON DELETE SET NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- Junction: Workout Movements with sequence
CREATE TABLE IF NOT EXISTS workout_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  duration_seconds INTEGER,
  repetitions INTEGER,
  sets INTEGER
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_taken INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Workout Schedule
CREATE TABLE IF NOT EXISTS daily_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  required_count INTEGER NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('streak', 'workouts_completed', 'focus_area'))
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Streaks
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE
);

-- Add RLS policies
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_focus_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Workouts can be read by anyone
CREATE POLICY "Workouts are viewable by all users" ON workouts
  FOR SELECT USING (true);

-- Focus areas can be read by anyone
CREATE POLICY "Focus areas are viewable by all users" ON focus_areas
  FOR SELECT USING (true);

-- Workout focus areas can be read by anyone
CREATE POLICY "Workout focus areas are viewable by all users" ON workout_focus_areas
  FOR SELECT USING (true);

-- Movements can be read by anyone
CREATE POLICY "Movements are viewable by all users" ON movements
  FOR SELECT USING (true);

-- Workout movements can be read by anyone
CREATE POLICY "Workout movements are viewable by all users" ON workout_movements
  FOR SELECT USING (true);

-- User workouts can only be read/modified by the user who owns them
CREATE POLICY "User workouts are viewable by owning user" ON user_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User workouts can be inserted by owning user" ON user_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User workouts can be updated by owning user" ON user_workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily workouts can be read by anyone
CREATE POLICY "Daily workouts are viewable by all users" ON daily_workouts
  FOR SELECT USING (true);

-- Achievements can be read by anyone
CREATE POLICY "Achievements are viewable by all users" ON achievements
  FOR SELECT USING (true);

-- User achievements can only be read by the user who owns them
CREATE POLICY "User achievements are viewable by owning user" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- User streaks can only be read/modified by the user who owns them
CREATE POLICY "User streaks are viewable by owning user" ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "User streaks can be inserted by owning user" ON user_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User streaks can be updated by owning user" ON user_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Sample Data
-- Insert some sample focus areas
INSERT INTO focus_areas (name, description) VALUES
('Face Lower', 'Exercises targeting the lower part of the face, including jaw and chin.'),
('Face Upper', 'Exercises focusing on the upper facial muscles, including forehead and eyes.'),
('Neck', 'Exercises for the neck muscles to improve posture and reduce tension.');

-- Insert sample movements
INSERT INTO movements (name, description, difficulty_level, focus_area_id) VALUES
('Jaw Release', 'Relax and open your jaw, then close slowly while extending your lower lip.', 'beginner', (SELECT id FROM focus_areas WHERE name = 'Face Lower')),
('Forehead Smoothing', 'Place fingers on forehead and gently pull skin downward while raising eyebrows.', 'beginner', (SELECT id FROM focus_areas WHERE name = 'Face Upper')),
('Neck Roll', 'Slowly roll your head in a circular motion, keeping shoulders relaxed.', 'beginner', (SELECT id FROM focus_areas WHERE name = 'Neck'));

-- Insert sample workouts
INSERT INTO workouts (title, description, duration_minutes, intensity, thumbnail_url, coach_note) VALUES
('Morning Face Refresher', 'A quick workout to energize your face and reduce morning puffiness.', 10, 'beginner', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 'Perform each movement slowly and mindfully.'),
('Complete Facial Workout', 'A comprehensive routine that targets all facial muscle groups.', 20, 'intermediate', 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 'Focus on your breathing throughout the workout.'),
('Tension Relief Session', 'Gentle movements to release facial and neck tension.', 15, 'beginner', 'https://images.unsplash.com/photo-1563580853056-79a9bc76b3c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80', 'This is perfect after a long day of screen time.');

-- Connect workouts to movements
INSERT INTO workout_movements (workout_id, movement_id, sequence_order, duration_seconds, repetitions, sets) VALUES
((SELECT id FROM workouts WHERE title = 'Morning Face Refresher'), (SELECT id FROM movements WHERE name = 'Jaw Release'), 1, 60, 10, 2),
((SELECT id FROM workouts WHERE title = 'Morning Face Refresher'), (SELECT id FROM movements WHERE name = 'Forehead Smoothing'), 2, 60, 10, 2),
((SELECT id FROM workouts WHERE title = 'Complete Facial Workout'), (SELECT id FROM movements WHERE name = 'Jaw Release'), 1, 60, 15, 3),
((SELECT id FROM workouts WHERE title = 'Complete Facial Workout'), (SELECT id FROM movements WHERE name = 'Forehead Smoothing'), 2, 60, 15, 3),
((SELECT id FROM workouts WHERE title = 'Complete Facial Workout'), (SELECT id FROM movements WHERE name = 'Neck Roll'), 3, 60, 10, 2),
((SELECT id FROM workouts WHERE title = 'Tension Relief Session'), (SELECT id FROM movements WHERE name = 'Neck Roll'), 1, 90, 5, 3);

-- Connect workouts to focus areas
INSERT INTO workout_focus_areas (workout_id, focus_area_id) VALUES
((SELECT id FROM workouts WHERE title = 'Morning Face Refresher'), (SELECT id FROM focus_areas WHERE name = 'Face Lower')),
((SELECT id FROM workouts WHERE title = 'Morning Face Refresher'), (SELECT id FROM focus_areas WHERE name = 'Face Upper')),
((SELECT id FROM workouts WHERE title = 'Complete Facial Workout'), (SELECT id FROM focus_areas WHERE name = 'Face Lower')),
((SELECT id FROM workouts WHERE title = 'Complete Facial Workout'), (SELECT id FROM focus_areas WHERE name = 'Face Upper')),
((SELECT id FROM workouts WHERE title = 'Complete Facial Workout'), (SELECT id FROM focus_areas WHERE name = 'Neck')),
((SELECT id FROM workouts WHERE title = 'Tension Relief Session'), (SELECT id FROM focus_areas WHERE name = 'Neck'));

-- Schedule a workout for today
INSERT INTO daily_workouts (workout_id, schedule_date, is_active) VALUES
((SELECT id FROM workouts WHERE title = 'Morning Face Refresher'), CURRENT_DATE, TRUE);

-- Insert sample achievements
INSERT INTO achievements (name, description, icon_url, required_count, achievement_type) VALUES
('Beginner Face Trainer', 'Complete your first workout', '🏆', 1, 'workouts_completed'),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 7, 'streak'),
('Face Master', 'Complete 30 workouts', '🌟', 30, 'workouts_completed'),
('Neck Expert', 'Complete 10 workouts focusing on neck exercises', '💪', 10, 'focus_area'); 