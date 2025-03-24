import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key - this bypasses RLS
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing environment variables for Supabase admin client');
  }
  
  // Create a Supabase client with the service role key to bypass RLS
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}; 