-- Fixed Streak Leaderboard Function - Handles multiple user table schemas
CREATE OR REPLACE FUNCTION public.update_streak_leaderboard()
RETURNS void AS $$
DECLARE
  streak_category_id UUID;
  user_table_query TEXT;
  user_schema TEXT;
  user_table TEXT;
  streak_column TEXT;
BEGIN
  -- Get the category ID
  SELECT id INTO streak_category_id FROM public.leaderboard_categories 
  WHERE name = 'Longest Streak';
  
  -- Dynamically determine user table and streak column
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    user_schema := 'public';
    user_table := 'users';
    
    -- Check if streak_count exists in public.users
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'streak_count') THEN
      streak_column := 'streak_count';
    ELSE
      streak_column := '0'; -- Default to 0 if column doesn't exist
    END IF;
    
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    user_schema := 'auth';
    user_table := 'users';
    
    -- For auth.users, we need to look in a profile table
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') AND
       EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'streak_count') THEN
      -- Use profiles joined to auth.users
      user_table_query := '
        SELECT 
          u.id,
          p.streak_count
        FROM ' || user_schema || '.' || user_table || ' u
        LEFT JOIN public.profiles p ON u.id = p.user_id
        WHERE p.streak_count > 0
        ORDER BY p.streak_count DESC
        LIMIT 100';
    ELSE
      -- Default to just auth.users with 0 streak
      user_table_query := '
        SELECT 
          id,
          0 as streak_count
        FROM ' || user_schema || '.' || user_table || '
        LIMIT 100';
    END IF;
  ELSE
    -- No user table found, use empty query
    RAISE NOTICE 'No user table found. Creating empty leaderboard.';
    user_table_query := 'SELECT NULL::uuid as id, 0 as streak_count LIMIT 0';
  END IF;
  
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = streak_category_id;
  
  -- Insert new entries using the dynamic query
  EXECUTE '
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT 
      $1 as category_id,
      id as user_id,
      ROW_NUMBER() OVER (ORDER BY streak_count DESC) as rank,
      streak_count as score,
      now() as last_updated
    FROM (' || user_table_query || ') as users'
    USING streak_category_id;
    
  RAISE NOTICE 'Streak leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed Total Workouts Leaderboard Function
CREATE OR REPLACE FUNCTION public.calculate_total_workouts_leaderboard(cat_id UUID)
RETURNS void AS $$
DECLARE
  workouts_table TEXT;
BEGIN
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = cat_id;
  
  -- Check if workouts_completed table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'workouts_completed') THEN
    
    -- Insert new entries
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT
      cat_id,
      wc.user_id,
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
      COUNT(*) as score,
      NOW() as last_updated
    FROM
      public.workouts_completed wc
    GROUP BY
      wc.user_id
    ORDER BY
      COUNT(*) DESC
    LIMIT 100;
    
  ELSE
    RAISE NOTICE 'workouts_completed table not found. No entries added.';
  END IF;
  
  RAISE NOTICE 'Total workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed Weekly Workouts Leaderboard Function
CREATE OR REPLACE FUNCTION public.calculate_weekly_workouts_leaderboard(cat_id UUID)
RETURNS void AS $$
DECLARE
  week_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current week
  SELECT DATE_TRUNC('week', NOW()) INTO week_start;
  
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = cat_id;
  
  -- Check if workouts_completed table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'workouts_completed') THEN
    
    -- Insert new entries
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT
      cat_id,
      wc.user_id,
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
      COUNT(*) as score,
      NOW() as last_updated
    FROM
      public.workouts_completed wc
    WHERE
      wc.created_at >= week_start
    GROUP BY
      wc.user_id
    ORDER BY
      COUNT(*) DESC
    LIMIT 100;
    
  ELSE
    RAISE NOTICE 'workouts_completed table not found. No entries added.';
  END IF;
  
  RAISE NOTICE 'Weekly workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed Monthly Workouts Leaderboard Function
CREATE OR REPLACE FUNCTION public.calculate_monthly_workouts_leaderboard(cat_id UUID)
RETURNS void AS $$
DECLARE
  month_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current month
  SELECT DATE_TRUNC('month', NOW()) INTO month_start;
  
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries 
  WHERE category_id = cat_id;
  
  -- Check if workouts_completed table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'workouts_completed') THEN
    
    -- Insert new entries
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT
      cat_id,
      wc.user_id,
      ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank,
      COUNT(*) as score,
      NOW() as last_updated
    FROM
      public.workouts_completed wc
    WHERE
      wc.created_at >= month_start
    GROUP BY
      wc.user_id
    ORDER BY
      COUNT(*) DESC
    LIMIT 100;
    
  ELSE
    RAISE NOTICE 'workouts_completed table not found. No entries added.';
  END IF;
  
  RAISE NOTICE 'Monthly workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 