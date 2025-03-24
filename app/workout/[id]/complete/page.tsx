import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getWorkoutById, completeWorkout, getUserStreak } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";

export default async function WorkoutComplete({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    redirect('/login');
  }

  // Check if user has a valid subscription
  const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, data.user.email!));
  if (!userRecord.length || userRecord[0].plan === 'none') {
    redirect('/subscribe');
  }

  // Get workout details
  const workout = await getWorkoutById(params.id);
  if (!workout) {
    redirect('/dashboard');
  }

  // Complete the workout (we're using the workout duration as the time taken for simplicity)
  await completeWorkout(data.user.id, workout.id, workout.duration_minutes);
  
  // Get updated streak
  const userStreak = await getUserStreak(data.user.id);

  return (
    <main className="flex-1 p-4 bg-gray-50 min-h-screen">
      <div className="container max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-xl shadow-md p-10 mb-8">
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Great Job!</h1>
            <p className="text-gray-600 mt-2 text-lg">You've completed today's workout</p>
          </div>

          <div className="mb-8">
            <h2 className="font-medium text-xl text-gray-900 mb-2">{workout.title}</h2>
            <p className="text-gray-600">Duration: {workout.duration_minutes} minutes</p>
          </div>

          {userStreak && (
            <div className="bg-blue-50 p-4 rounded-lg inline-block mb-8">
              <div className="flex items-center">
                <div className="mr-4">
                  <span className="text-5xl">🔥</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Current Streak</h3>
                  <p className="text-3xl font-bold text-blue-600">{userStreak.current_streak} days</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <a href="/dashboard" className="inline-block">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors text-lg">
                Return to Dashboard
              </button>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="font-bold text-xl text-gray-900 mb-6">Benefits of Consistency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Improved Muscle Tone</h3>
              <p className="text-gray-600">Regular facial exercises help tone your facial muscles for a more defined appearance.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Reduced Tension</h3>
              <p className="text-gray-600">Face workouts can help release tension that builds up in your facial muscles.</p>
            </div>
            <div className="p-5 border border-gray-100 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">Better Circulation</h3>
              <p className="text-gray-600">These exercises promote blood flow to your face, giving you a healthy glow.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 