// Type definitions for database tables

// Existing user table (from Supabase)
export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  stripe_id: string;
}

// Workouts
export interface Workout {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  intensity: 'beginner' | 'intermediate' | 'advanced';
  video_url: string | null;
  thumbnail_url: string | null;
  coach_note: string | null;
  created_at: string;
  is_active: boolean;
}

// Focus Areas
export interface FocusArea {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

// Junction: Workout Focus Areas
export interface WorkoutFocusArea {
  id: string;
  workout_id: string;
  focus_area_id: string;
}

// Movements
export interface Movement {
  id: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  focus_area_id: string | null;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;
}

// Junction: Workout Movements with sequence
export interface WorkoutMovement {
  id: string;
  workout_id: string;
  movement_id: string;
  sequence_order: number;
  duration_seconds: number | null;
  repetitions: number | null;
  sets: number | null;
}

// User Progress
export interface UserWorkout {
  id: string;
  user_id: string;
  workout_id: string;
  completed: boolean;
  started_at: string | null;
  completed_at: string | null;
  duration_taken: number | null;
  created_at: string;
  workouts?: Workout;
}

// Daily Workout Schedule
export interface DailyWorkout {
  id: string;
  workout_id: string;
  schedule_date: string;
  is_active: boolean;
}

// Achievements
export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  required_count: number;
  achievement_type: 'streak' | 'workouts_completed' | 'focus_area';
}

// User Achievements
export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

// User Streaks
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
} 