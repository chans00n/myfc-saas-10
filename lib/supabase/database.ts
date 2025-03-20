import { createClient } from './server';
import type { User, Workout, FocusArea, Movement, UserWorkout, DailyWorkout, Achievement, UserAchievement, UserStreak } from '../../types/database';

// Helper function to get the authenticated user from the session
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }
  
  // Get the user record from the users_table
  const { data, error } = await supabase
    .from('users_table')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  if (error || !data) {
    console.error('Error fetching user data:', error);
    return null;
  }
  
  return data as User;
}

// Get today's workout
export async function getTodaysWorkout(): Promise<Workout | null> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get the workout assigned for today
  const { data, error } = await supabase
    .from('daily_workouts')
    .select('workout_id, workouts(*)')
    .eq('schedule_date', today)
    .eq('is_active', true)
    .single();
  
  if (error || !data) {
    console.error('Error fetching today\'s workout:', error);
    return null;
  }
  
  return data.workouts as unknown as Workout;
}

// Get user's workout history
export async function getUserWorkoutHistory(userId: string): Promise<UserWorkout[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_workouts')
    .select('*, workouts(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching user workout history:', error);
    return [];
  }
  
  return data as UserWorkout[];
}

// Get user's streak information
export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user streak:', error);
    return null;
  }
  
  return data as UserStreak;
}

// Get user's achievements
export async function getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*, achievements(*)')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
  
  return data as (UserAchievement & { achievement: Achievement })[];
}

// Get a specific workout by ID
export async function getWorkoutById(workoutId: string): Promise<Workout | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();
  
  if (error) {
    console.error('Error fetching workout:', error);
    return null;
  }
  
  return data as Workout;
}

// Mark a workout as started
export async function startWorkout(userId: string, workoutId: string): Promise<UserWorkout | null> {
  const supabase = createClient();
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('user_workouts')
    .insert({
      user_id: userId,
      workout_id: workoutId,
      started_at: now,
      completed: false,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error starting workout:', error);
    return null;
  }
  
  return data as UserWorkout;
}

// Mark a workout as completed
export async function completeWorkout(userId: string, workoutId: string, durationTaken: number): Promise<UserWorkout | null> {
  const supabase = createClient();
  const now = new Date().toISOString();
  
  // Update the existing record or create a new one
  const { data, error } = await supabase
    .from('user_workouts')
    .upsert({
      user_id: userId,
      workout_id: workoutId,
      completed: true,
      completed_at: now,
      duration_taken: durationTaken,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error completing workout:', error);
    return null;
  }
  
  // Update user streak
  await updateUserStreak(userId);
  
  return data as UserWorkout;
}

// Helper to update user streak after completing a workout
async function updateUserStreak(userId: string): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get current streak data
  const { data: streakData } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (streakData) {
    // Calculate if this is a consecutive day
    const lastWorkoutDate = streakData.last_workout_date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = streakData.current_streak;
    
    // If last workout was yesterday, increment streak
    if (lastWorkoutDate === yesterdayStr || lastWorkoutDate === today) {
      newStreak += 1;
    } else if (lastWorkoutDate !== today) {
      // If not consecutive, reset streak to 1
      newStreak = 1;
    }
    
    // Update streak
    await supabase
      .from('user_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streakData.longest_streak),
        last_workout_date: today,
      })
      .eq('user_id', userId);
  } else {
    // Create new streak record
    await supabase
      .from('user_streaks')
      .insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_workout_date: today,
      });
  }
} 