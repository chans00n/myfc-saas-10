import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { dynamic } from '@/app/config'

export { dynamic }

export const runtime = 'nodejs'
export const preferredRegion = ['iad1'] // US East (N. Virginia)

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Get all active leaderboard categories
    const { data: categories, error: categoriesError } = await supabase
      .from('leaderboard_categories')
      .select('id, name')
      .eq('is_active', true)
    
    if (categoriesError) {
      return NextResponse.json({ error: `Failed to fetch categories: ${categoriesError.message}` }, { status: 500 })
    }
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ error: 'No leaderboard categories found' }, { status: 404 })
    }
    
    // Generate some fake user IDs
    const userId = user.id
    const fakeUser1 = '00000000-0000-0000-0000-000000000001'
    const fakeUser2 = '00000000-0000-0000-0000-000000000002'
    
    // Clear existing entries for these users
    const { error: deleteError } = await supabase
      .from('leaderboard_entries')
      .delete()
      .in('user_id', [userId, fakeUser1, fakeUser2])
    
    const results: Record<string, any> = {}
    
    // Add entries for each category
    for (const category of categories) {
      // Define scores based on category
      let userScore, fake1Score, fake2Score
      
      switch (category.name) {
        case 'All-Time Workouts':
          userScore = 42
          fake1Score = 38
          fake2Score = 35
          break
        case 'Longest Streak':
          userScore = 21
          fake1Score = 18
          fake2Score = 15
          break
        case 'Weekly Champions':
          userScore = 7
          fake1Score = 6
          fake2Score = 5
          break
        case 'Monthly Dedication':
          userScore = 95
          fake1Score = 90
          fake2Score = 85
          break
        default:
          userScore = 50
          fake1Score = 45
          fake2Score = 40
      }
      
      const entries = [
        {
          category_id: category.id,
          user_id: userId,
          rank: 1,
          score: userScore,
          last_updated: new Date().toISOString()
        },
        {
          category_id: category.id,
          user_id: fakeUser1,
          rank: 2,
          score: fake1Score,
          last_updated: new Date().toISOString()
        },
        {
          category_id: category.id,
          user_id: fakeUser2,
          rank: 3,
          score: fake2Score,
          last_updated: new Date().toISOString()
        }
      ]
      
      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(entries)
      
      results[category.name] = {
        success: !insertError,
        error: insertError ? insertError.message : null
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Leaderboard data populated successfully',
      results
    })
    
  } catch (error: any) {
    console.error('Error populating leaderboard:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 