import { NextRequest, NextResponse } from 'next/server';
import { adminGetWorkoutWithDetails } from '@/lib/supabase/admin-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    const workoutDetails = await adminGetWorkoutWithDetails(id);

    if (!workoutDetails.workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    // Create response with strong cache busting headers
    const response = NextResponse.json({
      workout: workoutDetails.workout,
      movements: workoutDetails.movements,
      focusAreas: workoutDetails.focusAreas,
      // Include timestamp for client-side cache validation
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    // Set very aggressive cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    // Add a random ETag to defeat browser caching
    response.headers.set('ETag', `"${Math.random().toString(36).substring(2, 15)}"`);
    
    return response;
  } catch (error: any) {
    console.error('Error fetching workout details:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 