import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { toggleWorkoutBookmark, isWorkoutBookmarked } from '@/utils/supabase/database';

// POST request to toggle a bookmark (add or remove)
export async function POST(request: NextRequest) {
  console.log('[API] POST /api/bookmarks called');
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[API] Unauthorized access attempt to bookmark API:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`[API] Authenticated user: ${user.id}`);
    
    // First try to get workoutId from URL params (for backward compatibility)
    const url = new URL(request.url);
    let workoutId = url.searchParams.get('workoutId');
    
    // If not in URL params, try to get from request body
    if (!workoutId) {
      try {
        const body = await request.json();
        workoutId = body.workoutId;
        console.log(`[API] Extracted workoutId from body: ${workoutId}`);
      } catch (e) {
        console.error('[API] Error parsing request body:', e);
      }
    } else {
      console.log(`[API] Extracted workoutId from URL params: ${workoutId}`);
    }
    
    if (!workoutId) {
      console.error('[API] Missing workout ID in request');
      return NextResponse.json(
        { error: 'Missing workout ID' },
        { status: 400 }
      );
    }
    
    // Ensure workoutId is a string
    const workoutIdString = String(workoutId);
    console.log(`[API] Processing toggle for workoutId: ${workoutIdString}`);
    
    const isBookmarked = await toggleWorkoutBookmark(user.id, workoutIdString);
    console.log(`[API] Toggle result for ${workoutIdString}: ${isBookmarked}`);
    
    return NextResponse.json({ isBookmarked });
  } catch (error) {
    console.error('[API] Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET request to check if a workout is bookmarked
export async function GET(request: NextRequest) {
  console.log('[API] GET /api/bookmarks called');
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[API] Unauthorized access attempt to check bookmark:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log(`[API] Authenticated user: ${user.id}`);
    
    const url = new URL(request.url);
    const workoutId = url.searchParams.get('workoutId');
    
    if (!workoutId) {
      console.error('[API] Missing workout ID in request');
      return NextResponse.json(
        { error: 'Missing workout ID' },
        { status: 400 }
      );
    }
    
    console.log(`[API] Checking bookmark status for workoutId: ${workoutId}`);
    
    // Ensure workoutId is a string for database operations
    const workoutIdString = String(workoutId);
    
    const isBookmarked = await isWorkoutBookmarked(user.id, workoutIdString);
    console.log(`[API] Bookmark status for ${workoutIdString}: ${isBookmarked}`);
    
    return NextResponse.json({ isBookmarked });
  } catch (error) {
    console.error('[API] Error checking bookmark status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 