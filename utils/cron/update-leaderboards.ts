'use server'

import { createClient } from '@/utils/supabase/server';

/**
 * Updates leaderboard entries based on user activity data
 * This script can be run as a scheduled task (e.g., with Vercel Cron or similar)
 */
export async function updateLeaderboards() {
  const supabase = createClient();
  
  try {
    console.log('Starting leaderboard update...');
    
    // Get all active leaderboard categories
    const { data: categories, error: catError } = await supabase
      .from('leaderboard_categories')
      .select('*')
      .eq('is_active', true);
    
    if (catError) {
      throw new Error(`Error fetching leaderboard categories: ${catError.message}`);
    }
    
    if (!categories || !categories.length) {
      console.log('No active leaderboard categories found.');
      return;
    }
    
    // Process each category
    for (const category of categories) {
      console.log(`Processing leaderboard category: ${category.name}`);
      
      // Based on category type, fetch and rank the data
      if (category.sort_field === 'current_streak') {
        await updateStreakLeaderboard(supabase, category.id);
      } else if (category.sort_field === 'total_workouts') {
        await updateTotalWorkoutsLeaderboard(supabase, category.id);
      } else if (category.sort_field === 'weekly_workouts') {
        await updateWeeklyWorkoutsLeaderboard(supabase, category.id);
      } else if (category.sort_field === 'monthly_completion_rate') {
        await updateMonthlyCompletionRateLeaderboard(supabase, category.id);
      }
    }
    
    console.log('Leaderboard update completed successfully.');
  } catch (error) {
    console.error('Error updating leaderboards:', error);
    throw error;
  }
}

/**
 * Updates the longest streak leaderboard
 */
async function updateStreakLeaderboard(supabase: any, categoryId: string) {
  try {
    // Get users with their streaks, ordered by current streak (descending)
    const { data: streaks, error } = await supabase
      .from('user_streaks')
      .select('user_id, current_streak')
      .order('current_streak', { ascending: false })
      .limit(100); // Top 100 users
    
    if (error) {
      throw new Error(`Error fetching streak data: ${error.message}`);
    }
    
    if (!streaks || !streaks.length) {
      console.log('No streak data found.');
      return;
    }
    
    // Clear existing entries for this category
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('category_id', categoryId);
    
    // Insert new entries with ranks
    const entries = streaks.map((streak: any, index: number) => ({
      category_id: categoryId,
      user_id: streak.user_id,
      rank: index + 1,
      score: streak.current_streak,
      last_updated: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('leaderboard_entries')
      .insert(entries);
    
    if (insertError) {
      throw new Error(`Error inserting streak leaderboard entries: ${insertError.message}`);
    }
    
    console.log(`Updated streak leaderboard with ${entries.length} entries.`);
  } catch (error) {
    console.error('Error updating streak leaderboard:', error);
    throw error;
  }
}

/**
 * Updates the total workouts completed leaderboard
 */
async function updateTotalWorkoutsLeaderboard(supabase: any, categoryId: string) {
  try {
    // Count completed workouts per user
    const { data, error } = await supabase
      .rpc('count_completed_workouts_per_user')
      .select('user_id, count');
    
    if (error) {
      // If the function doesn't exist, use a direct query
      const { data: directData, error: directError } = await supabase
        .from('user_workouts')
        .select('user_id, count(*)')
        .eq('completed', true)
        .group('user_id')
        .order('count', { ascending: false })
        .limit(100);
      
      if (directError) {
        throw new Error(`Error counting workouts: ${directError.message}`);
      }
      
      // Clear existing entries for this category
      await supabase
        .from('leaderboard_entries')
        .delete()
        .eq('category_id', categoryId);
      
      // Insert new entries with ranks
      const entries = directData.map((item: any, index: number) => ({
        category_id: categoryId,
        user_id: item.user_id,
        rank: index + 1,
        score: parseInt(item.count, 10),
        last_updated: new Date().toISOString()
      }));
      
      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(entries);
      
      if (insertError) {
        throw new Error(`Error inserting total workouts leaderboard entries: ${insertError.message}`);
      }
      
      console.log(`Updated total workouts leaderboard with ${entries.length} entries.`);
      return;
    }
    
    // If the RPC function succeeded, use that data
    // Clear existing entries for this category
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('category_id', categoryId);
    
    // Insert new entries with ranks
    const entries = data.map((item: any, index: number) => ({
      category_id: categoryId,
      user_id: item.user_id,
      rank: index + 1,
      score: item.count,
      last_updated: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('leaderboard_entries')
      .insert(entries);
    
    if (insertError) {
      throw new Error(`Error inserting total workouts leaderboard entries: ${insertError.message}`);
    }
    
    console.log(`Updated total workouts leaderboard with ${entries.length} entries.`);
  } catch (error) {
    console.error('Error updating total workouts leaderboard:', error);
    throw error;
  }
}

/**
 * Updates the weekly workouts completed leaderboard
 */
async function updateWeeklyWorkoutsLeaderboard(supabase: any, categoryId: string) {
  try {
    // Get the start of the current week (Sunday)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Go back to the start of the week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Count completed workouts per user for the current week
    const { data, error } = await supabase
      .from('user_workouts')
      .select('user_id, count(*)')
      .eq('completed', true)
      .gte('completed_at', startOfWeek.toISOString())
      .group('user_id')
      .order('count', { ascending: false })
      .limit(100);
    
    if (error) {
      throw new Error(`Error counting weekly workouts: ${error.message}`);
    }
    
    // Clear existing entries for this category
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('category_id', categoryId);
    
    // Insert new entries with ranks
    const entries = data.map((item: any, index: number) => ({
      category_id: categoryId,
      user_id: item.user_id,
      rank: index + 1,
      score: parseInt(item.count, 10),
      last_updated: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('leaderboard_entries')
      .insert(entries);
    
    if (insertError) {
      throw new Error(`Error inserting weekly workouts leaderboard entries: ${insertError.message}`);
    }
    
    console.log(`Updated weekly workouts leaderboard with ${entries.length} entries.`);
  } catch (error) {
    console.error('Error updating weekly workouts leaderboard:', error);
    throw error;
  }
}

/**
 * Updates the monthly completion rate leaderboard
 */
async function updateMonthlyCompletionRateLeaderboard(supabase: any, categoryId: string) {
  try {
    // Get the start of the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // This is a more complex metric that requires calculating the ratio of 
    // completed workouts to total assigned workouts in the month
    // We'll use a simplified version that just tracks completed workouts for now
    
    // Count completed workouts per user for the current month
    const { data, error } = await supabase
      .from('user_workouts')
      .select('user_id, count(*)')
      .eq('completed', true)
      .gte('completed_at', startOfMonth.toISOString())
      .group('user_id')
      .order('count', { ascending: false })
      .limit(100);
    
    if (error) {
      throw new Error(`Error counting monthly workouts: ${error.message}`);
    }
    
    // Clear existing entries for this category
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('category_id', categoryId);
    
    // Insert new entries with ranks
    const entries = data.map((item: any, index: number) => ({
      category_id: categoryId,
      user_id: item.user_id,
      rank: index + 1,
      score: parseInt(item.count, 10),
      last_updated: new Date().toISOString()
    }));
    
    const { error: insertError } = await supabase
      .from('leaderboard_entries')
      .insert(entries);
    
    if (insertError) {
      throw new Error(`Error inserting monthly completion rate leaderboard entries: ${insertError.message}`);
    }
    
    console.log(`Updated monthly completion rate leaderboard with ${entries.length} entries.`);
  } catch (error) {
    console.error('Error updating monthly completion rate leaderboard:', error);
    throw error;
  }
} 