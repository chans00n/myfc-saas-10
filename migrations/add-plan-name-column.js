require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Starting migration: Adding plan_name column to users_table');

  try {
    // Check if the column already exists
    const { data: columns, error: checkError } = await supabase
      .from('users_table')
      .select('*')
      .limit(1);

    if (checkError) {
      console.error('Error checking users_table:', checkError);
      process.exit(1);
    }

    // If the sample row has plan_name property, the column likely exists
    if (columns && columns.length > 0 && 'plan_name' in columns[0]) {
      console.log('Column plan_name already exists in users_table. Skipping migration.');
      return;
    }

    // Create a PostgreSQL function to add the column if it doesn't exist
    const { error: functionError } = await supabase.rpc('add_plan_name_column', {});

    // If the function doesn't exist, create it and execute it directly
    if (functionError && functionError.message.includes('function "add_plan_name_column" does not exist')) {
      console.log('Creating function and adding plan_name column');
      
      // Execute raw SQL to create the function and add the column
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE OR REPLACE FUNCTION add_plan_name_column()
          RETURNS void AS $$
          BEGIN
            ALTER TABLE users_table 
            ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Basic Plan';
          END;
          $$ LANGUAGE plpgsql;
          
          SELECT add_plan_name_column();
        `
      });

      if (sqlError) {
        console.error('Error creating function or adding column:', sqlError);
        process.exit(1);
      }
    } else if (functionError) {
      console.error('Error executing add_plan_name_column function:', functionError);
      process.exit(1);
    }

    console.log('Migration successful: Added plan_name column to users_table');

    // Update existing records to set a default plan name based on subscription ID pattern
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE users_table
        SET plan_name = 
          CASE 
            WHEN plan LIKE 'sub_%' THEN 'Premium Subscription'
            ELSE 'Basic Plan'
          END
        WHERE plan_name IS NULL OR plan_name = '';
      `
    });

    if (updateError) {
      console.error('Error updating existing records:', updateError);
    } else {
      console.log('Successfully set default plan names for existing records');
    }

  } catch (err) {
    console.error('Unexpected error during migration:', err);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  }); 