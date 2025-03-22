import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Secure the endpoint with an admin check
async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('users_table')
    .select('email')
    .eq('id', userId)
    .single()
  
  // Define admin emails - in production this should be a more secure approach
  const adminEmails = ['admin@myfc.app']
  return data && adminEmails.includes(data.email)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get current user - restrict to admins
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Only allow admin users to trigger this endpoint
    const isAdminUser = await isAdmin(supabase, user.id)
    if (!isAdminUser) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }
    
    // Get all active leaderboard categories
    const { data: categories, error: catError } = await supabase
      .from('leaderboard_categories')
      .select('*')
      .eq('is_active', true)
    
    if (catError) {
      return NextResponse.json({ error: `Error fetching categories: ${catError.message}` }, { status: 500 })
    }
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No active leaderboard categories found' }, { status: 404 })
    }
    
    // Track stats for response
    const results = []
    
    // Process each category
    for (const category of categories) {
      const result = await updateLeaderboardForCategory(supabase, category)
      results.push(result)
    }
    
    // Revalidate the leaderboards page to show updated data
    revalidatePath('/leaderboards')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leaderboards updated successfully',
      results
    })
  } catch (error: any) {
    console.error('Error updating leaderboards:', error)
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
      case 'current_streak':
        // Get users with their streaks, ordered by current streak (descending)
        const { data: streaks, error: streakError } = await supabase
          .from('user_streaks')
          .select('user_id, current_streak')
          .order('current_streak', { ascending: false })
          .limit(100)
        
        if (streakError) throw new Error(`Error fetching streak data: ${streakError.message}`)
        
        if (streaks && streaks.length > 0) {
          entries = streaks.map((streak: any, index: number) => ({
            category_id: categoryId,
            user_id: streak.user_id,
            rank: index + 1,
            score: streak.current_streak,
            last_updated: new Date().toISOString()
          }))
        }
        break
        
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
        
      default:
        throw new Error(`Unknown sort field: ${sortField}`)
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