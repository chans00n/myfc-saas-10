import { NextRequest, NextResponse } from 'next/server';
import { adminGetAllWorkouts } from '@/lib/supabase/admin-database';

export async function GET(request: NextRequest) {
  try {
    const workouts = await adminGetAllWorkouts();
    
    // Create a response with the data
    const response = NextResponse.json(workouts);
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 