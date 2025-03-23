import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserBookmarks } from '@/utils/supabase/database';

// Define the type for WorkoutBookmark for better type safety
interface WorkoutBookmark {
  workout_id: string;
  [key: string]: any; // For other properties
}

/**
 * GET /api/bookmarks/all - Fetches all bookmarks for the current user
 */
export async function GET() {
  console.log('[API] GET /api/bookmarks/all called');
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('[API] Unauthorized access attempt to all bookmarks API');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  console.log(`[API] Fetching all bookmarks for user: ${user.id}`);

  try {
    // Get all bookmarks for the user
    const bookmarks = await getUserBookmarks(user.id);
    console.log(`[API] Retrieved ${bookmarks.length} bookmarks from database`);
    
    // Extract workout IDs but preserve them as strings to avoid type issues
    const bookmarkedWorkoutIds = bookmarks.map(bookmark => {
      const workoutId = (bookmark as WorkoutBookmark).workout_id;
      console.log(`[API] Processing bookmark ID: ${workoutId}, type: ${typeof workoutId}`);
      return workoutId; // Keep original ID format
    });
    
    console.log(`[API] Returning ${bookmarkedWorkoutIds.length} bookmark IDs to client:`, bookmarkedWorkoutIds);
    
    return NextResponse.json({
      bookmarkedWorkoutIds
    });
  } catch (error) {
    console.error('[API] Error fetching user bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
} 