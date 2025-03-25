-- Insert a test user with notifications enabled if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users_table WHERE email = 'test@example.com') THEN
        INSERT INTO users_table (
            id, 
            email, 
            name, 
            created_at,
            push_notifications_enabled,
            email_notifications_enabled,
            new_workout_notifications,
            workout_reminder_enabled
        ) VALUES (
            'test-user-id',
            'test@example.com',
            'Test User',
            NOW(),
            1,  -- push notifications enabled
            1,  -- email notifications enabled
            1,  -- new workout notifications enabled
            1   -- workout reminders enabled
        );
    END IF;
END $$; 