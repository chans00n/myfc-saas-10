import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// This route can be scheduled with a cron job service like Vercel Cron
// Example cron schedule: 0 0 * * * (daily at midnight)
export async function GET(request: Request) {
  try {
    // Verify request includes the required secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const supabase = createClient()
    
    // Get all active leaderboard categories
    const { data: categories, error: catError } = await supabase
      .from('leaderboard_categories')
      .select('*')
      .eq('is_active', true)
    
    if (catError) {
      throw new Error(`Error fetching categories: ${catError.message}`)
    }
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ message: 'No active leaderboard categories found' })
    }
    
    // Track stats for response
    const results = []
    
    // Process each category
    for (const category of categories) {
      // Call the database function to update leaderboards
      if (category.sort_field === 'current_streak') {
        const { data, error } = await supabase.rpc('update_streak_leaderboard')
        
        results.push({
          category: category.name,
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Updated successfully'
        })
      } else {
        // For other leaderboard types, call the appropriate function or update directly
        const result = await updateLeaderboardForCategory(supabase, category)
        results.push(result)
      }
    }
    
    // Revalidate the leaderboards page
    revalidatePath('/leaderboards')
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled leaderboard update completed',
      updated_at: new Date().toISOString(),
      results
    })
  } catch (error: any) {
    console.error('Error in leaderboard cron job:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function updateLeaderboardForCategory(supabase: any, category: any) {
  const categoryId = category.id
  const sortField = category.sort_field
  
  try {
    let query;
    let entries = [];
    
    // Logic for different category types
    switch (sortField) {
      case 'total_workouts':
        // Count completed workouts per user
        const { data: totalWorkouts, error: totalError } = await supabase
          .from('user_workouts')
          .select('user_id, count(*)')
          .eq('completed', true)
          .group('user_id')
          .order('count', { ascending: false })
          .limit(100)
        
        if (totalError) throw new Error(`Error counting workouts: ${totalError.message}`)
        
        if (totalWorkouts && totalWorkouts.length > 0) {
          entries = totalWorkouts.map((item: any, index: number) => ({
            category_id: categoryId,
            user_id: item.user_id,
            rank: index + 1,
            score: parseInt(item.count, 10),
            last_updated: new Date().toISOString()
          }))
        }
        break
        
      case 'weekly_workouts':
        // Get the start of the current week (Sunday)
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        
        // Count completed workouts per user for the current week
        const { data: weeklyWorkouts, error: weeklyError } = await supabase
          .from('user_workouts')
          .select('user_id, count(*)')
          .eq('completed', true)
          .gte('completed_at', startOfWeek.toISOString())
          .group('user_id')
          .order('count', { ascending: false })
          .limit(100)
        
        if (weeklyError) throw new Error(`Error counting weekly workouts: ${weeklyError.message}`)
        
        if (weeklyWorkouts && weeklyWorkouts.length > 0) {
          entries = weeklyWorkouts.map((item: any, index: number) => ({
            category_id: categoryId,
            user_id: item.user_id,
            rank: index + 1,
            score: parseInt(item.count, 10),
            last_updated: new Date().toISOString()
          }))
        }
        break
        
      case 'monthly_completion_rate':
        // Get the start of the current month
        const currentDate = new Date()
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        
        // Count completed workouts per user for the current month
        const { data: monthlyWorkouts, error: monthlyError } = await supabase
          .from('user_workouts')
          .select('user_id, count(*)')
          .eq('completed', true)
          .gte('completed_at', startOfMonth.toISOString())
          .group('user_id')
          .order('count', { ascending: false })
          .limit(100)
        
        if (monthlyError) throw new Error(`Error counting monthly workouts: ${monthlyError.message}`)
        
        if (monthlyWorkouts && monthlyWorkouts.length > 0) {
          entries = monthlyWorkouts.map((item: any, index: number) => ({
            category_id: categoryId,
            user_id: item.user_id,
            rank: index + 1,
            score: parseInt(item.count, 10),
            last_updated: new Date().toISOString()
          }))
        }
        break
    }
    
    // Skip update if no entries were found
    if (entries.length === 0) {
      return {
        category: category.name,
        status: 'skipped',
        message: 'No data found for this category'
      }
    }
    
    // Clear existing entries for this category
    await supabase
      .from('leaderboard_entries')
      .delete()
      .eq('category_id', categoryId)
    
    // Insert new entries
    const { error: insertError } = await supabase
      .from('leaderboard_entries')
      .insert(entries)
    
    if (insertError) {
      throw new Error(`Error inserting leaderboard entries: ${insertError.message}`)
    }
    
    return {
      category: category.name,
      status: 'success',
      entries: entries.length
    }
  } catch (error: any) {
    return {
      category: category.name,
      status: 'error',
      message: error.message
    }
  }
} 