-- Migration: Add facial progress photos tracking
-- Description: Adds tables and storage for facial fitness tracking features

-- Create facial progress photos table
CREATE TABLE IF NOT EXISTS facial_progress_photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users_table(id),
  photo_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lighting_score INTEGER,
  alignment_score INTEGER,
  notes TEXT,
  metadata TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users_table(id) ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_facial_progress_user_id ON facial_progress_photos(user_id);

-- Create index on timestamp for sorted queries
CREATE INDEX IF NOT EXISTS idx_facial_progress_timestamp ON facial_progress_photos(timestamp);

-- Add appropriate RLS policies
ALTER TABLE facial_progress_photos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own photos
CREATE POLICY "Users can view their own facial progress photos"
  ON facial_progress_photos
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Users can insert only their own photos
CREATE POLICY "Users can insert their own facial progress photos"
  ON facial_progress_photos
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update only their own photos
CREATE POLICY "Users can update their own facial progress photos"
  ON facial_progress_photos
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Policy: Users can delete only their own photos
CREATE POLICY "Users can delete their own facial progress photos"
  ON facial_progress_photos
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Note: This migration assumes a storage bucket named 'facial-progress' has been created
-- with appropriate RLS policies for user storage access. 