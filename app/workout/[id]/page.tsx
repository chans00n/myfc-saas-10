import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getWorkoutById, startWorkout, completeWorkout, getUserWorkoutHistory, getWorkoutMovements } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Image from 'next/image';
import Link from 'next/link';
import { Workout, UserWorkout } from '@/types/database';
import CoachImage from '@/app/components/CoachImage';
import WorkoutComments from '@/components/workout/WorkoutComments';
import BookmarkButton from '@/app/components/BookmarkButton';

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
  let movements: any[] = [];
  
  try {
    workout = await getWorkoutById(params.id) as WorkoutWithExercises;
    if (!workout) {
      redirect('/dashboard');
    }
    
    // Get movements associated with this workout
    movements = await getWorkoutMovements(params.id);
    
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
        <div className="relative z-10 flex justify-between items-start p-6 pt-12 md:pt-6 safe-top">
          {/* Bookmark button */}
          <BookmarkButton workoutId={params.id} />
          
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
      <div className="bg-white dark:bg-neutral-900 rounded-t-3xl -mt-8 relative z-20 px-6 pt-8 pb-32">
        {/* Overview section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Overview</h2>
          <p className="text-neutral-700 dark:text-neutral-300">{workout.description}</p>
        </section>
        
        {/* Movements section */}
        {movements.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center mb-4">
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Movements in this Workout</h2>
              <span className="ml-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-1 rounded-full">
                {movements.length}
              </span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              This workout includes the following movements. Tap on any movement to view more details.
            </p>

            <div className="space-y-3">
              {movements.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/dashboard/movements/${item.movements?.id}`}
                  className="block bg-gray-50 dark:bg-neutral-800 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center p-3">
                    {/* Sequence number badge */}
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full flex items-center justify-center mr-3 font-medium">
                      {item.sequence_order}
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="relative h-16 w-24 bg-gray-200 dark:bg-neutral-700 rounded-md mr-4 flex-shrink-0 overflow-hidden">
                      {item.movements?.thumbnail_url ? (
                        <Image 
                          src={item.movements.thumbnail_url}
                          alt={item.movements.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-grow">
                      <h3 className="font-medium text-neutral-800 dark:text-neutral-100">{item.movements?.name}</h3>
                      {item.movements?.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
                          {item.movements.description}
                        </p>
                      )}
                      
                      {/* Stats */}
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {item.duration_seconds && (
                          <span className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.duration_seconds}s
                          </span>
                        )}
                        {item.repetitions && (
                          <span className="bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium px-2 py-0.5 rounded flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {item.repetitions} reps
                          </span>
                        )}
                        {item.sets && (
                          <span className="bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {item.sets} sets
                          </span>
                        )}
                        {item.movements?.focus_areas && (
                          <span className="bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2 py-0.5 rounded flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            {item.movements.focus_areas.name}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Arrow */}
                    <div className="ml-2 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
        
        {/* Focus Areas Tag Cloud - replacing the Workout Details section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Focus Areas</h2>
          
          {movements.length > 0 ? (
            <>
              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                This workout targets the following facial muscle groups:
              </p>
              
              <div className="flex flex-wrap gap-2">
                {/* Extract unique focus areas from movements */}
                {(() => {
                  // Create a Map to store unique focus areas by ID
                  const uniqueFocusAreasMap = new Map();
                  
                  // Populate the map with focus areas
                  movements
                    .filter(item => item.movements?.focus_areas)
                    .forEach(item => {
                      const focusArea = item.movements.focus_areas;
                      if (focusArea && focusArea.id) {
                        uniqueFocusAreasMap.set(focusArea.id, {
                          id: focusArea.id,
                          name: focusArea.name
                        });
                      }
                    });
                  
                  // Convert the map values to an array
                  return Array.from(uniqueFocusAreasMap.values()).map(focusArea => (
                    <span 
                      key={focusArea.id}
                      className="inline-flex items-center rounded-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-sm font-medium"
                    >
                      {focusArea.name}
                    </span>
                  ));
                })()}
              </div>
            </>
          ) : (
            <p className="text-neutral-600 dark:text-neutral-400">
              Focus area information is not available for this workout.
            </p>
          )}
        </section>
        
        {/* Coach section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Notes from Coach Zionna</h2>
          <div className="flex items-center">
            <div className="mr-4 w-16 h-16 rounded-full overflow-hidden bg-gray-200 relative flex-shrink-0">
              <CoachImage 
                src="/images/coach-zionna.jpg" 
                alt="Coach Zionna"
                fallbackInitial="Z"
              />
            </div>
            <div>
              {workout.coach_note ? (
                <blockquote className="border-l-2 pl-6 italic">
                  <span className="text-xl text-neutral-400 leading-none mr-1">"</span>
                  {workout.coach_note}
                  <span className="text-xl text-neutral-400 leading-none ml-1">"</span>
                </blockquote>
              ) : (
                <p className="text-neutral-600 dark:text-neutral-400 text-sm italic">No special notes from the coach for this workout.</p>
              )}
            </div>
          </div>
        </section>
        
        {/* Previous workout section */}
        {prevWorkout && prevWorkout.workouts && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">Previous Workout</h2>
            <Link href={`/workout/${prevWorkout.workout_id}`}>
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 flex items-center hover:bg-neutral-100 transition">
                <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-800">{prevWorkout.workouts.title}</h3>
                  <p className="text-gray-600 text-sm">Completed on {new Date(prevWorkout.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </Link>
          </section>
        )}
        
        {/* Workout comments section */}
        <section className="mb-10">
          <WorkoutComments workoutId={params.id} userId={data.user.id} />
        </section>
      </div>
      
      {/* Fixed bottom buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-neutral-800 dark:border-neutral-700 px-6 py-4 border-t border-gray-200 flex space-x-4">
        <Link href={`/workout/${workout.id}/start`} className="flex-1">
          <button className="w-full bg-neutral-600 hover:bg-neutral-700 text-white font-medium py-3 rounded-lg transition duration-300">
            Start Workout
          </button>
        </Link>
        
        <Link href={`/workout/${workout.id}/complete`} className="flex-1">
          <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-200 font-medium py-3 rounded-lg transition duration-300">
            Mark as Completed
          </button>
        </Link>
      </div>
    </div>
  );
}