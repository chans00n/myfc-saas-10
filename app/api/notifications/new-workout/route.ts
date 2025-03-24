import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendNewWorkoutNotifications } from '@/utils/workout-notifications';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get workout details from request
    const workout = await request.json();
    
    if (!workout || !workout.title) {
      return NextResponse.json(
        { error: 'Workout title is required' },
        { status: 400 }
      );
    }
    
    // Send notifications
    const result = await sendNewWorkoutNotifications(workout);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending new workout notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send new workout notifications' },
      { status: 500 }
    );
  }
} 