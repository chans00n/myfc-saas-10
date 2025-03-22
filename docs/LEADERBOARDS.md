# MYFC Leaderboard System

This document explains how the leaderboard system works in My Face Coach, including the database structure, update mechanisms, and implementation details.

## Database Structure

The leaderboard system uses the following tables:

- **leaderboard_categories**: Defines the different types of leaderboards (e.g., streaks, total workouts)
- **leaderboard_entries**: Stores the actual leaderboard data for each user
- **user_streaks**: Tracks user workout streaks for the streak leaderboard

### Table Details

#### leaderboard_categories
- `id`: Unique identifier
- `name`: Display name (e.g., "Current Streak")
- `description`: Detailed description
- `sort_field`: The field used to rank users (e.g., 'current_streak', 'total_workouts')
- `sort_order`: Sort direction, usually 'desc' for highest first
- `is_active`: Whether this leaderboard is currently active
- `refresh_frequency`: How often the leaderboard is updated

#### leaderboard_entries
- `id`: Unique identifier
- `category_id`: References the leaderboard category
- `user_id`: The user this entry belongs to
- `rank`: The user's position on the leaderboard
- `score`: The user's numerical score
- `last_updated`: When this entry was last updated

#### user_streaks
- `id`: Unique identifier
- `user_id`: The user this streak belongs to
- `current_streak`: Current consecutive days with completed workouts
- `longest_streak`: All-time longest streak
- `last_workout_date`: The date of the last workout

## Update Mechanisms

The leaderboard data is updated through multiple mechanisms:

### 1. Real-time Updates via Database Triggers

When a user completes a workout, database triggers automatically:
- Update the user's streak information
- Set a notification to update relevant leaderboards

See `sql/leaderboard_triggers.sql` for implementation.

### 2. API Endpoint for Manual Updates

Admins can manually trigger an update through:
```
POST /api/leaderboards/update
```

This endpoint:
- Requires admin authentication
- Updates all active leaderboard categories
- Returns detailed success/failure information

### 3. Scheduled Updates via Cron Job

A scheduled task runs regularly to ensure leaderboards stay current:
```
GET /api/cron/update-leaderboards?secret=YOUR_CRON_SECRET
```

Configure this with Vercel Cron or a similar service to run daily.

## Leaderboard Types

1. **Current Streak**: Shows users with the longest active streak of completed workouts
2. **Total Workouts**: Ranks users by the total number of workouts they've completed
3. **Weekly Workouts**: Shows which users have completed the most workouts in the current week
4. **Monthly Completion**: Ranks users by their workout completion rate for the current month

## Implementation Notes

### Client Component

The `LeaderboardTabs` component in `components/leaderboards/LeaderboardTabs.tsx` displays the leaderboard data, with tabs for different categories. It also shows the user their own rank separately.

### Server Component

The main leaderboard page in `app/leaderboards/page.tsx` is a server component that:
1. Fetches the current user information
2. Gets all active leaderboard categories
3. Handles loading states with Suspense
4. Provides admin controls when relevant

### Admin Controls

Admin users (configurable via email address) have access to:
- Manual leaderboard update button
- Analytics on leaderboard performance (to be implemented)

## Setting Up Leaderboards

To set up leaderboards in a new environment:

1. Run the database migration scripts in `sql/leaderboard_tables.sql`
2. Run the trigger scripts in `sql/leaderboard_triggers.sql`
3. Configure a scheduled job to call the cron endpoint daily
4. Complete a few workouts to see data appear

## Customizing Leaderboards

To add a new leaderboard type:

1. Insert a new record into the `leaderboard_categories` table
2. Add the corresponding update logic in:
   - `updateLeaderboardForCategory` function in API endpoints
   - Database triggers if real-time updates are needed

## Troubleshooting

If leaderboards aren't updating:

1. Check that database triggers are properly installed
2. Verify that completed workouts have `completed_at` timestamps
3. Ensure the cron job is running regularly
4. Check for errors in the server logs

## Future Improvements

Planned improvements include:
- Friends-only leaderboards
- More detailed statistics
- Achievement badges for top performers
- Historical leaderboard data 