import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserBookmarks } from '@/utils/supabase/database';

/**
 * GET /api/bookmarks/all - Fetches all bookmarks for the current user
 */
export async function GET() {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Get all bookmarks for the user
    const bookmarks = await getUserBookmarks(user.id);
    
    // Extract just the workout IDs
    const bookmarkedWorkoutIds = bookmarks.map(bookmark => bookmark.workout_id);
    
    return NextResponse.json({
      bookmarkedWorkoutIds
    });
  } catch (error) {
    console.error('Error fetching user bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
} 