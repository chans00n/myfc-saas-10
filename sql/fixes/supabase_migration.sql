-- Add notification columns to users_table if they don't exist
DO $$
BEGIN
    -- Check if push_notifications_enabled column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users_table' AND column_name = 'push_notifications_enabled') THEN
        ALTER TABLE users_table ADD COLUMN push_notifications_enabled INTEGER DEFAULT 0;
    END IF;

    -- Check if email_notifications_enabled column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users_table' AND column_name = 'email_notifications_enabled') THEN
        ALTER TABLE users_table ADD COLUMN email_notifications_enabled INTEGER DEFAULT 1;
    END IF;

    -- Check if new_workout_notifications column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users_table' AND column_name = 'new_workout_notifications') THEN
        ALTER TABLE users_table ADD COLUMN new_workout_notifications INTEGER DEFAULT 1;
    END IF;

    -- Check if new_workout_notification_time column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users_table' AND column_name = 'new_workout_notification_time') THEN
        ALTER TABLE users_table ADD COLUMN new_workout_notification_time TEXT DEFAULT '08:00';
    END IF;

    -- Check if workout_reminder_enabled column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users_table' AND column_name = 'workout_reminder_enabled') THEN
        ALTER TABLE users_table ADD COLUMN workout_reminder_enabled INTEGER DEFAULT 0;
    END IF;

    -- Check if workout_reminder_time column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users_table' AND column_name = 'workout_reminder_time') THEN
        ALTER TABLE users_table ADD COLUMN workout_reminder_time TEXT DEFAULT '17:00';
    END IF;

    -- Create push_subscriptions table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'push_subscriptions') THEN
        CREATE TABLE push_subscriptions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users_table(id),
            endpoint TEXT NOT NULL,
            p256dh TEXT NOT NULL,
            auth TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$; 