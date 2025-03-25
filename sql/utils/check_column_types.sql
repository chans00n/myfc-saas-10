-- Check column data types
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