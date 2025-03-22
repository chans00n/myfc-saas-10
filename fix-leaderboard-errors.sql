-- Create leaderboard_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.leaderboard_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_field TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default categories if they don't exist
INSERT INTO public.leaderboard_categories (name, sort_field, description, is_active)
VALUES 
  ('Longest Streak', 'current_streak', 'Users with the longest active streaks', true),
  ('All-Time Workouts', 'total_workouts', 'Users who have completed the most workouts overall', true),
  ('Weekly Champions', 'weekly_workouts', 'Users who completed the most workouts this week', true),
  ('Monthly Dedication', 'monthly_completion_rate', 'Users who completed the most workouts this month', true)
ON CONFLICT DO NOTHING;

-- Get the category ID for longest streak
DO $$
DECLARE 
  streak_category_id UUID;
BEGIN
  SELECT id INTO streak_category_id FROM public.leaderboard_categories WHERE name = 'Longest Streak';

  -- Create or replace the update_streak_leaderboard function
  EXECUTE 'CREATE OR REPLACE FUNCTION public.update_streak_leaderboard()
  RETURNS void AS $$
  BEGIN
    -- Remove existing entries for the Longest Streak category
    DELETE FROM public.leaderboard_entries 
    WHERE category_id = ''' || streak_category_id || ''';
    
    -- Insert new entries for the Longest Streak category
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT 
      ''' || streak_category_id || '''::uuid,
      u.id,
      ROW_NUMBER() OVER (ORDER BY u.streak_count DESC) as rank,
      COALESCE(u.streak_count, 0) as score,
      now() as last_updated
    FROM 
      public.users u
    WHERE 
      u.streak_count > 0
    ORDER BY 
      u.streak_count DESC
    LIMIT 100;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;';
END $$;

-- Fix RLS policies for leaderboard_entries table
-- First, we'll drop any existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.leaderboard_entries;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.leaderboard_entries;

-- Create new policies
CREATE POLICY "Enable read access for all users" 
ON public.leaderboard_entries FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for service role" 
ON public.leaderboard_entries FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create policy for delete operations
CREATE POLICY "Enable delete for authenticated users" 
ON public.leaderboard_entries FOR DELETE 
TO authenticated
USING (true);

-- Add appropriate security policies to allow the cron job to work
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY; 