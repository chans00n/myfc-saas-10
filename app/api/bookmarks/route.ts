import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { toggleWorkoutBookmark, isWorkoutBookmarked } from '@/utils/supabase/database';

// POST request to toggle a bookmark (add or remove)
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { workoutId } = await request.json();
    
    if (!workoutId) {
      return NextResponse.json(
        { error: 'Missing workout ID' },
        { status: 400 }
      );
    }
    
    const isBookmarked = await toggleWorkoutBookmark(user.id, workoutId);
    
    return NextResponse.json({ isBookmarked });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET request to check if a workout is bookmarked
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const url = new URL(request.url);
    const workoutId = url.searchParams.get('workoutId');
    
    if (!workoutId) {
      return NextResponse.json(
        { error: 'Missing workout ID' },
        { status: 400 }
      );
    }
    
    const isBookmarked = await isWorkoutBookmarked(user.id, workoutId);
    
    return NextResponse.json({ isBookmarked });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 