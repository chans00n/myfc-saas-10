import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { completeWorkout } from '@/utils/supabase/database';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get workout duration from the database (would be better to pass this from client)
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .select('duration_minutes')
      .eq('id', params.id)
      .single();
    
    if (workoutError || !workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }
    
    // Complete the workout
    await completeWorkout(user.id, params.id, workout.duration_minutes);
    
    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error completing workout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 