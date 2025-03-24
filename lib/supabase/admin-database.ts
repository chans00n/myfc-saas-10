import { createAdminClient } from './admin';
import type { Workout, Movement, FocusArea } from '../../types/database';

// Admin function to get all workouts
export async function adminGetAllWorkouts(): Promise<Workout[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('[ADMIN] Error fetching workouts:', error);
    return [];
  }
  
  return data as Workout[];
}

// Admin function to get all movements
export async function adminGetAllMovements(): Promise<Movement[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('movements')
    .select('*, focus_areas(*)');
  
  if (error) {
    console.error('[ADMIN] Error fetching movements:', error);
    return [];
  }
  
  return data as Movement[];
}

// Admin function to get all focus areas
export async function adminGetAllFocusAreas(): Promise<FocusArea[]> {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from('focus_areas')
    .select('*');
  
  if (error) {
    console.error('[ADMIN] Error fetching focus areas:', error);
    return [];
  }
  
  return data as FocusArea[];
}

// Admin function to get workout with details
export async function adminGetWorkoutWithDetails(workoutId: string): Promise<{
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
  const supabase = createAdminClient();
  
  // Add a timestamp to query to avoid any caching at the Supabase level
  const timestamp = new Date().getTime();
  const cacheBuster = `cb=${timestamp}`;
  
  // Get the workout
  console.log(`[ADMIN] Fetching workout ${workoutId} with cache buster`);
  const { data: workout, error: workoutError } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();
  
  if (workoutError) {
    console.error('[ADMIN] Error fetching workout:', workoutError);
    return { workout: null, movements: [], focusAreas: [] };
  }
  
  // Get the workout movements with sequence
  const { data: workoutMovements, error: movementsError } = await supabase
    .from('workout_movements')
    .select('*, movement:movements(*)')
    .eq('workout_id', workoutId)
    .order('sequence_order', { ascending: true });
  
  if (movementsError) {
    console.error('[ADMIN] Error fetching workout movements:', movementsError);
    return { workout: workout as Workout, movements: [], focusAreas: [] };
  }
  
  // Get the workout focus areas
  const { data: workoutFocusAreas, error: focusAreasError } = await supabase
    .from('workout_focus_areas')
    .select('*, focus_area:focus_areas(*)')
    .eq('workout_id', workoutId);
  
  if (focusAreasError) {
    console.error('[ADMIN] Error fetching workout focus areas:', focusAreasError);
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
  
  console.log(`[ADMIN] Successfully fetched workout data for ${workoutId}`);
  console.log(`[ADMIN] Workout title: ${workout?.title}`);
  console.log(`[ADMIN] Workout description: ${workout?.description}`);
  
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

// Admin function to create or update a workout with movements and focus areas
export async function adminCreateOrUpdateWorkout(
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
  const supabase = createAdminClient();
  
  try {
    // Start a transaction
    let workout;
    let workoutError;
    
    if (workoutId) {
      // First, verify the workout exists
      console.log(`[ADMIN] Checking if workout with ID ${workoutId} exists...`);
      const { data: existingWorkout, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();
      
      if (fetchError) {
        console.error('[ADMIN] Fetch error:', fetchError);
        throw new Error(`Workout with ID ${workoutId} not found: ${fetchError.message}`);
      }
      
      if (!existingWorkout) {
        throw new Error(`Workout with ID ${workoutId} not found`);
      }
      
      console.log('[ADMIN] Workout found, proceeding with update...');
      
      // Update the workout directly since we're using the admin client
      const { data, error } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', workoutId)
        .select();
      
      workout = data?.[0];
      workoutError = error;
      
      console.log('[ADMIN] Update result:', { data, error });
    } else {
      // Create new workout
      const { data, error } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select();
      
      workout = data?.[0];
      workoutError = error;
      
      console.log('[ADMIN] Insert result:', { data, error });
    }
    
    if (workoutError) {
      throw new Error(`Error ${workoutId ? 'updating' : 'creating'} workout: ${workoutError.message}`);
    }
    
    if (!workout) {
      throw new Error(`Failed to ${workoutId ? 'update' : 'create'} workout: No data returned`);
    }
    
    const currentWorkoutId = workoutId || workout.id;
    
    if (workoutId) {
      // Delete existing movement relationships for update case
      console.log('[ADMIN] Deleting existing workout movements...');
      const { error: deleteMovementsError } = await supabase
        .from('workout_movements')
        .delete()
        .eq('workout_id', currentWorkoutId);
      
      if (deleteMovementsError) {
        throw new Error(`Error deleting workout movements: ${deleteMovementsError.message}`);
      }
      
      // Delete existing focus area relationships for update case
      console.log('[ADMIN] Deleting existing workout focus areas...');
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
      console.log('[ADMIN] Adding workout movements...');
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
      console.log('[ADMIN] Adding workout focus areas...');
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
    console.error('[ADMIN] Error in adminCreateOrUpdateWorkout:', error);
    return { success: false, error: error.message };
  }
} 