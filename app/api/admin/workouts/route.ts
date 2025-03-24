import { NextRequest, NextResponse } from 'next/server';
import { adminCreateOrUpdateWorkout } from '@/lib/supabase/admin-database';
import { Workout } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const { workoutData, movementsData, focusAreaIds, workoutId } = await request.json();
    
    const result = await adminCreateOrUpdateWorkout(
      workoutData as Partial<Workout>,
      movementsData,
      focusAreaIds,
      workoutId
    );
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to save workout' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing workout:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 