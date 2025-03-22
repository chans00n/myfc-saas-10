import { createClient } from './server';
import { 
  WorkoutComment, 
  CommentLike, 
  LeaderboardCategory,
  LeaderboardEntry 
} from '@/types/database';

// =====================
// COMMENTS FUNCTIONS
// =====================

/**
 * Get comments for a specific workout
 */
export async function getWorkoutComments(workoutId: string, page = 1, limit = 10): Promise<{
  data: WorkoutComment[];
  count: number;
}> {
  try {
    const supabase = createClient();
    const offset = (page - 1) * limit;
    
    // Get comments with user information
    const { data, error, count } = await supabase
      .from('workout_comments')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        )
      `, { count: 'exact' })
      .eq('workout_id', workoutId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching workout comments:', error);
      return { data: [], count: 0 };
    }
    
    return { 
      data: data as WorkoutComment[], 
      count: count || 0 
    };
  } catch (err) {
    console.error('Unexpected error in getWorkoutComments:', err);
    return { data: [], count: 0 };
  }
}

/**
 * Add a new comment to a workout
 */
export async function addWorkoutComment(
  workoutId: string, 
  userId: string, 
  content: string
): Promise<WorkoutComment | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('workout_comments')
      .insert({
        workout_id: workoutId,
        user_id: userId,
        content
      })
      .select('*')
      .single();
    
    if (error) {
      console.error('Error adding workout comment:', error);
      return null;
    }
    
    return data as WorkoutComment;
  } catch (err) {
    console.error('Unexpected error in addWorkoutComment:', err);
    return null;
  }
}

/**
 * Update an existing comment
 */
export async function updateWorkoutComment(
  commentId: string,
  userId: string,
  content: string
): Promise<WorkoutComment | null> {
  try {
    const supabase = createClient();
    
    // Verify the user owns this comment first
    const { data: existingComment, error: fetchError } = await supabase
      .from('workout_comments')
      .select('user_id')
      .eq('id', commentId)
      .single();
    
    if (fetchError || !existingComment || existingComment.user_id !== userId) {
      console.error('Error updating comment: User does not own this comment');
      return null;
    }
    
    const { data, error } = await supabase
      .from('workout_comments')
      .update({
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating workout comment:', error);
      return null;
    }
    
    return data as WorkoutComment;
  } catch (err) {
    console.error('Unexpected error in updateWorkoutComment:', err);
    return null;
  }
}

/**
 * Delete a comment
 */
export async function deleteWorkoutComment(
  commentId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    // Only the comment owner can delete their comment
    const { error } = await supabase
      .from('workout_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting workout comment:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in deleteWorkoutComment:', err);
    return false;
  }
}

/**
 * Like or unlike a comment
 */
export async function toggleCommentLike(
  commentId: string,
  userId: string
): Promise<{ liked: boolean; likesCount: number }> {
  try {
    const supabase = createClient();
    
    // Check if the user already liked this comment
    const { data: existingLike, error: fetchError } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();
    
    let liked = false;
    
    if (!fetchError && existingLike) {
      // User already liked, so unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existingLike.id);
      
      if (deleteError) {
        console.error('Error unliking comment:', deleteError);
        throw deleteError;
      }
    } else {
      // User didn't like yet, so add like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        });
      
      if (insertError) {
        console.error('Error liking comment:', insertError);
        throw insertError;
      }
      
      liked = true;
    }
    
    // Get the updated likes count
    const { data: comment, error: commentError } = await supabase
      .from('workout_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();
    
    if (commentError || !comment) {
      console.error('Error getting updated likes count:', commentError);
      throw commentError;
    }
    
    return {
      liked,
      likesCount: comment.likes_count
    };
  } catch (err) {
    console.error('Unexpected error in toggleCommentLike:', err);
    throw err;
  }
}

/**
 * Report an inappropriate comment
 */
export async function reportComment(
  commentId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('comment_reports')
      .insert({
        comment_id: commentId,
        reporter_user_id: userId,
        reason
      });
    
    if (error) {
      console.error('Error reporting comment:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Unexpected error in reportComment:', err);
    return false;
  }
}

// =====================
// LEADERBOARD FUNCTIONS
// =====================

/**
 * Get all active leaderboard categories
 */
export async function getLeaderboardCategories(): Promise<LeaderboardCategory[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('leaderboard_categories')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching leaderboard categories:', error);
      return [];
    }
    
    return data as LeaderboardCategory[];
  } catch (err) {
    console.error('Unexpected error in getLeaderboardCategories:', err);
    return [];
  }
}

/**
 * Get leaderboard entries for a specific category
 */
export async function getLeaderboardEntries(
  categoryId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        user:user_id (
          id,
          name,
          email
        )
      `)
      .eq('category_id', categoryId)
      .order('rank', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard entries:', error);
      return [];
    }
    
    return data as LeaderboardEntry[];
  } catch (err) {
    console.error('Unexpected error in getLeaderboardEntries:', err);
    return [];
  }
}

/**
 * Get a user's rank in a specific leaderboard category
 */
export async function getUserLeaderboardRank(
  categoryId: string,
  userId: string
): Promise<{ rank: number; score: number } | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('rank, score')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no entry found for this user, they aren't ranked yet
      if (error.code === 'PGRST116') {
        return null;
      }
      
      console.error('Error fetching user leaderboard rank:', error);
      return null;
    }
    
    return {
      rank: data.rank,
      score: data.score
    };
  } catch (err) {
    console.error('Unexpected error in getUserLeaderboardRank:', err);
    return null;
  }
} 