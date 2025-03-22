-- MYFC Community Features Schema Extension
-- This file contains additional tables needed for community features

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================
-- WORKOUT COMMENTS TABLES
-- ======================

-- Workout Comments Table - stores user comments on workouts
CREATE TABLE IF NOT EXISTS workout_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment Likes Table - tracks which users liked which comments
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES workout_comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Comment Reports Table - allows users to report inappropriate comments
CREATE TABLE IF NOT EXISTS comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES workout_comments(id) ON DELETE CASCADE,
  reporter_user_id TEXT NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, reporter_user_id)
);

-- ======================
-- LEADERBOARD TABLES
-- ======================

-- Leaderboard Categories Table - defines different leaderboard types
CREATE TABLE IF NOT EXISTS leaderboard_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  sort_field TEXT NOT NULL,
  sort_order TEXT NOT NULL DEFAULT 'desc' CHECK (sort_order IN ('asc', 'desc')),
  is_active BOOLEAN DEFAULT TRUE,
  refresh_frequency TEXT DEFAULT 'daily' CHECK (refresh_frequency IN ('hourly', 'daily', 'weekly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Leaderboard Entries Table - stores the actual leaderboard data
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES leaderboard_categories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users_table(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  score NUMERIC NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, user_id)
);

-- Insert default leaderboard categories
INSERT INTO leaderboard_categories (name, description, sort_field, sort_order)
VALUES
  ('Longest Streak', 'Users with the longest consecutive workout streaks', 'current_streak', 'desc'),
  ('All-Time Workouts', 'Users who have completed the most workouts', 'total_workouts', 'desc'),
  ('Weekly Champions', 'Users with the most workouts this week', 'weekly_workouts', 'desc'),
  ('Monthly Dedication', 'Users with the highest workout completion rate this month', 'monthly_completion_rate', 'desc')
ON CONFLICT (name) DO NOTHING;

-- ======================
-- FUNCTIONS & TRIGGERS
-- ======================

-- Function to update leaderboard entries
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
  -- Update appropriate leaderboard entries based on the trigger context
  -- This would be implemented based on your specific business logic
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE workout_comments 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE workout_comments 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count updates
CREATE TRIGGER update_likes_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW
EXECUTE FUNCTION update_comment_likes_count();

-- ======================
-- INDEXES
-- ======================

-- Indexes for workout comments
CREATE INDEX IF NOT EXISTS idx_workout_comments_workout_id ON workout_comments(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_comments_user_id ON workout_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_comments_created_at ON workout_comments(created_at);

-- Indexes for leaderboards
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_category_id ON leaderboard_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(category_id, rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);

-- ======================
-- PERMISSIONS
-- ======================

-- Set up appropriate RLS (Row Level Security) policies
ALTER TABLE workout_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view non-hidden comments
CREATE POLICY view_non_hidden_comments ON workout_comments
  FOR SELECT
  USING (NOT is_hidden);

-- Policy: Users can only edit their own comments
CREATE POLICY edit_own_comments ON workout_comments
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can only delete their own comments
CREATE POLICY delete_own_comments ON workout_comments
  FOR DELETE
  USING (user_id = auth.uid());

-- Policy: Users can insert their own comments
CREATE POLICY insert_own_comments ON workout_comments
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can only like/unlike comments themselves
CREATE POLICY manage_own_likes ON comment_likes
  USING (user_id = auth.uid());

-- Policy: Everyone can view leaderboard entries
CREATE POLICY view_leaderboard ON leaderboard_entries
  FOR SELECT
  TO authenticated
  USING (TRUE); 