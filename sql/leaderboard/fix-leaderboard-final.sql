-- Drop and recreate all leaderboard functions with fixes

-- Fixed function for streak leaderboard
CREATE OR REPLACE FUNCTION public.update_streak_leaderboard()
RETURNS void AS $$
DECLARE
  streak_category_id UUID;
BEGIN
  -- Get the category ID within the function
  SELECT id INTO streak_category_id FROM public.leaderboard_categories WHERE name = 'Longest Streak';

  -- Remove existing entries for this category
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = streak_category_id;
  
  -- Insert new entries using auth.users table instead of public.users
  INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT 
    streak_category_id,
    u.id,
    ROW_NUMBER() OVER (ORDER BY COALESCE(p.streak_count, 0) DESC) as rank,
    COALESCE(p.streak_count, 0) as score,
    now() as last_updated
  FROM 
    auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE 
    p.streak_count > 0 OR p.streak_count IS NULL
  ORDER BY 
    COALESCE(p.streak_count, 0) DESC
  LIMIT 100;
  
  RAISE NOTICE 'Streak leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed function for total workouts
CREATE OR REPLACE FUNCTION public.calculate_total_workouts_leaderboard(cat_id UUID)
RETURNS void AS $$
BEGIN
  -- Clear existing entries for this category
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = cat_id;
  
  -- Insert new entries with fully qualified column names
  INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT
    cat_id,
    wc.user_id,
    ROW_NUMBER() OVER (ORDER BY COUNT(wc.id) DESC) as rank,
    COUNT(wc.id) as score,
    NOW() as last_updated
  FROM
    public.workouts_completed wc
  GROUP BY
    wc.user_id
  ORDER BY
    COUNT(wc.id) DESC
  LIMIT 100;
  
  RAISE NOTICE 'Total workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed function for weekly workouts
CREATE OR REPLACE FUNCTION public.calculate_weekly_workouts_leaderboard(cat_id UUID)
RETURNS void AS $$
DECLARE
  week_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current week (Sunday)
  SELECT DATE_TRUNC('week', NOW()) INTO week_start;
  
  -- Clear existing entries for this category
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = cat_id;
  
  -- Insert new entries with fully qualified column names
  INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT
    cat_id,
    wc.user_id,
    ROW_NUMBER() OVER (ORDER BY COUNT(wc.id) DESC) as rank,
    COUNT(wc.id) as score,
    NOW() as last_updated
  FROM
    public.workouts_completed wc
  WHERE
    wc.created_at >= week_start
  GROUP BY
    wc.user_id
  ORDER BY
    COUNT(wc.id) DESC
  LIMIT 100;
  
  RAISE NOTICE 'Weekly workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed function for monthly workouts
CREATE OR REPLACE FUNCTION public.calculate_monthly_workouts_leaderboard(cat_id UUID)
RETURNS void AS $$
DECLARE
  month_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current month
  SELECT DATE_TRUNC('month', NOW()) INTO month_start;
  
  -- Clear existing entries for this category
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = cat_id;
  
  -- Insert new entries with fully qualified column names
  INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
  SELECT
    cat_id,
    wc.user_id,
    ROW_NUMBER() OVER (ORDER BY COUNT(wc.id) DESC) as rank,
    COUNT(wc.id) as score,
    NOW() as last_updated
  FROM
    public.workouts_completed wc
  WHERE
    wc.created_at >= month_start
  GROUP BY
    wc.user_id
  ORDER BY
    COUNT(wc.id) DESC
  LIMIT 100;
  
  RAISE NOTICE 'Monthly workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 