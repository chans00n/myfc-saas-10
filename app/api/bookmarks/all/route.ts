import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserBookmarks } from '@/utils/supabase/database';
import { dynamic, runtime, preferredRegion } from '@/app/config'

// Define the type for WorkoutBookmark for better type safety
interface WorkoutBookmark {
  workout_id: string;
  [key: string]: any; // For other properties
}

export { dynamic, runtime, preferredRegion }

/**
 * GET /api/bookmarks/all - Fetches all bookmarks for the current user
 */
export async function GET() {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('Unauthorized access attempt to all bookmarks API');
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    // Get all bookmarks for the user
    const bookmarks = await getUserBookmarks(user.id);
    
    // Extract workout IDs but preserve them as strings to avoid type issues
    const bookmarkedWorkoutIds = bookmarks.map(bookmark => {
      const workoutId = (bookmark as WorkoutBookmark).workout_id;
      return workoutId; // Keep original ID format
    });
    
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