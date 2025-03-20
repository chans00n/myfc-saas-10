import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getWorkoutById, startWorkout, completeWorkout, getUserWorkoutHistory } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Image from 'next/image';
import Link from 'next/link';
import { Workout, UserWorkout } from '@/types/database';
import CoachImage from '@/app/components/CoachImage';

// Extend the Workout type to include exercises
interface WorkoutWithExercises extends Workout {
    exercises?: string;
}

export default async function WorkoutDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    redirect('/login');
  }

  // Check if user has a plan other than 'none'
  const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, data.user.email!));
  
  // If no user record found or plan is 'none', redirect to subscribe page
  if (!userRecord.length || userRecord[0].plan === 'none') {
    redirect('/subscribe');
  }

  // Get workout details
  let workout: WorkoutWithExercises | null = null;
  let prevWorkout: UserWorkout | null = null;
  
  try {
    workout = await getWorkoutById(params.id) as WorkoutWithExercises;
    if (!workout) {
      redirect('/dashboard');
    }
    
    // Record that user started this workout
    await startWorkout(data.user.id, workout.id);
    
    // Get user's recent workouts for the previous workout section
    const history = await getUserWorkoutHistory(data.user.id);
    if (history.length > 1) {
      prevWorkout = history[1]; // The second most recent workout (after the current one)
    }
  } catch (err) {
    console.error('Error fetching workout:', err);
    redirect('/dashboard');
  }

  // Parse exercises from JSON if available
  const exercises = workout.exercises ? JSON.parse(workout.exercises) : [];

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Full screen image header */}
      <div className="relative h-screen w-full flex flex-col">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {workout.thumbnail_url ? (
            <Image 
              src={workout.thumbnail_url}
              alt={workout.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-indigo-500 to-indigo-900"></div>
          )}
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black/80"></div>
        </div>
        
        {/* Top navigation */}
        <div className="relative z-10 flex justify-between items-start p-6">
          {/* Bookmark button */}
          <button className="text-white hover:text-indigo-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          
          {/* Close button */}
          <Link href="/dashboard" className="text-white hover:text-indigo-200 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
        </div>
        
        {/* Centered title and duration */}
        <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{workout.title}</h1>
          <div className="flex items-center text-white/90 text-xl">
            <span>{workout.duration_minutes} Min</span>
            <span className="mx-2">•</span>
            <span>{workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}</span>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="relative z-10 pb-24 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Content sections */}
      <div className="bg-white rounded-t-3xl -mt-8 relative z-20 px-6 pt-8 pb-32">
        {/* Overview section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700">{workout.description}</p>
        </section>
        
        {/* Workout details section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Workout Details</h2>
          {exercises.length > 0 ? (
            <div className="space-y-4">
              {exercises.map((exercise: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-lg">{index + 1}. {exercise.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-indigo-600">{exercise.reps || '-'} reps</span>
                    <span className="text-indigo-600">{exercise.duration || '-'} seconds each</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Follow along with the video for detailed instructions.</p>
          )}
        </section>
        
        {/* Coach section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">About Your Zionna</h2>
          <div className="flex items-center">
            <div className="mr-4 w-16 h-16 rounded-full overflow-hidden bg-gray-200 relative flex-shrink-0">
              <CoachImage 
                src="/images/coach-zionna.jpg" 
                alt="Coach Zionna"
                fallbackInitial="Z"
              />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Expert in facial fitness with 5+ years of coaching experience. Specializes in effective, targeted workouts for facial muscle toning.</p>
            </div>
          </div>
        </section>
        
        {/* Previous workout section */}
        {prevWorkout && prevWorkout.workouts && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Previous Workout</h2>
            <Link href={`/workout/${prevWorkout.workout_id}`}>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center hover:bg-gray-100 transition">
                <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">{prevWorkout.workouts.title}</h3>
                  <p className="text-gray-600 text-sm">Completed on {new Date(prevWorkout.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          </section>
        )}
      </div>
      
      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white px-6 py-4 border-t border-gray-200 flex space-x-4">
        <Link href={`/workout/${workout.id}/start`} className="flex-1">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition duration-300">
            Start Workout
          </button>
        </Link>
        
        <form action={async () => {
          'use server'
          try {
            await completeWorkout(data.user.id, workout!.id, workout!.duration_minutes);
            redirect('/dashboard');
          } catch (err) {
            console.error('Error completing workout:', err);
          }
        }} className="flex-1">
          <button type="submit" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition duration-300">
            Mark as Completed
          </button>
        </form>
      </div>
    </div>
  );
} 