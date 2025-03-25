-- Function for calculating total workouts leaderboard
CREATE OR REPLACE FUNCTION calculate_total_workouts_leaderboard(category_id UUID)
RETURNS void AS $$
BEGIN
  -- Clear existing entries for this category
  DELETE FROM leaderboard_entries WHERE category_id = calculate_total_workouts_leaderboard.category_id;
  
  -- Insert new entries
  INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT
    calculate_total_workouts_leaderboard.category_id,
    wc.user_id,
    ROW_NUMBER() OVER (ORDER BY COUNT(wc.id) DESC) as rank,
    COUNT(wc.id) as score,
    NOW() as last_updated
  FROM
    workouts_completed wc
  GROUP BY
    wc.user_id
  ORDER BY
    COUNT(wc.id) DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for calculating weekly workouts leaderboard
CREATE OR REPLACE FUNCTION calculate_weekly_workouts_leaderboard(category_id UUID)
RETURNS void AS $$
DECLARE
  week_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current week (Sunday)
  SELECT DATE_TRUNC('week', NOW()) INTO week_start;
  
  -- Clear existing entries for this category
  DELETE FROM leaderboard_entries WHERE category_id = calculate_weekly_workouts_leaderboard.category_id;
  
  -- Insert new entries
  INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT
    calculate_weekly_workouts_leaderboard.category_id,
    wc.user_id,
    ROW_NUMBER() OVER (ORDER BY COUNT(wc.id) DESC) as rank,
    COUNT(wc.id) as score,
    NOW() as last_updated
  FROM
    workouts_completed wc
  WHERE
    wc.created_at >= week_start
  GROUP BY
    wc.user_id
  ORDER BY
    COUNT(wc.id) DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for calculating monthly workouts leaderboard
CREATE OR REPLACE FUNCTION calculate_monthly_workouts_leaderboard(category_id UUID)
RETURNS void AS $$
DECLARE
  month_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current month
  SELECT DATE_TRUNC('month', NOW()) INTO month_start;
  
  -- Clear existing entries for this category
  DELETE FROM leaderboard_entries WHERE category_id = calculate_monthly_workouts_leaderboard.category_id;
  
  -- Insert new entries
  INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT
    calculate_monthly_workouts_leaderboard.category_id,
    wc.user_id,
    ROW_NUMBER() OVER (ORDER BY COUNT(wc.id) DESC) as rank,
    COUNT(wc.id) as score,
    NOW() as last_updated
  FROM
    workouts_completed wc
  WHERE
    wc.created_at >= month_start
  GROUP BY
    wc.user_id
  ORDER BY
    COUNT(wc.id) DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 