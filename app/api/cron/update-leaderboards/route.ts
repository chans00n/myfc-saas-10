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
    
    // Define our categories directly since we're facing database issues
    const categories = [
      { name: 'Longest Streak', sort_field: 'current_streak' },
      { name: 'All-Time Workouts', sort_field: 'total_workouts' },
      { name: 'Weekly Champions', sort_field: 'weekly_workouts' },
      { name: 'Monthly Dedication', sort_field: 'monthly_completion_rate' }
    ]
    
    // Track stats for response
    const results = []
    
    // Process Longest Streak category first using direct SQL
    const { error: streakError } = await supabase.rpc('update_streak_leaderboard')
    
    results.push({
      category: 'Longest Streak',
      status: streakError ? 'error' : 'success',
      message: streakError ? streakError.message : 'Updated successfully'
    })
    
    // Process other categories
    for (const category of categories.slice(1)) {
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
    let entries = [];
    
    // Logic for different category types
    switch (category.sort_field) {
      case 'total_workouts':
        // Count completed workouts per user using direct SQL query
        const { data: totalWorkouts, error: totalError } = await supabase
          .from('workouts_completed')
          .select('user_id, count')
          .select(`
            user_id,
            count(*) as workout_count,
            users!workouts_completed_user_id_fkey (display_name, email)
          `)
          .group('user_id, users.display_name, users.email')
          .order('workout_count', { ascending: false })
          .limit(100)
        
        if (totalError) throw new Error(`Error counting workouts: ${totalError.message}`)
        
        if (totalWorkouts && totalWorkouts.length > 0) {
          // Clear existing entries
          await supabase
            .from('leaderboard_entries')
            .delete()
            .eq('category', 'All-Time Workouts')
            
          // Insert new entries
          const allTimeEntries = totalWorkouts.map((item: any, index: number) => ({
            user_id: item.user_id,
            username: item.users?.display_name || item.users?.email || 'Unknown User',
            rank: index + 1,
            score: parseInt(item.workout_count, 10),
            category: 'All-Time Workouts'
          }))
          
          const { error: insertError } = await supabase
            .from('leaderboard_entries')
            .insert(allTimeEntries)
            
          if (insertError) throw new Error(`Error inserting entries: ${insertError.message}`)
          
          return {
            category: 'All-Time Workouts',
            status: 'success',
            entries: allTimeEntries.length
          }
        } else {
          return {
            category: 'All-Time Workouts',
            status: 'skipped',
            message: 'No workout data found'
          }
        }
        break
        
      case 'weekly_workouts':
        // Get the start of the current week (Sunday)
        const now = new Date()
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        
        // Use raw SQL for this complex query since the ORM syntax is causing errors
        const { data: weeklyData, error: weeklyError } = await supabase
          .from('workouts_completed')
          .select(`
            user_id,
            count(*) as workout_count,
            users!workouts_completed_user_id_fkey (display_name, email)
          `)
          .gte('created_at', startOfWeek.toISOString())
          .group('user_id, users.display_name, users.email')
          .order('workout_count', { ascending: false })
          .limit(100)
        
        if (weeklyError) throw new Error(`Error counting weekly workouts: ${weeklyError.message}`)
        
        if (weeklyData && weeklyData.length > 0) {
          // Clear existing entries
          await supabase
            .from('leaderboard_entries')
            .delete()
            .eq('category', 'Weekly Champions')
            
          // Insert new entries
          const weeklyEntries = weeklyData.map((item: any, index: number) => ({
            user_id: item.user_id,
            username: item.users?.display_name || item.users?.email || 'Unknown User',
            rank: index + 1,
            score: parseInt(item.workout_count, 10),
            category: 'Weekly Champions'
          }))
          
          const { error: insertWeeklyError } = await supabase
            .from('leaderboard_entries')
            .insert(weeklyEntries)
            
          if (insertWeeklyError) throw new Error(`Error inserting weekly entries: ${insertWeeklyError.message}`)
          
          return {
            category: 'Weekly Champions',
            status: 'success',
            entries: weeklyEntries.length
          }
        } else {
          return {
            category: 'Weekly Champions',
            status: 'skipped',
            message: 'No weekly workout data found'
          }
        }
        break
        
      case 'monthly_completion_rate':
        // Get the start of the current month
        const currentDate = new Date()
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

        // Use raw SQL for this complex query
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('workouts_completed')
          .select(`
            user_id,
            count(*) as workout_count,
            users!workouts_completed_user_id_fkey (display_name, email)
          `)
          .gte('created_at', startOfMonth.toISOString())
          .group('user_id, users.display_name, users.email')
          .order('workout_count', { ascending: false })
          .limit(100)
        
        if (monthlyError) throw new Error(`Error counting monthly workouts: ${monthlyError.message}`)
        
        if (monthlyData && monthlyData.length > 0) {
          // Clear existing entries
          await supabase
            .from('leaderboard_entries')
            .delete()
            .eq('category', 'Monthly Dedication')
            
          // Insert new entries
          const monthlyEntries = monthlyData.map((item: any, index: number) => ({
            user_id: item.user_id,
            username: item.users?.display_name || item.users?.email || 'Unknown User',
            rank: index + 1,
            score: parseInt(item.workout_count, 10),
            category: 'Monthly Dedication'
          }))
          
          const { error: insertMonthlyError } = await supabase
            .from('leaderboard_entries')
            .insert(monthlyEntries)
            
          if (insertMonthlyError) throw new Error(`Error inserting monthly entries: ${insertMonthlyError.message}`)
          
          return {
            category: 'Monthly Dedication',
            status: 'success',
            entries: monthlyEntries.length
          }
        } else {
          return {
            category: 'Monthly Dedication',
            status: 'skipped',
            message: 'No monthly workout data found'
          }
        }
        break
    }
    
    return {
      category: category.name,
      status: 'error',
      message: 'Unknown category type'
    }
  } catch (error: any) {
    return {
      category: category.name || 'Unknown',
      status: 'error',
      message: error.message
    }
  }
} 