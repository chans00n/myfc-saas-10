import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserWorkoutHistory, getUserStreak, getUserAchievements } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Link from 'next/link';
import type { UserWorkout, UserAchievement, Achievement } from '@/types/database';

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

  // Fetch user's workout history, streak, and achievements
  let history: UserWorkout[] = [];
  let streakData = null;
  let achievements: (UserAchievement & { achievement: Achievement })[] = [];
  
  try {
    // Get workout history
    history = await getUserWorkoutHistory(data.user.id);
    
    // Get streak info
    streakData = await getUserStreak(data.user.id);
    
    // Get user achievements
    achievements = await getUserAchievements(data.user.id);
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
  
  // Fetch all available achievements
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')
    .order('required_count', { ascending: true });

  // Group achievements by type
  const workoutAchievements = allAchievements?.filter(a => a.achievement_type === 'workouts_completed') || [];
  const streakAchievements = allAchievements?.filter(a => a.achievement_type === 'streak') || [];
  const focusAreaAchievements = allAchievements?.filter(a => a.achievement_type === 'focus_area') || [];

  // Check which achievements have been earned
  const earnedAchievementIds = achievements.map(a => a.achievement_id);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <main className="pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Track your facial fitness journey</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">MYFC Progress</h1>
                </div>
            </div>


        {totalWorkoutCount > 0 ? (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{totalWorkoutCount}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-sm">Workouts Completed</div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{totalWorkoutTime} min</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-sm">Total Workout Time</div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{streakData?.current_streak || 0}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-sm">Current Streak</div>
              </div>
              
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-4 text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">{streakData?.longest_streak || 0}</div>
                <div className="text-neutral-500 dark:text-neutral-400 text-sm">Longest Streak</div>
              </div>
            </div>

            {/* Intensity Breakdown */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Workout Intensity Breakdown</h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Beginner</span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{beginnerWorkouts} workouts</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${totalWorkoutCount ? (beginnerWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Intermediate</span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{intermediateWorkouts} workouts</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5">
                    <div 
                      className="bg-amber-500 h-2.5 rounded-full" 
                      style={{ width: `${totalWorkoutCount ? (intermediateWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Advanced</span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{advancedWorkouts} workouts</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5">
                    <div 
                      className="bg-rose-500 h-2.5 rounded-full" 
                      style={{ width: `${totalWorkoutCount ? (advancedWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Weekly Progress</h2>
              
              <div className="flex justify-between items-end h-32 mb-4">
                {weeklyData.map((week, index) => (
                  <div key={index} className="flex flex-col items-center w-1/4">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{week.count} workouts</div>
                    <div 
                      className="w-8 rounded-t-sm"
                      style={{ 
                        height: `${week.count ? Math.min(week.count * 20, 100) : 4}px`,
                        backgroundColor: week.count ? 'rgb(99, 102, 241)' : 'rgb(224, 231, 255)'
                      }}
                    ></div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">{week.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workout Completion Achievements */}
            {workoutAchievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Workout Milestones</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {workoutAchievements.map((achievement) => {
                    const isEarned = earnedAchievementIds.includes(achievement.id);
                    return (
                      <div key={achievement.id} className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border p-4 ${isEarned ? 'border-green-200 dark:border-green-900' : 'border-neutral-200 dark:border-neutral-700'}`}>
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-4xl" role="img" aria-label="Achievement icon">
                            {achievement.icon_url || '🏆'}
                          </span>
                        </div>
                        <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">{achievement.description}</p>
                        <div className="mt-3 flex justify-center">
                          <div className={`text-xs px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'}`}>
                            {isEarned ? 'Completed' : `${totalWorkoutCount}/${achievement.required_count} workouts`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Streak Achievements */}
            {streakAchievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Consistency Rewards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {streakAchievements.map((achievement) => {
                    const isEarned = earnedAchievementIds.includes(achievement.id);
                    return (
                      <div key={achievement.id} className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border p-4 ${isEarned ? 'border-green-200 dark:border-green-900' : 'border-neutral-200 dark:border-neutral-700'}`}>
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-4xl" role="img" aria-label="Achievement icon">
                            {achievement.icon_url || '🔥'}
                          </span>
                        </div>
                        <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">{achievement.description}</p>
                        <div className="mt-3 flex justify-center">
                          <div className={`text-xs px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'}`}>
                            {isEarned ? 'Completed' : `${streakData?.current_streak || 0}/${achievement.required_count} day streak`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Focus Area Achievements */}
            {focusAreaAchievements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Focus Area Mastery</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {focusAreaAchievements.map((achievement) => {
                    const isEarned = earnedAchievementIds.includes(achievement.id);
                    return (
                      <div key={achievement.id} className={`bg-white dark:bg-neutral-800 rounded-lg shadow-sm border p-4 ${isEarned ? 'border-green-200 dark:border-green-900' : 'border-neutral-200 dark:border-neutral-700'}`}>
                        <div className="flex items-center justify-center mb-3">
                          <span className="text-4xl" role="img" aria-label="Achievement icon">
                            {achievement.icon_url || '💪'}
                          </span>
                        </div>
                        <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">{achievement.description}</p>
                        <div className="mt-3 flex justify-center">
                          <div className={`text-xs px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300'}`}>
                            {isEarned ? 'Completed' : 'In Progress'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              
              <div className="space-y-4">
                {completedWorkouts.slice(0, 5).map((workout) => (
                  <div key={workout.id} className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                    <div>
                      <h3 className="font-medium">{workout.workouts?.title || 'Unknown Workout'}</h3>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formatDate(workout.completed_at || workout.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">{workout.duration_taken} min</span>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100">
                        {workout.workouts?.intensity || 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {completedWorkouts.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/dashboard/history" className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
                      View Full History →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <h2 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-2">No Progress Data Yet</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Complete your first workout to start tracking your progress and earning achievements.
            </p>
            <Link href="/dashboard">
              <button className="bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white font-medium py-2 px-6 rounded-lg transition-colors">
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