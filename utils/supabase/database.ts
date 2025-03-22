import { createClient } from './server';
import type { User, Workout, UserWorkout, DailyWorkout, Achievement, UserAchievement, UserStreak, Movement, FocusArea } from '../../types/database';

// Helper function to get the authenticated user from the session
export async function getCurrentUser(): Promise<User | null> {
  try {
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
    
    if (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
    
    return data as User;
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
    return null;
  }
}

// Get today's workout
export async function getTodaysWorkout(): Promise<Workout | null> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get the workout assigned for today
    const { data, error } = await supabase
      .from('daily_workouts')
      .select('workout_id, workouts(*)')
      .eq('schedule_date', today)
      .eq('is_active', true)
      .single();
    
    if (error) {
      // If no data is found, don't treat as an error
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching today\'s workout:', error);
      return null;
    }
    
    if (!data || !data.workouts) {
      return null;
    }
    
    return data.workouts as unknown as Workout;
  } catch (err) {
    console.error('Unexpected error in getTodaysWorkout:', err);
    return null;
  }
}

// Get user's workout history
export async function getUserWorkoutHistory(userId: string): Promise<UserWorkout[]> {
  try {
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
  } catch (err) {
    console.error('Unexpected error in getUserWorkoutHistory:', err);
    return [];
  }
}

// Get user's streak information
export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      // If no data is found, don't treat as an error
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user streak:', error);
      return null;
    }
    
    return data as UserStreak;
  } catch (err) {
    console.error('Unexpected error in getUserStreak:', err);
    return null;
  }
}

// Get user's achievements
export async function getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
  try {
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
  } catch (err) {
    console.error('Unexpected error in getUserAchievements:', err);
    return [];
  }
}

// Get a specific workout by ID
export async function getWorkoutById(workoutId: string): Promise<Workout | null> {
  try {
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
  } catch (err) {
    console.error('Unexpected error in getWorkoutById:', err);
    return null;
  }
}

// Mark a workout as started
export async function startWorkout(userId: string, workoutId: string): Promise<UserWorkout | null> {
  try {
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
  } catch (err) {
    console.error('Unexpected error in startWorkout:', err);
    return null;
  }
}

// Mark a workout as completed
export async function completeWorkout(userId: string, workoutId: string, durationTaken: number): Promise<UserWorkout | null> {
  try {
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
  } catch (err) {
    console.error('Unexpected error in completeWorkout:', err);
    return null;
  }
}

// Helper to update user streak after completing a workout
async function updateUserStreak(userId: string): Promise<void> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Get current streak data
    const { data: streakData, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      console.error('Error fetching user streak for update:', streakError);
      return;
    }
    
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
      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streakData.longest_streak),
          last_workout_date: today,
        })
        .eq('user_id', userId);
      
      if (updateError) {
        console.error('Error updating user streak:', updateError);
      }
    } else {
      // Create new streak record
      const { error: insertError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_workout_date: today,
        });
      
      if (insertError) {
        console.error('Error creating user streak:', insertError);
      }
    }
  } catch (err) {
    console.error('Unexpected error in updateUserStreak:', err);
  }
}

// Get all workouts with filtering and sorting options
export async function getWorkoutsLibrary({
  page = 1,
  limit = 12,
  sortBy = 'created_at',
  sortOrder = 'desc',
  intensity = null,
  focusArea = null,
  search = null,
  startDate = null,
  endDate = null,
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  intensity?: 'beginner' | 'intermediate' | 'advanced' | null;
  focusArea?: string | null;
  search?: string | null;
  startDate?: string | null;
  endDate?: string | null;
} = {}) {
  try {
    const supabase = createClient();
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('workouts')
      .select(`
        *,
        workout_focus_areas(
          focus_area_id,
          focus_areas(name)
        ),
        daily_workouts(schedule_date)
      `, { count: 'exact' });
    
    // Apply filters
    if (intensity) {
      query = query.eq('intensity', intensity);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Filter by focus area if provided
    if (focusArea) {
      query = query.eq('workout_focus_areas.focus_areas.name', focusArea);
    }
    
    // Filter for active workouts
    query = query.eq('is_active', true);
    
    // Apply sorting
    if (sortBy && sortOrder) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching workouts library:', error);
      return { data: [], count: 0 };
    }
    
    // Process the data to get scheduled dates for calendar view
    const processedData = data.map(workout => {
      const scheduledDates = workout.daily_workouts
        ? workout.daily_workouts.map((dw: any) => dw.schedule_date)
        : [];
      
      const focusAreas = workout.workout_focus_areas
        ? workout.workout_focus_areas
            .filter((wfa: any) => wfa.focus_areas)
            .map((wfa: any) => wfa.focus_areas.name)
        : [];
      
      return {
        ...workout,
        scheduled_dates: scheduledDates,
        focus_areas: focusAreas,
        // Remove nested data to keep it clean
        daily_workouts: undefined,
        workout_focus_areas: undefined
      };
    });
    
    return { 
      data: processedData, 
      count: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  } catch (err) {
    console.error('Unexpected error in getWorkoutsLibrary:', err);
    return { data: [], count: 0, totalPages: 0 };
  }
}

// Get all focus areas for filtering
export async function getFocusAreas() {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('focus_areas')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching focus areas:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error in getFocusAreas:', err);
    return [];
  }
}

// Get all movements with filtering and sorting options
export async function getMovementsLibrary({
  page = 1,
  limit = 12,
  sortBy = 'name',
  sortOrder = 'asc',
  difficulty = null,
  focusAreaId = null,
  search = null,
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | null;
  focusAreaId?: string | null;
  search?: string | null;
} = {}) {
  try {
    const supabase = createClient();
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('movements')
      .select(`
        *,
        focus_areas(id, name, description, image_url)
      `, { count: 'exact' });
    
    // Apply filters
    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Filter by focus area if provided
    if (focusAreaId) {
      query = query.eq('focus_area_id', focusAreaId);
    }
    
    // Apply sorting
    if (sortBy && sortOrder) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching movements library:', error);
      return { data: [], count: 0 };
    }
    
    // Process the data to include focus area information
    const processedData = data.map(movement => {
      return {
        ...movement,
        focus_area: movement.focus_areas,
        // Remove nested data to keep it clean
        focus_areas: undefined
      };
    });
    
    return { 
      data: processedData, 
      count: count || 0,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  } catch (err) {
    console.error('Unexpected error in getMovementsLibrary:', err);
    return { data: [], count: 0, totalPages: 0 };
  }
}

// Get a specific movement by ID
export async function getMovementById(movementId: string): Promise<Movement | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('movements')
      .select(`
        *,
        focus_areas(id, name, description, image_url)
      `)
      .eq('id', movementId)
      .single();
    
    if (error) {
      console.error('Error fetching movement:', error);
      return null;
    }
    
    // Format the response
    const movement = {
      ...data,
      focus_area: data.focus_areas,
      focus_areas: undefined
    };
    
    return movement as unknown as Movement;
  } catch (err) {
    console.error('Unexpected error in getMovementById:', err);
    return null;
  }
}

// Get movements for a specific workout with sequence order and details
export async function getWorkoutMovements(workoutId: string): Promise<any[]> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('workout_movements')
      .select(`
        id,
        sequence_order,
        duration_seconds,
        repetitions,
        sets,
        movements(
          id,
          name,
          description,
          thumbnail_url,
          video_url,
          difficulty_level,
          focus_areas(id, name, description, image_url)
        )
      `)
      .eq('workout_id', workoutId)
      .order('sequence_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching workout movements:', error);
      return [];
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error in getWorkoutMovements:', err);
    return [];
  }
}

// Get popular workouts for the dashboard carousel
export async function getPopularWorkouts(limit: number = 5): Promise<Workout[]> {
  try {
    const supabase = createClient();
    
    // You can customize this query based on your definition of "popular"
    // Here we're getting the most recently created active workouts
    // Alternative approach could be to count user_workouts completions
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching popular workouts:', error);
      return [];
    }
    
    return data as Workout[];
  } catch (err) {
    console.error('Unexpected error in getPopularWorkouts:', err);
    return [];
  }
} 