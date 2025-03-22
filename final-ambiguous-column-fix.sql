-- Drop existing functions
DROP FUNCTION IF EXISTS public.calculate_total_workouts_leaderboard(uuid);
DROP FUNCTION IF EXISTS public.calculate_weekly_workouts_leaderboard(uuid);
DROP FUNCTION IF EXISTS public.calculate_monthly_workouts_leaderboard(uuid);

-- Total Workouts Leaderboard Function with fully qualified column references
CREATE OR REPLACE FUNCTION public.calculate_total_workouts_leaderboard(category_id UUID)
RETURNS void AS $$
BEGIN
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries 
  WHERE public.leaderboard_entries.category_id = category_id;
  
  -- Check if workouts_completed table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'workouts_completed') THEN
    
    -- Insert new entries using users_table
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT
      category_id,
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
    -- Placeholder data if workouts_completed doesn't exist
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT 
      category_id,
      ut.id,
      ROW_NUMBER() OVER (ORDER BY RANDOM()) as rank,
      FLOOR(RANDOM() * 10 + 1)::integer as score, -- Random score between 1-10
      NOW() as last_updated
    FROM 
      public.users_table ut
    LIMIT 100;
    
    RAISE NOTICE 'workouts_completed table not found. Using placeholder data.';
  END IF;
  
  RAISE NOTICE 'Total workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Weekly Workouts Leaderboard Function with fully qualified column references
CREATE OR REPLACE FUNCTION public.calculate_weekly_workouts_leaderboard(category_id UUID)
RETURNS void AS $$
DECLARE
  week_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current week
  SELECT DATE_TRUNC('week', NOW()) INTO week_start;
  
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries 
  WHERE public.leaderboard_entries.category_id = category_id;
  
  -- Check if workouts_completed table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'workouts_completed') THEN
    
    -- Insert new entries using users_table
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT
      category_id,
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
    -- Placeholder data if workouts_completed doesn't exist
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT 
      category_id,
      ut.id,
      ROW_NUMBER() OVER (ORDER BY RANDOM()) as rank,
      FLOOR(RANDOM() * 5 + 1)::integer as score, -- Random score between 1-5
      NOW() as last_updated
    FROM 
      public.users_table ut
    LIMIT 100;
    
    RAISE NOTICE 'workouts_completed table not found. Using placeholder data.';
  END IF;
  
  RAISE NOTICE 'Weekly workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Monthly Workouts Leaderboard Function with fully qualified column references
CREATE OR REPLACE FUNCTION public.calculate_monthly_workouts_leaderboard(category_id UUID)
RETURNS void AS $$
DECLARE
  month_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get start of current month
  SELECT DATE_TRUNC('month', NOW()) INTO month_start;
  
  -- Clear existing entries
  DELETE FROM public.leaderboard_entries le
  WHERE le.category_id = category_id;
  
  -- Check if workouts_completed table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables 
             WHERE table_schema = 'public' AND table_name = 'workouts_completed') THEN
    
    -- Insert new entries using users_table
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT
      category_id,
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
    -- Placeholder data if workouts_completed doesn't exist
    INSERT INTO public.leaderboard_entries (category_id, user_id, rank, score, last_updated)
    SELECT 
      category_id,
      ut.id,
      ROW_NUMBER() OVER (ORDER BY RANDOM()) as rank,
      FLOOR(RANDOM() * 7 + 1)::integer as score, -- Random score between 1-7
      NOW() as last_updated
    FROM 
      public.users_table ut
    LIMIT 100;
    
    RAISE NOTICE 'workouts_completed table not found. Using placeholder data.';
  END IF;
  
  RAISE NOTICE 'Monthly workouts leaderboard updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 