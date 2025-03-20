const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

console.error('Script started');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.error('Environment variables:');
console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Not found');
console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? 'Found' : 'Not found');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.error('Supabase client initialized');

// Helper function to format dates
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get dates for testing
const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfterTomorrow = new Date(today);
dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

console.error('Creating workouts for these dates:');
console.error(`Yesterday: ${formatDate(yesterday)}`);
console.error(`Today: ${formatDate(today)}`);
console.error(`Tomorrow: ${formatDate(tomorrow)}`);
console.error(`Day after tomorrow: ${formatDate(dayAfterTomorrow)}`);

// Sample workout data
const workoutSamples = [
  {
    title: "Morning Energy Boost",
    description: "Start your day with this energizing workout to boost your metabolism and mood.",
    duration_minutes: 30,
    intensity: "beginner",
    video_url: null,
    thumbnail_url: null,
    coach_note: null,
    is_active: true
  },
  {
    title: "Strength Training Circuit",
    description: "Build muscle and increase strength with this comprehensive circuit training routine.",
    duration_minutes: 45,
    intensity: "intermediate",
    video_url: null,
    thumbnail_url: null,
    coach_note: null,
    is_active: true
  },
  {
    title: "Cardio Blast",
    description: "Elevate your heart rate and burn calories with this high-intensity cardio session.",
    duration_minutes: 25,
    intensity: "beginner",
    video_url: null,
    thumbnail_url: null,
    coach_note: null,
    is_active: true
  },
  {
    title: "Core Strengthening",
    description: "Develop a strong core with these targeted exercises for your abs and lower back.",
    duration_minutes: 35,
    intensity: "intermediate",
    video_url: null,
    thumbnail_url: null,
    coach_note: null,
    is_active: true
  }
];

// Function to create workouts and schedule them
async function createWorkouts() {
  try {
    console.error('Creating workout entries...');
    
    // First create the workout entries
    const workoutIds = [];
    for (const workout of workoutSamples) {
      const { data, error } = await supabase
        .from('workouts')
        .insert(workout)
        .select();
      
      if (error) {
        console.error('Error creating workout:', error);
        continue;
      }
      
      if (data && data.length > 0) {
        workoutIds.push(data[0].id);
        console.error(`Created workout: ${workout.title} with ID: ${data[0].id}`);
      }
    }
    
    if (workoutIds.length === 0) {
      console.error('Failed to create any workouts');
      return;
    }
    
    // Now schedule the workouts for different days
    console.error('\nScheduling workouts for different days...');
    
    const dates = [yesterday, today, tomorrow, dayAfterTomorrow];
    for (let i = 0; i < Math.min(workoutIds.length, dates.length); i++) {
      const { data, error } = await supabase
        .from('daily_workouts')
        .insert({
          workout_id: workoutIds[i],
          schedule_date: formatDate(dates[i]),
          is_active: true
        })
        .select();
      
      if (error) {
        console.error(`Error scheduling workout for ${formatDate(dates[i])}:`, error);
      } else {
        console.error(`Scheduled workout ID ${workoutIds[i]} for ${formatDate(dates[i])}`);
      }
    }
    
    console.error('\nAll done! Check your dashboard to see the workouts.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createWorkouts();