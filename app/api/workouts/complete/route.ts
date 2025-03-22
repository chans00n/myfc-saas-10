import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { workoutId } = await request.json()
    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 })
    }
    
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // First, check if the user has access to this workout
    const { data: workout, error: workoutError } = await supabase
      .from('user_workouts')
      .select('*')
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .single()
    
    if (workoutError || !workout) {
      return NextResponse.json({ 
        error: workoutError?.message || 'Workout not found',
        code: 'workout_not_found'
      }, { status: 404 })
    }
    
    // If already completed, just return success
    if (workout.completed) {
      return NextResponse.json({ 
        success: true, 
        message: 'Workout already marked as completed',
        workout
      })
    }
    
    // Mark the workout as completed
    const now = new Date().toISOString()
    const { data: updatedWorkout, error: updateError } = await supabase
      .from('user_workouts')
      .update({ 
        completed: true,
        completed_at: now
      })
      .eq('id', workoutId)
      .eq('user_id', user.id)
      .select('*')
      .single()
    
    if (updateError) {
      return NextResponse.json({ 
        error: updateError.message,
        code: 'update_failed'
      }, { status: 500 })
    }
    
    // Trigger a refresh of the leaderboards to reflect the new completion
    // This calls a database function to recalculate user stats and update leaderboards
    await supabase.rpc('refresh_leaderboards')
    
    // Revalidate relevant pages
    revalidatePath('/workouts')
    revalidatePath('/leaderboards')
    
    return NextResponse.json({
      success: true,
      message: 'Workout marked as completed',
      workout: updatedWorkout
    })
  } catch (error: any) {
    console.error('Error completing workout:', error)
    return NextResponse.json({ 
      error: error.message,
      code: 'unknown_error'
    }, { status: 500 })
  }
} 