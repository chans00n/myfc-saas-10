-- Migration script to create the necessary tables for leaderboards
-- Run this in the Supabase SQL Editor

-- Create leaderboard categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS leaderboard_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_field TEXT NOT NULL, -- Defines how to sort entries (e.g., 'current_streak', 'total_workouts')
  sort_order TEXT NOT NULL DEFAULT 'desc', -- 'asc' or 'desc'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  refresh_frequency TEXT DEFAULT 'daily', -- 'daily', 'hourly', 'realtime'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leaderboard entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES leaderboard_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rank INTEGER NOT NULL,
  score INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add a unique constraint to ensure a user only appears once per category
  UNIQUE(category_id, user_id)
);

-- Create user streaks table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default categories if they don't exist yet
INSERT INTO leaderboard_categories (name, description, sort_field, sort_order, is_active)
SELECT 'Current Streak', 'Users with the longest current workout streak', 'current_streak', 'desc', TRUE
WHERE NOT EXISTS (SELECT 1 FROM leaderboard_categories WHERE sort_field = 'current_streak');

INSERT INTO leaderboard_categories (name, description, sort_field, sort_order, is_active)
SELECT 'Total Workouts', 'Users who have completed the most workouts overall', 'total_workouts', 'desc', TRUE
WHERE NOT EXISTS (SELECT 1 FROM leaderboard_categories WHERE sort_field = 'total_workouts');

INSERT INTO leaderboard_categories (name, description, sort_field, sort_order, is_active)
SELECT 'Weekly Workouts', 'Users who have completed the most workouts this week', 'weekly_workouts', 'desc', TRUE
WHERE NOT EXISTS (SELECT 1 FROM leaderboard_categories WHERE sort_field = 'weekly_workouts');

INSERT INTO leaderboard_categories (name, description, sort_field, sort_order, is_active)
SELECT 'Monthly Completion', 'Users with the highest workout completion rate this month', 'monthly_completion_rate', 'desc', TRUE
WHERE NOT EXISTS (SELECT 1 FROM leaderboard_categories WHERE sort_field = 'monthly_completion_rate');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_category_id ON leaderboard_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);

-- Create a function to get user's current streak
CREATE OR REPLACE FUNCTION get_user_streak(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER;
BEGIN
  SELECT current_streak INTO streak FROM user_streaks WHERE user_id = user_uuid;
  RETURN COALESCE(streak, 0);
END;
$$ LANGUAGE plpgsql; 