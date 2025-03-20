// Add theme_preference column to users_table
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '[exists]' : '[missing]');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '[exists]' : '[missing]');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log('Running migration: Add theme_preference column to users_table');
  
  try {
    // Check if the column already exists
    const { data: columns, error: columnError } = await supabase
      .from('users_table')
      .select('theme_preference')
      .limit(1);
    
    if (!columnError) {
      console.log('Column theme_preference already exists, skipping migration');
      return;
    }
    
    // Add the column
    // Since we can't use ALTER TABLE directly with Supabase client,
    // we'll use a PostgreSQL function to add the column if it doesn't exist
    const { error } = await supabase.rpc('add_theme_preference_column');
    
    if (error) {
      // Function might not exist, create it first
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION add_theme_preference_column()
        RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'users_table' AND column_name = 'theme_preference'
          ) THEN
            ALTER TABLE users_table ADD COLUMN theme_preference TEXT DEFAULT 'light';
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createFunctionQuery });
      
      if (createFunctionError) {
        console.error('Error creating function:', createFunctionError);
        process.exit(1);
      }
      
      // Execute the function after creating it
      const { error: executeError } = await supabase.rpc('add_theme_preference_column');
      
      if (executeError) {
        console.error('Error executing function:', executeError);
        process.exit(1);
      }
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

main(); 