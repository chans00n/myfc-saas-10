-- Check for users table
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'
) AS public_users_exists;

SELECT EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users'
) AS auth_users_exists;

-- Check for profiles table
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles'
) AS profiles_exists;

-- Get user table columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Check for workouts_completed table
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workouts_completed'
) AS workouts_completed_exists;

-- Get columns of workouts_completed
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'workouts_completed'
ORDER BY ordinal_position; 