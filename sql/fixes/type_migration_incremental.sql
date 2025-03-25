-- Convert one notification column from INTEGER to BOOLEAN
DO $$
BEGIN
    -- First handle push_notifications_enabled column
    ALTER TABLE users_table ADD COLUMN push_notifications_enabled_bool BOOLEAN DEFAULT false;
    
    -- Update with explicit casting to integer
    UPDATE users_table SET 
        push_notifications_enabled_bool = (push_notifications_enabled::integer = 1);
    
    -- Drop the integer column
    ALTER TABLE users_table DROP COLUMN push_notifications_enabled;
    
    -- Rename the boolean column to the original column name
    ALTER TABLE users_table RENAME COLUMN push_notifications_enabled_bool TO push_notifications_enabled;
END $$; 