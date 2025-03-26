import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { dynamic, runtime, preferredRegion } from '@/app/config'

export { dynamic, runtime, preferredRegion }

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
    
    // First, get all categories from the leaderboard_categories table
    const { data: categories, error: catError } = await supabase
      .from('leaderboard_categories')
      .select('*')
      .eq('is_active', true)
    
    if (catError) {
      return NextResponse.json({ 
        error: `Error fetching categories: ${catError.message}`,
        message: "Couldn't fetch leaderboard categories" 
      }, { status: 500 })
    }
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ 
        message: "No active leaderboard categories found. Please run the SQL setup first." 
      }, { status: 404 })
    }
    
    // Track stats for response
    const results = []
    
    // Process Longest Streak category first using the stored function
    const streakCategory = categories.find(cat => cat.sort_field === 'current_streak')
    if (streakCategory) {
      const { error: streakError } = await supabase.rpc('update_streak_leaderboard')
      
      results.push({
        category: streakCategory.name,
        status: streakError ? 'error' : 'success',
        message: streakError ? streakError.message : 'Updated successfully'
      })
    }
    
    // Process other categories
    for (const category of categories) {
      // Skip streak category as we've already processed it
      if (category.sort_field === 'current_streak') continue
      
      const result = await updateLeaderboardForCategory(supabase, category)
      results.push(result)
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
  try {
    // Using simpler SQL queries to avoid ORM syntax issues
    let query = ''
    let queryValues: any[] = []
    
    switch (category.sort_field) {
      case 'total_workouts':
        // Raw SQL query for total workouts leaderboard
        const { data: allTimeData, error: allTimeError } = await supabase.rpc('calculate_total_workouts_leaderboard', {
          input_category_id: category.id
        })
        
        if (allTimeError) {
          return {
            category: category.name,
            status: 'error',
            message: `Error calculating total workouts: ${allTimeError.message}`
          }
        }
        
        return {
          category: category.name,
          status: 'success',
          message: 'Updated successfully'
        }
        
      case 'weekly_workouts':
        // Use a stored procedure for weekly workouts
        const { data: weeklyData, error: weeklyError } = await supabase.rpc('calculate_weekly_workouts_leaderboard', {
          input_category_id: category.id
        })
        
        if (weeklyError) {
          return {
            category: category.name,
            status: 'error',
            message: `Error calculating weekly workouts: ${weeklyError.message}`
          }
        }
        
        return {
          category: category.name,
          status: 'success',
          message: 'Updated successfully'
        }
        
      case 'monthly_completion_rate':
        // Use a stored procedure for monthly workouts
        const { data: monthlyData, error: monthlyError } = await supabase.rpc('calculate_monthly_workouts_leaderboard', {
          input_category_id: category.id
        })
        
        if (monthlyError) {
          return {
            category: category.name,
            status: 'error',
            message: `Error calculating monthly workouts: ${monthlyError.message}`
          }
        }
        
        return {
          category: category.name,
          status: 'success',
          message: 'Updated successfully'
        }
        
      default:
        return {
          category: category.name,
          status: 'skipped',
          message: `Unknown sort field: ${category.sort_field}`
        }
    }
  } catch (error: any) {
    return {
      category: category.name || 'Unknown',
      status: 'error',
      message: error.message
    }
  }
} 