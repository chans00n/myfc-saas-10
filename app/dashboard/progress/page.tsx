import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserWorkoutHistory, getUserStreak, getUserAchievements } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Link from 'next/link';
import type { UserWorkout, UserAchievement, Achievement } from '@/types/database';
import type { PostgrestResponse } from '@supabase/supabase-js';

// Achievement Icons as SVG components
const AchievementIcons = {
  workouts: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  streak: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
    </svg>
  ),
  focus: (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  )
};

export default async function ProgressPage() {
  const supabase = createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  
  if (authError || !userData?.user) {
    redirect('/login');
  }

  let history: UserWorkout[] = [];
  let streakData: { current_streak: number; longest_streak: number } | null = null;
  let achievements: (UserAchievement & { achievement: Achievement })[] = [];
  let userRecord = null;
  
  try {
    // Batch database queries together
    const [userRecordResult, historyResult, streakResult, achievementsResult, allAchievementsResult] = await Promise.all([
      db.select().from(usersTable).where(eq(usersTable.email, userData.user.email!)),
      getUserWorkoutHistory(userData.user.id),
      getUserStreak(userData.user.id),
      getUserAchievements(userData.user.id),
      supabase.from('achievements').select('*')
    ]);

    // Assign results with type checking
    userRecord = userRecordResult[0];
    history = historyResult || [];
    streakData = streakResult;
    achievements = achievementsResult || [];
    const allAchievementsData = allAchievementsResult.data || [];

    // Check subscription after getting user record
    if (!userRecord || userRecord.plan === 'none') {
      redirect('/subscribe');
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
    
    // Calculate weekly workouts
    const weeklyData = getWeeklyWorkouts(completedWorkouts);

    // Group achievements by type with proper typing
    const workoutAchievements = allAchievementsData.filter(a => a.achievement_type === 'workouts_completed');
    const streakAchievements = allAchievementsData.filter(a => a.achievement_type === 'streak');
    const focusAreaAchievements = allAchievementsData.filter(a => a.achievement_type === 'focus_area');

    // Check if user has a valid subscription
    if (!userRecord || userRecord.plan === 'none') {
      redirect('/subscribe');
    }

    // Fetch all available achievements
    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('required_count', { ascending: true });

    // Check which achievements have been earned
    const earnedAchievementIds = achievements.map(a => a.achievement_id);
    
    // Format date for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
      <main className="pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Track your facial fitness journey</p>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">Progress & Achievements</h1>
          </div>

          {totalWorkoutCount > 0 ? (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{totalWorkoutCount}</div>
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Lifts Completed</div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{totalWorkoutTime}</div>
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Minutes</div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{streakData?.current_streak || 0}</div>
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Current Streak</div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{streakData?.longest_streak || 0}</div>
                  <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Longest Streak</div>
                </div>
              </div>

              {/* Intensity Breakdown */}
              <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-6">Lift Intensity</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Beginner</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{beginnerWorkouts} lifts</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${totalWorkoutCount ? (beginnerWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Intermediate</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{intermediateWorkouts} lifts</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${totalWorkoutCount ? (intermediateWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-rose-500 mr-2"></div>
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Advanced</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{advancedWorkouts} lifts</span>
                    </div>
                    <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-rose-400 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${totalWorkoutCount ? (advancedWorkouts / totalWorkoutCount) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Progress */}
              <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6 mb-12">
                <div className="flex flex-col space-y-3">
                  <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Weekly Progress</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Your lift activity over the past 4 weeks</p>
                </div>
                
                <div className="mt-6 relative">
                  <div className="absolute -left-4 top-0 bottom-0 flex flex-col justify-between text-xs text-neutral-500 dark:text-neutral-400 w-4">
                    <span>4</span>
                    <span>3</span>
                    <span>2</span>
                    <span>1</span>
                    <span>0</span>
                  </div>
                  
                  <div className="pl-2">
                    <div className="h-[200px] flex items-end justify-between gap-2 relative">
                      {/* Grid lines */}
                      <div className="absolute inset-x-0 inset-y-6 grid grid-cols-1 gap-6 pointer-events-none">
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className="h-px w-full bg-neutral-200 dark:bg-neutral-800"
                          />
                        ))}
                      </div>

                      {weeklyData.map((week, index) => (
                        <div key={index} className="relative flex-1 flex flex-col justify-end z-10">
                          <div
                            className="w-full bg-indigo-500/20 dark:bg-indigo-500/30 rounded-sm transition-all duration-300 relative"
                            style={{
                              height: `${Math.max((week.count / 4) * 160, week.count > 0 ? 24 : 4)}px`,
                            }}
                          >
                            {week.count > 0 && (
                              <div className="absolute inset-0 bg-indigo-500 dark:bg-indigo-400 opacity-20 rounded-sm" />
                            )}
                          </div>
                          
                          {/* Labels */}
                          <div className="text-center mt-2">
                            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                              {week.count}
                            </div>
                            <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                              {week.label}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-4">
                      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>Updated just now</span>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-full" />
                            <span>Lifts</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workout Milestones */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
                  Lift Milestones
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Existing Beginner Face Trainer */}
                  <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6 flex flex-col">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.workouts}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Beginner Face Trainer</h3>
                    <p className="text-sm text-neutral-400 mb-4">Complete your first lift</p>
                    <div className="mt-auto text-sm font-medium text-neutral-500">3/1 lifts</div>
                  </div>

                  {/* Existing Face Master */}
                  <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6 flex flex-col">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.workouts}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Face Master</h3>
                    <p className="text-sm text-neutral-400 mb-4">Complete 30 lifts</p>
                    <div className="mt-auto text-sm font-medium text-neutral-500">3/30 lifts</div>
                  </div>

                  {/* New: Face Expert - Disabled */}
                  <div className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.workouts}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">Face Expert</h3>
                    <p className="text-sm text-neutral-500 mb-4">Complete 100 lifts</p>
                    <div className="mt-auto text-sm font-medium text-neutral-600">0/100 lifts</div>
                  </div>
                </div>
              </div>

              {/* Consistency Rewards */}
              <div className="mb-12">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
                  Consistency Rewards
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Existing Week Warrior */}
                  <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6 flex flex-col">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.streak}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Week Warrior</h3>
                    <p className="text-sm text-neutral-400 mb-4">Maintain a 7-day streak</p>
                    <div className="mt-auto text-sm font-medium text-neutral-500">2/7 day streak</div>
                  </div>

                  {/* New: Monthly Master - Disabled */}
                  <div className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.streak}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">Monthly Master</h3>
                    <p className="text-sm text-neutral-500 mb-4">Maintain a 30-day streak</p>
                    <div className="mt-auto text-sm font-medium text-neutral-600">0/30 day streak</div>
                  </div>

                  {/* New: Quarterly Champion - Disabled */}
                  <div className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.streak}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">Quarterly Champion</h3>
                    <p className="text-sm text-neutral-500 mb-4">Maintain a 90-day streak</p>
                    <div className="mt-auto text-sm font-medium text-neutral-600">0/90 day streak</div>
                  </div>
                </div>
              </div>

              {/* Focus Area Mastery */}
              <div>
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-6">
                  Focus Area Mastery
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Existing Neck Expert */}
                  <div className="bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 rounded-xl shadow-sm border border-neutral-200/50 dark:border-neutral-700/50 p-6 flex flex-col">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.focus}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">Neck Expert</h3>
                    <p className="text-sm text-neutral-400 mb-4">Complete 10 lifts focusing on neck exercises</p>
                    <div className="mt-auto text-sm font-medium text-neutral-500">In Progress</div>
                  </div>

                  {/* New: Jaw Master - Disabled */}
                  <div className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.focus}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">Jaw Master</h3>
                    <p className="text-sm text-neutral-500 mb-4">Complete 15 lifts focusing on jaw exercises</p>
                    <div className="mt-auto text-sm font-medium text-neutral-600">0/15 lifts</div>
                  </div>

                  {/* New: Face Sculptor - Disabled */}
                  <div className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 flex flex-col opacity-60 cursor-not-allowed">
                    <div className="w-10 h-10 mb-4">
                      {AchievementIcons.focus}
                    </div>
                    <h3 className="text-lg font-medium text-neutral-400 mb-2">Face Sculptor</h3>
                    <p className="text-sm text-neutral-500 mb-4">Complete 20 lifts focusing on facial sculpting</p>
                    <div className="mt-auto text-sm font-medium text-neutral-600">0/20 lifts</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-3">No lifts completed yet</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8">Complete your first lift to start tracking your progress</p>
              <Link 
                href="/dashboard/library" 
                className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Browse Lifts
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  } catch (err) {
    console.error('Error in ProgressPage:', err);
    return (
      <main className="pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-3">
              Unable to load progress data
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">
              Please try refreshing the page
            </p>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }
}

// Helper function to calculate weekly workout data
function getWeeklyWorkouts(completedWorkouts: UserWorkout[]) {
  const now = new Date();
  const weekData = [];

  // Generate last 4 weeks
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (i * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Count workouts in this week
    const count = completedWorkouts.filter(workout => {
      const workoutDate = new Date(workout.completed_at || workout.created_at);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    }).length;

    // Format week label as M/D
    const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

    weekData.push({ label, count });
  }

  return weekData;
} 