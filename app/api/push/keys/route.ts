import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Serve the public VAPID key to the client
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // In production, this is stored in environment variables
  const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  
  return NextResponse.json({ publicKey: publicVapidKey });
} 