-- Migration script to create the workout_bookmarks table
-- Run this in the Supabase SQL Editor

-- Create workout_bookmarks table if it doesn't exist
CREATE TABLE IF NOT EXISTS workout_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Add a unique constraint to ensure a workout is only bookmarked once per user
  UNIQUE(user_id, workout_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workout_bookmarks_user_id ON workout_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_bookmarks_workout_id ON workout_bookmarks(workout_id);

-- Enable Row Level Security
ALTER TABLE workout_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can see only their own bookmarks
CREATE POLICY "Users can view their own bookmarks" 
  ON workout_bookmarks 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can create their own bookmarks" 
  ON workout_bookmarks 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks" 
  ON workout_bookmarks 
  FOR DELETE 
  USING (auth.uid() = user_id);

COMMENT ON TABLE workout_bookmarks IS 'Stores the workouts that users have bookmarked'; 