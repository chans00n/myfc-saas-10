import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserAchievements, getUserWorkoutHistory, getUserStreak } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Link from 'next/link';
import type { UserAchievement, Achievement } from '@/types/database';

export default async function AchievementsPage() {
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

  // Get user's achievements, workout history, and streak
  let achievements: (UserAchievement & { achievement: Achievement })[] = [];
  let completedWorkoutsCount = 0;
  let currentStreak = 0;
  
  try {
    // Get user achievements
    achievements = await getUserAchievements(data.user.id);
    
    // Count completed workouts
    const history = await getUserWorkoutHistory(data.user.id);
    completedWorkoutsCount = history.filter(w => w.completed).length;
    
    // Get current streak
    const streak = await getUserStreak(data.user.id);
    if (streak) {
      currentStreak = streak.current_streak;
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
  }

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

  return (
    <main className="pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">My Achievements</h1>
          <p className="text-gray-600">Track your progress and earn badges as you complete workouts</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-1">{completedWorkoutsCount}</div>
              <div className="text-gray-500">Workouts Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-1">{currentStreak}</div>
              <div className="text-gray-500">Day Streak</div>
            </div>
          </div>
        </div>

        {/* Workout Completion Achievements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Workout Milestones</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workoutAchievements.map((achievement) => {
              const isEarned = earnedAchievementIds.includes(achievement.id);
              return (
                <div key={achievement.id} className={`p-4 rounded-lg border ${isEarned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-4xl" role="img" aria-label="Achievement icon">
                      {achievement.icon_url || '🏆'}
                    </span>
                  </div>
                  <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 text-center">{achievement.description}</p>
                  <div className="mt-3 flex justify-center">
                    <div className={`text-xs px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {isEarned ? 'Completed' : `${completedWorkoutsCount}/${achievement.required_count} workouts`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Achievements */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Consistency Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {streakAchievements.map((achievement) => {
              const isEarned = earnedAchievementIds.includes(achievement.id);
              return (
                <div key={achievement.id} className={`p-4 rounded-lg border ${isEarned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-center mb-3">
                    <span className="text-4xl" role="img" aria-label="Achievement icon">
                      {achievement.icon_url || '🔥'}
                    </span>
                  </div>
                  <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                  <p className="text-sm text-gray-600 text-center">{achievement.description}</p>
                  <div className="mt-3 flex justify-center">
                    <div className={`text-xs px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                      {isEarned ? 'Completed' : `${currentStreak}/${achievement.required_count} day streak`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Focus Area Achievements */}
        {focusAreaAchievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Focus Area Mastery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {focusAreaAchievements.map((achievement) => {
                const isEarned = earnedAchievementIds.includes(achievement.id);
                return (
                  <div key={achievement.id} className={`p-4 rounded-lg border ${isEarned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-center mb-3">
                      <span className="text-4xl" role="img" aria-label="Achievement icon">
                        {achievement.icon_url || '💪'}
                      </span>
                    </div>
                    <h3 className="font-medium text-center mb-1">{achievement.name}</h3>
                    <p className="text-sm text-gray-600 text-center">{achievement.description}</p>
                    <div className="mt-3 flex justify-center">
                      <div className={`text-xs px-2 py-1 rounded-full ${isEarned ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                        {isEarned ? 'Completed' : 'In Progress'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {achievements.length === 0 && allAchievements?.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-2">No Achievements Yet</h2>
            <p className="text-gray-600 mb-6">
              Complete workouts and maintain your streak to earn badges and achievements.
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