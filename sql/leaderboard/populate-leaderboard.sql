-- Script to populate leaderboard with test data for the current user

-- Get all leaderboard categories
SELECT id, name FROM leaderboard_categories WHERE is_active = true;

-- Find the current user ID 
SELECT id, email FROM users_table LIMIT 10;

-- Insert test entries for each category (adjust with actual values from queries above)
-- Replace 'YOUR_USER_ID' with the actual user ID from the query above
-- Replace 'CATEGORY_ID_1', 'CATEGORY_ID_2', etc. with the actual category IDs

-- Insert entry for All-Time Workouts
INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
VALUES 
  ('CATEGORY_ID_1', 'YOUR_USER_ID', 1, 42, NOW()),
  ('CATEGORY_ID_1', '00000000-0000-0000-0000-000000000001', 2, 38, NOW()),
  ('CATEGORY_ID_1', '00000000-0000-0000-0000-000000000002', 3, 35, NOW());

-- Insert entry for Longest Streak
INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
VALUES 
  ('CATEGORY_ID_2', 'YOUR_USER_ID', 1, 21, NOW()),
  ('CATEGORY_ID_2', '00000000-0000-0000-0000-000000000001', 2, 18, NOW()),
  ('CATEGORY_ID_2', '00000000-0000-0000-0000-000000000002', 3, 15, NOW());

-- Insert entry for Weekly Champions
INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
VALUES 
  ('CATEGORY_ID_3', 'YOUR_USER_ID', 1, 7, NOW()),
  ('CATEGORY_ID_3', '00000000-0000-0000-0000-000000000001', 2, 6, NOW()),
  ('CATEGORY_ID_3', '00000000-0000-0000-0000-000000000002', 3, 5, NOW());

-- Insert entry for Monthly Dedication
INSERT INTO leaderboard_entries (category_id, user_id, rank, score, last_updated)
VALUES 
  ('CATEGORY_ID_4', 'YOUR_USER_ID', 1, 95, NOW()),
  ('CATEGORY_ID_4', '00000000-0000-0000-0000-000000000001', 2, 90, NOW()),
  ('CATEGORY_ID_4', '00000000-0000-0000-0000-000000000002', 3, 85, NOW());
