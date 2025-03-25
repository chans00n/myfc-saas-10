-- Check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'users_table' AND column_name = 'theme_preference'
    ) THEN
        -- Add the theme_preference column with default value 'light'
        ALTER TABLE users_table ADD COLUMN theme_preference TEXT DEFAULT 'light';
        RAISE NOTICE 'Column theme_preference added successfully!';
    ELSE
        RAISE NOTICE 'Column theme_preference already exists!';
    END IF;
END $$; 