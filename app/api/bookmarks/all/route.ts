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
    
    // Extract workout IDs and convert to numbers for the frontend
    const bookmarkedWorkoutIds = bookmarks.map(bookmark => {
      const workoutId = (bookmark as WorkoutBookmark).workout_id;
      return typeof workoutId === 'string' ? parseInt(workoutId, 10) : workoutId;
    }).filter(id => !isNaN(id)); // Filter out any NaN values
    
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