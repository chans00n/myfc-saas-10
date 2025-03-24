import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendWorkoutReminders } from '@/utils/workout-notifications';

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
    // Send reminders for the current hour
    const result = await sendWorkoutReminders();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending workout reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send workout reminders' },
      { status: 500 }
    );
  }
} 