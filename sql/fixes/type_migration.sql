-- Convert notification columns from INTEGER to BOOLEAN
DO $$
BEGIN
    -- First, add temporary boolean columns
    ALTER TABLE users_table ADD COLUMN push_notifications_enabled_bool BOOLEAN DEFAULT false;
    ALTER TABLE users_table ADD COLUMN email_notifications_enabled_bool BOOLEAN DEFAULT true;
    ALTER TABLE users_table ADD COLUMN new_workout_notifications_bool BOOLEAN DEFAULT true;
    ALTER TABLE users_table ADD COLUMN workout_reminder_enabled_bool BOOLEAN DEFAULT false;

    -- Transfer data from the integer columns to the boolean columns using explicit casting
    UPDATE users_table SET 
        push_notifications_enabled_bool = (push_notifications_enabled::integer = 1),
        email_notifications_enabled_bool = (email_notifications_enabled::integer = 1),
        new_workout_notifications_bool = (new_workout_notifications::integer = 1),
        workout_reminder_enabled_bool = (workout_reminder_enabled::integer = 1);

    -- Drop the integer columns
    ALTER TABLE users_table DROP COLUMN push_notifications_enabled;
    ALTER TABLE users_table DROP COLUMN email_notifications_enabled;
    ALTER TABLE users_table DROP COLUMN new_workout_notifications;
    ALTER TABLE users_table DROP COLUMN workout_reminder_enabled;

    -- Rename the boolean columns to the original column names
    ALTER TABLE users_table RENAME COLUMN push_notifications_enabled_bool TO push_notifications_enabled;
    ALTER TABLE users_table RENAME COLUMN email_notifications_enabled_bool TO email_notifications_enabled;
    ALTER TABLE users_table RENAME COLUMN new_workout_notifications_bool TO new_workout_notifications;
    ALTER TABLE users_table RENAME COLUMN workout_reminder_enabled_bool TO workout_reminder_enabled;
END $$; 