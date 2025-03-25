-- View user notification column types first
SELECT 
    column_name, 
    data_type
FROM 
    information_schema.columns
WHERE 
    table_name = 'users_table' AND 
    column_name IN (
        'push_notifications_enabled',
        'email_notifications_enabled',
        'new_workout_notifications',
        'workout_reminder_enabled'
    );

-- If we find the columns are INTEGER, we should create a Postgres VIEW that casts the values to boolean
-- This is a less disruptive alternative to changing the underlying column types

CREATE OR REPLACE VIEW users_notification_view AS
SELECT 
    id,
    auth_id,
    name,
    email,
    image,
    push_notifications_enabled::boolean as push_notifications_enabled,
    email_notifications_enabled::boolean as email_notifications_enabled,
    new_workout_notifications::boolean as new_workout_notifications,
    workout_reminder_enabled::boolean as workout_reminder_enabled,
    new_workout_notification_time,
    workout_reminder_time,
    created_at,
    updated_at,
    stripe_customer_id
FROM users_table; 