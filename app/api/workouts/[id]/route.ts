import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getWorkoutById } from '@/utils/supabase/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workout = await getWorkoutById(params.id);
    
    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(workout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 