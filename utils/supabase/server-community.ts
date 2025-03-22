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
 * Get comments for a specific workout - SERVER VERSION
 */
export async function getServerWorkoutComments(workoutId: string, page: number = 1, limit: number = 10) {
  const supabase = createClient();
  const startIndex = (page - 1) * limit;
  
  try {
    const { data: comments, error, count } = await supabase
      .from('workout_comments')
      .select(`
        *,
        user:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('workout_id', workoutId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false })
      .range(startIndex, startIndex + limit - 1);
    
    if (error) {
      console.error('Error fetching workout comments:', error);
      return null;
    }

    // Check if the current user has liked each comment
    const { data: user } = await supabase.auth.getUser();
    
    if (user?.user) {
      // Get all the likes for this user for the comments we've loaded
      const { data: userLikes } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', user.user.id)
        .in('comment_id', comments.map(c => c.id));
        
      // Add the user_has_liked property to each comment
      const commentsWithLikeStatus = comments.map(comment => ({
        ...comment,
        user_has_liked: userLikes?.some(like => like.comment_id === comment.id) || false
      }));
      
      return { data: commentsWithLikeStatus, count: count || 0 };
    }
    
    return { data: comments, count: count || 0 };
  } catch (error) {
    console.error('Error in getWorkoutComments:', error);
    return { data: [], count: 0 };
  }
}

/**
 * Add a new comment to a workout - SERVER VERSION
 */
export async function addServerWorkoutComment(workoutId: string, userId: string, content: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('workout_comments')
      .insert({
        workout_id: workoutId,
        user_id: userId,
        content,
      })
      .select(`
        *,
        user:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .single();
    
    if (error) {
      console.error('Error adding workout comment:', error);
      return null;
    }
    
    return { ...data, user_has_liked: false };
  } catch (error) {
    console.error('Error in addWorkoutComment:', error);
    return null;
  }
}

/**
 * Update an existing comment - SERVER VERSION
 */
export async function updateServerWorkoutComment(commentId: string, userId: string, content: string) {
  const supabase = createClient();
  
  try {
    // First check if the user owns this comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('workout_comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !existingComment) {
      return null; // User doesn't own this comment
    }
    
    // Update the comment
    const { data, error } = await supabase
      .from('workout_comments')
      .update({ 
        content,
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating workout comment:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in updateWorkoutComment:', error);
    return null;
  }
}

/**
 * Delete a comment - SERVER VERSION
 */
export async function deleteServerWorkoutComment(commentId: string, userId: string) {
  const supabase = createClient();
  
  try {
    // First check if the user owns this comment
    const { data: existingComment, error: fetchError } = await supabase
      .from('workout_comments')
      .select('*')
      .eq('id', commentId)
      .eq('user_id', userId)
      .single();
    
    if (fetchError || !existingComment) {
      return false; // User doesn't own this comment
    }
    
    // Delete the comment
    const { error } = await supabase
      .from('workout_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) {
      console.error('Error deleting workout comment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteWorkoutComment:', error);
    return false;
  }
}

/**
 * Like or unlike a comment - SERVER VERSION
 */
export async function toggleServerCommentLike(commentId: string, userId: string) {
  const supabase = createClient();
  
  try {
    // Check if the user has already liked this comment
    const { data: existingLike, error: fetchError } = await supabase
      .from('comment_likes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking if comment is liked:', fetchError);
      return null;
    }
    
    let liked = false;
    
    if (existingLike) {
      // Unlike the comment
      const { error: unlikeError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', userId);
      
      if (unlikeError) {
        console.error('Error unliking comment:', unlikeError);
        return null;
      }
    } else {
      // Like the comment
      const { error: likeError } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: commentId,
          user_id: userId
        });
      
      if (likeError) {
        console.error('Error liking comment:', likeError);
        return null;
      }
      
      liked = true;
    }
    
    // Get the updated likes count
    const { data: updatedComment, error: countError } = await supabase
      .from('workout_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();
    
    if (countError) {
      console.error('Error getting updated likes count:', countError);
      return null;
    }
    
    return {
      liked,
      likesCount: updatedComment.likes_count
    };
  } catch (error) {
    console.error('Error in toggleCommentLike:', error);
    return null;
  }
}

/**
 * Report an inappropriate comment - SERVER VERSION
 */
export async function reportServerComment(commentId: string, userId: string, reason: string) {
  const supabase = createClient();
  
  try {
    // Check if this user has already reported this comment
    const { data: existingReport, error: fetchError } = await supabase
      .from('comment_reports')
      .select('*')
      .eq('comment_id', commentId)
      .eq('reporter_user_id', userId)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking for existing report:', fetchError);
      return false;
    }
    
    if (existingReport) {
      return true; // User has already reported this comment
    }
    
    // Create the report
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
  } catch (error) {
    console.error('Error in reportComment:', error);
    return false;
  }
}

// =====================
// LEADERBOARD FUNCTIONS
// =====================

/**
 * Get all active leaderboard categories - SERVER VERSION
 */
export async function getServerLeaderboardCategories() {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('leaderboard_categories')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) {
      console.error('Error fetching leaderboard categories:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getLeaderboardCategories:', error);
    return null;
  }
}

/**
 * Get leaderboard entries for a specific category - SERVER VERSION
 */
export async function getServerLeaderboardEntries(categoryId: string, limit: number = 100) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        user:user_id (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('category_id', categoryId)
      .order('rank')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching leaderboard entries:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getLeaderboardEntries:', error);
    return null;
  }
}

/**
 * Get a user's rank in a specific leaderboard category - SERVER VERSION
 */
export async function getServerUserLeaderboardRank(categoryId: string, userId: string) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('rank, score')
      .eq('category_id', categoryId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user leaderboard rank:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserLeaderboardRank:', error);
    return null;
  }
} 