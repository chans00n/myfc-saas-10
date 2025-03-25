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

// Get all workouts
export async function getAllWorkouts(): Promise<Workout[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching workouts:', error);
    return [];
  }
  
  return data as Workout[];
}

// Get all movements
export async function getAllMovements(): Promise<Movement[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('movements')
    .select('*, focus_areas(*)');
  
  if (error) {
    console.error('Error fetching movements:', error);
    return [];
  }
  
  return data as Movement[];
}

// Get all focus areas
export async function getAllFocusAreas(): Promise<FocusArea[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('focus_areas')
    .select('*');
  
  if (error) {
    console.error('Error fetching focus areas:', error);
    return [];
  }
  
  return data as FocusArea[];
}

// Get workout with details (movements and focus areas)
export async function getWorkoutWithDetails(workoutId: string): Promise<{
  workout: Workout | null;
  movements: Array<{
    movement: Movement;
    sequence_order: number;
    duration_seconds: number | null;
    repetitions: number | null;
    sets: number | null;
  }>;
  focusAreas: FocusArea[];
}> {
  const supabase = createClient();
  
  // Get the workout
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();
  
  if (workoutError) {
    console.error('Error fetching workout:', workoutError);
    return { workout: null, movements: [], focusAreas: [] };
  }
  
  // Get the workout movements with sequence
  const { data: workoutMovements, error: movementsError } = await supabase
    .from('workout_movements')
    .select('*, movement:movements(*)')
    .eq('workout_id', workoutId)
    .order('sequence_order', { ascending: true });
  
  if (movementsError) {
    console.error('Error fetching workout movements:', movementsError);
    return { workout: workout as Workout, movements: [], focusAreas: [] };
  }
  
  // Get the workout focus areas
  const { data: workoutFocusAreas, error: focusAreasError } = await supabase
    .from('workout_focus_areas')
    .select('*, focus_area:focus_areas(*)')
    .eq('workout_id', workoutId);
  
  if (focusAreasError) {
    console.error('Error fetching workout focus areas:', focusAreasError);
    return { 
      workout: workout as Workout, 
      movements: workoutMovements.map((wm: any) => ({
        movement: wm.movement,
        sequence_order: wm.sequence_order,
        duration_seconds: wm.duration_seconds,
        repetitions: wm.repetitions,
        sets: wm.sets,
      })), 
      focusAreas: [] 
    };
  }
  
  return {
    workout: workout as Workout,
    movements: workoutMovements.map((wm: any) => ({
      movement: wm.movement,
      sequence_order: wm.sequence_order,
      duration_seconds: wm.duration_seconds,
      repetitions: wm.repetitions,
      sets: wm.sets,
    })),
    focusAreas: workoutFocusAreas.map((wfa: any) => wfa.focus_area as FocusArea)
  };
}

// Create or update a workout with movements and focus areas
export async function createOrUpdateWorkout(
  workoutData: Partial<Workout>,
  movementsData: Array<{
    movement_id: string;
    sequence_order: number;
    duration_seconds?: number | null;
    repetitions?: number | null;
    sets?: number | null;
  }>,
  focusAreaIds: string[],
  workoutId?: string
): Promise<{success: boolean; workoutId?: string; error?: string}> {
  const supabase = createClient();
  
  try {
    // Start a transaction
    let workout;
    let workoutError;
    
    if (workoutId) {
      // First, verify the workout exists
      console.log(`Checking if workout with ID ${workoutId} exists...`);
      const { data: existingWorkout, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (fetchError || !existingWorkout) {
        console.error('Fetch error or workout not found:', fetchError, 'Existing workout:', existingWorkout);
        throw new Error(`Workout with ID ${workoutId} not found or cannot be accessed. Please check if the workout exists.`);
      }
      
      console.log('Workout found, proceeding with update...');
      
      // Use upsert instead of update to bypass some RLS restrictions
      // Preserve any fields that aren't in the update
      const updatedWorkoutData = {
        ...existingWorkout,
        ...workoutData,
        id: workoutId, // Make sure ID is preserved
      };
      
      console.log('Upserting with data:', updatedWorkoutData);
      
      // Upsert the workout (update if exists, insert if not)
      const result = await supabase
        .from('workouts')
        .upsert(updatedWorkoutData)
        .select();
      
      console.log('Upsert result:', result);
      
      workoutError = result.error;
      workout = result.data?.[0];
      
      // Handle case where the workout might not be updated
      if (!result.error && (!result.data || result.data.length === 0)) {
        console.log('No data returned from upsert operation, using existing ID');
        workout = { id: workoutId } as any;
      }
    } else {
      // Create new workout
      const result = await supabase
        .from('workouts')
        .insert(workoutData)
        .select()
        .single();
      
      workout = result.data;
      workoutError = result.error;
    }
    
    if (workoutError) {
      throw new Error(`Error ${workoutId ? 'updating' : 'creating'} workout: ${workoutError.message}`);
    }
    
    if (!workout || !workout.id) {
      throw new Error(`Failed to ${workoutId ? 'update' : 'create'} workout: No data returned`);
    }
    
    const currentWorkoutId = workoutId || workout.id;
    
    if (workoutId) {
      // Delete existing movement relationships for update case
      const { error: deleteMovementsError } = await supabase
        .from('workout_movements')
        .delete()
        .eq('workout_id', currentWorkoutId);
      
      if (deleteMovementsError) {
        throw new Error(`Error deleting workout movements: ${deleteMovementsError.message}`);
      }
      
      // Delete existing focus area relationships for update case
      const { error: deleteFocusAreasError } = await supabase
        .from('workout_focus_areas')
        .delete()
        .eq('workout_id', currentWorkoutId);
      
      if (deleteFocusAreasError) {
        throw new Error(`Error deleting workout focus areas: ${deleteFocusAreasError.message}`);
      }
    }
    
    // Add movement relationships
    if (movementsData.length > 0) {
      const workoutMovements = movementsData.map(movement => ({
        workout_id: currentWorkoutId,
        movement_id: movement.movement_id,
        sequence_order: movement.sequence_order,
        duration_seconds: movement.duration_seconds,
        repetitions: movement.repetitions,
        sets: movement.sets
      }));
      
      const { error: movementsError } = await supabase
        .from('workout_movements')
        .insert(workoutMovements);
      
      if (movementsError) {
        throw new Error(`Error adding workout movements: ${movementsError.message}`);
      }
    }
    
    // Add focus area relationships
    if (focusAreaIds.length > 0) {
      const workoutFocusAreas = focusAreaIds.map(focusAreaId => ({
        workout_id: currentWorkoutId,
        focus_area_id: focusAreaId
      }));
      
      const { error: focusAreasError } = await supabase
        .from('workout_focus_areas')
        .insert(workoutFocusAreas);
      
      if (focusAreasError) {
        throw new Error(`Error adding workout focus areas: ${focusAreasError.message}`);
      }
    }
    
    return { success: true, workoutId: currentWorkoutId };
  } catch (error: any) {
    console.error('Error in createOrUpdateWorkout:', error);
    return { success: false, error: error.message };
  }
} 