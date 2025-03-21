import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Only allow this endpoint to be called in development or authorized requests
  const isLocal = process.env.NODE_ENV === 'development';
  const authHeader = request.headers.get('authorization');
  const isAuthorized = authHeader === `Bearer ${process.env.MIGRATION_SECRET_KEY}`;
  
  if (!isLocal && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const supabase = createClient();
    
    // First check if column exists
    const { data: columnExists, error: checkError } = await supabase.rpc('check_column_exists', {
      table_name: 'users_table',
      column_name: 'plan_name'
    });
    
    if (checkError) {
      // If the RPC call fails, try a direct SQL approach
      console.log('RPC check_column_exists failed, using alternative method...');
      
      // Add the column if it doesn't exist
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE users_table 
          ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Basic Plan';
        `
      });
      
      if (alterError) {
        return NextResponse.json({ error: alterError.message }, { status: 500 });
      }
    } else if (!columnExists) {
      // Column doesn't exist, add it
      const { error: alterError } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE users_table 
          ADD COLUMN IF NOT EXISTS plan_name TEXT DEFAULT 'Basic Plan';
        `
      });
      
      if (alterError) {
        return NextResponse.json({ error: alterError.message }, { status: 500 });
      }
    } else {
      console.log('Column plan_name already exists');
    }
    
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
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    
    // Check how many records were updated
    const { data: records, error: countError } = await supabase
      .from('users_table')
      .select('id, email, plan, plan_name')
      .limit(5);
    
    return NextResponse.json({
      success: true,
      message: 'Column added and records updated successfully',
      sample_records: records
    });
  } catch (error: any) {
    console.error('Error in migration:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 