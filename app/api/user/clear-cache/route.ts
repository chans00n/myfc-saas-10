import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// We don't actually need to store the cache here,
// just need a way to signal other APIs to clear their caches
let cacheResetToken = Date.now();

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  // Only authenticated users can clear the cache
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Generate a new cache token
    cacheResetToken = Date.now();
    
    // Return the new token for possible use by clients
    return NextResponse.json({
      success: true,
      timestamp: cacheResetToken,
      message: 'Cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

// Provide the current cache token
export async function GET() {
  return NextResponse.json({
    cacheToken: cacheResetToken
  });
} 