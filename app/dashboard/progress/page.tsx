import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserWorkoutHistory, getUserStreak } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Link from 'next/link';
import type { UserWorkout } from '@/types/database';

export default async function ProgressPage() {
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

  // Fetch user's workout history and streak
  let history: UserWorkout[] = [];
  let streakData = null;
  
  try {
    // Get workout history
    history = await getUserWorkoutHistory(data.user.id);
    
    // Get streak info
    streakData = await getUserStreak(data.user.id);
  } catch (err) {
    console.error('Error fetching user data:', err);
  }

  // Calculate stats
  const completedWorkouts = history.filter(w => w.completed);
  const totalWorkoutCount = completedWorkouts.length;
  const totalWorkoutTime = completedWorkouts.reduce((sum, workout) => 
    sum + (workout.duration_taken || 0), 0);
  
  // Calculate workouts by intensity
  const beginnerWorkouts = completedWorkouts.filter(w => w.workouts?.intensity === 'beginner').length;
  const intermediateWorkouts = completedWorkouts.filter(w => w.workouts?.intensity === 'intermediate').length;
  const advancedWorkouts = completedWorkouts.filter(w => w.workouts?.intensity === 'advanced').length;
  
  // Calculate weekly workouts (last 4 weeks)
  const weeklyData = getWeeklyWorkouts(completedWorkouts);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <main className="pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">My Progress</h1>
          <p className="text-gray-600">Track your facial fitness journey over time</p>
        </div>

        {totalWorkoutCount > 0 ? (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{totalWorkoutCount}</div>
                <div className="text-gray-500 text-sm">Workouts Completed</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{totalWorkoutTime} min</div>
                <div className="text-gray-500 text-sm">Total Workout Time</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{streakData?.current_streak || 0}</div>
                <div className="text-gray-500 text-sm">Current Streak</div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">{streakData?.longest_streak || 0}</div>
                <div className="text-gray-500 text-sm">Longest Streak</div>
              </div>
            </div>

            {/* Intensity Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Workout Intensity Breakdown</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Beginner</span>
                    <span className="text-sm font-medium text-gray-700">{beginnerWorkouts} workouts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${totalWorkoutCount ? (beginnerWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Intermediate</span>
                    <span className="text-sm font-medium text-gray-700">{intermediateWorkouts} workouts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full" 
                      style={{ width: `${totalWorkoutCount ? (intermediateWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Advanced</span>
                    <span className="text-sm font-medium text-gray-700">{advancedWorkouts} workouts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-rose-500 h-2.5 rounded-full" 
                      style={{ width: `${totalWorkoutCount ? (advancedWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Weekly Progress</h2>
              
              <div className="flex justify-between items-end h-32 mb-4">
                {weeklyData.map((week, index) => (
                  <div key={index} className="flex flex-col items-center w-1/4">
                    <div className="text-xs text-gray-500 mb-1">{week.count} workouts</div>
                    <div 
                      className="w-8 rounded-t-sm"
                      style={{ 
                        height: `${week.count ? Math.min(week.count * 20, 100) : 4}px`,
                        backgroundColor: week.count ? 'rgb(99, 102, 241)' : 'rgb(224, 231, 255)'
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{week.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                {completedWorkouts.slice(0, 5).map((workout) => (
                  <div key={workout.id} className="flex justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="font-medium">{workout.workouts?.title || 'Unknown Workout'}</h3>
                      <div className="text-sm text-gray-500">
                        {formatDate(workout.completed_at || workout.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">{workout.duration_taken} min</span>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800">
                        {workout.workouts?.intensity || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {completedWorkouts.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/history" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View Full History →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Progress Data Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete your first workout to start tracking your progress.
            </p>
            <Link href="/dashboard">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Start a Workout
              </button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

// Helper function to calculate weekly workout data
function getWeeklyWorkouts(completedWorkouts: UserWorkout[]) {
  const now = new Date();
  const weekData = [];

  // Generate last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    // Count workouts in this week
    const count = completedWorkouts.filter(workout => {
      const workoutDate = new Date(workout.completed_at || workout.created_at);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    }).length;

    // Format week label
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

    weekData.push({ label, count });
  }

  return weekData;
} 