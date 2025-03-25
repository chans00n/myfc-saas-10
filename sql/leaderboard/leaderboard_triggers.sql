-- SQL to create triggers for automatically updating leaderboard data
-- You can run this in the Supabase SQL Editor

-- Function to update leaderboards
CREATE OR REPLACE FUNCTION update_leaderboards_on_workout_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only react to completion status changes
  IF (TG_OP = 'INSERT' AND NEW.completed = true) OR 
     (TG_OP = 'UPDATE' AND OLD.completed = false AND NEW.completed = true) THEN
    
    -- Schedule a background job to update leaderboards
    -- This avoids blocking the user's transaction
    PERFORM pg_notify('leaderboard_update', json_build_object(
      'user_id', NEW.user_id,
      'timestamp', now()
    )::text);
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_workouts table
DROP TRIGGER IF EXISTS trigger_update_leaderboards ON user_workouts;
CREATE TRIGGER trigger_update_leaderboards
AFTER INSERT OR UPDATE ON user_workouts
FOR EACH ROW
EXECUTE FUNCTION update_leaderboards_on_workout_change();

-- Function to recalculate user streak when workouts change
CREATE OR REPLACE FUNCTION recalculate_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_completed_date DATE;
  gap INTEGER;
  streak_record RECORD;
BEGIN
  -- Only proceed if the workout status is changing to completed
  IF (TG_OP = 'INSERT' AND NEW.completed = true) OR 
     (TG_OP = 'UPDATE' AND OLD.completed = false AND NEW.completed = true) THEN
    
    -- Get the user's current streak record
    SELECT * INTO streak_record FROM user_streaks WHERE user_id = NEW.user_id;
    
    -- If no streak record exists, create one
    IF streak_record IS NULL THEN
      INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_workout_date)
      VALUES (NEW.user_id, 1, 1, CURRENT_DATE);
    ELSE
      -- Get the date of the last completed workout
      SELECT completed_at::date INTO last_completed_date 
      FROM user_workouts 
      WHERE user_id = NEW.user_id AND completed = true AND id != NEW.id
      ORDER BY completed_at DESC 
      LIMIT 1;
      
      -- Calculate gap between current workout and the last one
      IF last_completed_date IS NOT NULL THEN
        gap := CURRENT_DATE - last_completed_date;
      ELSE
        gap := 0; -- First workout
      END IF;
      
      -- Update streak based on the gap
      IF gap = 0 THEN
        -- Same day, no change to streak
        NULL;
      ELSIF gap = 1 THEN
        -- Consecutive day, increment streak
        UPDATE user_streaks 
        SET current_streak = current_streak + 1,
            longest_streak = GREATEST(longest_streak, current_streak + 1),
            last_workout_date = CURRENT_DATE
        WHERE user_id = NEW.user_id;
      ELSE
        -- Streak broken, reset to 1
        UPDATE user_streaks 
        SET current_streak = 1,
            last_workout_date = CURRENT_DATE
        WHERE user_id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating streaks
DROP TRIGGER IF EXISTS trigger_recalculate_user_streak ON user_workouts;
CREATE TRIGGER trigger_recalculate_user_streak
AFTER INSERT OR UPDATE ON user_workouts
FOR EACH ROW
EXECUTE FUNCTION recalculate_user_streak();

-- Function to update leaderboard entries based on user streaks
CREATE OR REPLACE FUNCTION update_streak_leaderboard()
RETURNS VOID AS $$
DECLARE
  streak_category_id UUID;
BEGIN
  -- Get the streak category ID
  SELECT id INTO streak_category_id FROM leaderboard_categories 
  WHERE sort_field = 'current_streak' AND is_active = true
  LIMIT 1;
  
  -- Exit if no active streak category
  IF streak_category_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Delete existing entries
  DELETE FROM leaderboard_entries WHERE category_id = streak_category_id;
  
  -- Insert updated entries
  INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT 
    streak_category_id,
    user_id,
    ROW_NUMBER() OVER (ORDER BY current_streak DESC) as rank,
    current_streak as score,
    NOW() as last_updated
  FROM user_streaks
  WHERE current_streak > 0
  ORDER BY current_streak DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Function to manually trigger leaderboard updates
-- Run this with: SELECT refresh_leaderboards();
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Update streak leaderboard
  PERFORM update_streak_leaderboard();
  
  -- TODO: Add functions for other leaderboard types
  
  result := 'Leaderboards refreshed at ' || NOW();
  RETURN result;
END;
$$ LANGUAGE plpgsql;