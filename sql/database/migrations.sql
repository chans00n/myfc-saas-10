-- MYFC Database Schema
-- This file contains SQL statements to create all tables needed for the MYFC application
-- These tables will integrate with the existing users_table

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workouts table - stores all workout information
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

-- Focus Areas table - different facial areas that can be targeted
CREATE TABLE IF NOT EXISTS focus_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT
);

-- Workout Focus Areas junction table - connects workouts to their focus areas
CREATE TABLE IF NOT EXISTS workout_focus_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  focus_area_id UUID REFERENCES focus_areas(id) ON DELETE CASCADE,
  UNIQUE(workout_id, focus_area_id)
);

-- Movements table - individual facial exercises
CREATE TABLE IF NOT EXISTS movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  focus_area_id UUID REFERENCES focus_areas(id),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

-- Workout Movements junction table - connects workouts to movements with sequence information
CREATE TABLE IF NOT EXISTS workout_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  movement_id UUID REFERENCES movements(id) ON DELETE CASCADE,
  sequence_order INTEGER NOT NULL,
  duration_seconds INTEGER,
  repetitions INTEGER,
  sets INTEGER,
  UNIQUE(workout_id, sequence_order)
);

-- User Workouts table - tracks user workout history and progress
-- Links to existing users_table via user_id
CREATE TABLE IF NOT EXISTS user_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users_table(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_taken INTEGER, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Workout Schedule - defines which workout is assigned for each day
CREATE TABLE IF NOT EXISTS daily_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  schedule_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(schedule_date)
);

-- Achievements table - defines different achievements users can earn
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  required_count INTEGER NOT NULL,
  achievement_type TEXT CHECK (achievement_type IN ('streak', 'workouts_completed', 'focus_area'))
);

-- User Achievements junction table - tracks which achievements users have earned
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users_table(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- User Streaks table - tracks consecutive workout completion
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users_table(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_workouts_user_id ON user_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_workout_id ON user_workouts(workout_id);
CREATE INDEX IF NOT EXISTS idx_user_workouts_completed_at ON user_workouts(completed_at);
CREATE INDEX IF NOT EXISTS idx_daily_workouts_date ON daily_workouts(schedule_date);
CREATE INDEX IF NOT EXISTS idx_workout_movements_workout_id ON workout_movements(workout_id);

-- Create RLS (Row Level Security) policies
-- Note: These ensure users can only access their own data

-- Allow users to select their own workout data
ALTER TABLE user_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_workouts ON user_workouts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own workout data
CREATE POLICY insert_own_workouts ON user_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own workout data
CREATE POLICY update_own_workouts ON user_workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to select their own achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_achievements ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to select their own streak data
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_streaks ON user_streaks
  FOR SELECT USING (auth.uid() = user_id);

-- Allow read access to workouts for all authenticated users
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_workouts ON workouts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow read access to focus areas for all authenticated users
ALTER TABLE focus_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_focus_areas ON focus_areas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow read access to movements for all authenticated users
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_movements ON movements
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow read access to daily workouts for all authenticated users
ALTER TABLE daily_workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_daily_workouts ON daily_workouts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow read access to achievements for all authenticated users
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY read_achievements ON achievements
  FOR SELECT USING (auth.role() = 'authenticated'); 