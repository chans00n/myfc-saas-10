import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import { getTodaysWorkout, getUserStreak } from '@/utils/supabase/database';
import Image from 'next/image';
import Link from 'next/link';
import InspirationQuote from '@/components/InspirationQuote';

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    // Check if user has a plan other than 'none'
    const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, data.user.email!))
    
    // If no user record found or plan is 'none', redirect to subscribe page
    if (!userRecord.length || userRecord[0].plan === 'none') {
        redirect('/subscribe')
    }

    // Get today's workout and user streak
    let todaysWorkout = null;
    let userStreak = null;
    const userName = data.user.email?.split('@')[0] || 'there';
    
    try {
        todaysWorkout = await getTodaysWorkout();
    } catch (err) {
        console.error('Error fetching today\'s workout:', err);
        // Continue without a workout
    }
    
    try {
        userStreak = await getUserStreak(data.user.id);
    } catch (err) {
        console.error('Error fetching user streak:', err);
        // Continue without streak info
    }

    // Sample workout stats (in a real app, these would come from the database)
    const dailyExercises = 5;
    const weeklyExercises = 3;
    const monthlyProgress = 2;

    // Sample completion rates (in a real app, these would come from the database)
    const dailyCompletionRate = 92;
    const weeklyCompletionRate = 85;
    const monthlyCompletionRate = 78;

    return (
        <main className="max-w-md mx-auto px-6 pb-24">
            {/* Welcome Section - Aligned horizontally */}
            <div className="mt-8 mb-6 flex justify-between items-center">
                <div>
                    <p className="text-neutral-500 text-sm">Welcome back</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{userName}</h1>
                </div>
                {/* We assume the avatar is coming from MYFCNavigation */}
            </div>

            {/* Today's Workout */}
            {todaysWorkout ? (
                <div className="rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-8">
                    <div className="relative">
                        {todaysWorkout.thumbnail_url ? (
                            <div className="relative h-48 w-full">
                                <Image 
                                    src={todaysWorkout.thumbnail_url} 
                                    alt={todaysWorkout.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60"></div>
                            </div>
                        ) : (
                            <div className="relative h-48 w-full bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center">
                                <span className="text-white text-4xl font-bold">MYFC</span>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50"></div>
                            </div>
                        )}
                        
                        <div className="p-6 relative z-10 bg-white dark:bg-neutral-800">
                            <p className="uppercase text-xs tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">TODAY'S LIFT</p>
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{todaysWorkout.title}</h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{todaysWorkout.description?.split('.')[0] || "Focus on your form and breathing during this workout"}</p>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{todaysWorkout.duration_minutes} min</span>
                                </div>
                                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    todaysWorkout.intensity === 'beginner' 
                                        ? 'bg-green-100 text-green-800' 
                                        : todaysWorkout.intensity === 'intermediate' 
                                            ? 'bg-amber-100 text-amber-800' 
                                            : 'bg-rose-100 text-rose-800'
                                }`}>
                                    {todaysWorkout.intensity.charAt(0).toUpperCase() + todaysWorkout.intensity.slice(1)}
                                </span>
                            </div>
                            <Link href={`/workout/${todaysWorkout.id}`} className="block w-full">
                                <button className="w-full bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-700 dark:hover:bg-neutral-600 text-white dark:text-neutral-800 font-medium py-3 rounded-lg transition duration-300">
                                    Start Workout
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl shadow-sm border border-neutral-100 overflow-hidden mb-8">
                    <div className="relative">
                        <div className="relative h-48 w-full bg-gradient-to-b from-neutral-500 to-neutral-700 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">MYFC</span>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50"></div>
                        </div>
                        
                        <div className="p-6 relative z-10 bg-white">
                            <p className="uppercase text-xs tracking-wide text-neutral-500 mb-2">TODAY'S LIFT</p>
                            <h2 className="text-xl font-semibold mb-2">No workout scheduled</h2>
                            <p className="text-neutral-600 text-sm mb-6">Check back tomorrow for a new exercise routine</p>
                            
                            <Link href="/dashboard/library" className="block w-full">
                                <button className="w-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-medium py-3 rounded-lg transition duration-300">
                                    Browse Workout Library
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Streak Display - Larger font */}
            <div className="mb-8">
                <h2 className="text-xl font-normal text-neutral-700">You have <span className="font-bold">{userStreak?.current_streak || 0} day streak</span> today</h2>
                
                {/* Statistics with simplified design */}
                <div className="mt-4">
                    <p className="text-sm text-neutral-500 mb-2">General tasks</p>
                    <div className="grid grid-cols-3 border-t border-b border-neutral-200 dark:border-neutral-800">
                        <div className="py-4 border-r border-neutral-200 dark:border-neutral-800">
                            <p className="text-4xl font-semibold">{dailyExercises}</p>
                            <p className="text-sm text-neutral-500 mt-1">Daily lifts</p>
                        </div>
                        <div className="py-4 px-4 border-r border-neutral-200 dark:border-neutral-800">
                            <p className="text-4xl font-semibold">{weeklyExercises}</p>
                            <p className="text-sm text-neutral-500 mt-1">Weekly plan</p>
                        </div>
                        <div className="py-4 px-4">
                            <p className="text-4xl font-semibold">{monthlyProgress}</p>
                            <p className="text-sm text-neutral-500 mt-1">Monthly goal</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Streak Visualization */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-neutral-600">Your lift streak this month</p>
                    <p className="text-sm font-semibold">{userStreak?.current_streak || 0} days</p>
                </div>
                
                <div className="h-4 flex space-x-1 mb-8">
                    {Array.from({ length: 30 }, (_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 h-full rounded-sm ${i < (userStreak?.current_streak || 0) ? 'bg-neutral-800' : 'bg-neutral-200'}`}
                        ></div>
                    ))}
                </div>
            </div>
            
            {/* Completion Rate */}
            <div className="mb-10">
                <p className="text-sm text-neutral-600 mb-2">Completion rate</p>
                
                <div className="grid grid-cols-3 border-t border-b border-neutral-200 dark:border-neutral-800">
                    <div className="py-4 border-r border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm text-neutral-500 mb-1">Daily</p>
                        <p className="text-4xl font-semibold">{dailyCompletionRate}%</p>
                    </div>
                    <div className="py-4 px-4 border-r border-neutral-200 dark:border-neutral-800">
                        <p className="text-sm text-neutral-500 mb-1">Weekly</p>
                        <p className="text-4xl font-semibold">{weeklyCompletionRate}%</p>
                    </div>
                    <div className="py-4 px-4">
                        <p className="text-sm text-neutral-500 mb-1">Monthly</p>
                        <p className="text-4xl font-semibold">{monthlyCompletionRate}%</p>
                    </div>
                </div>
            </div>
            
            {/* Quick Links */}
            <div className="grid grid-cols-1 gap-4">
                <Link href="/dashboard/history" className="flex justify-between items-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Previous Workouts</h3>
                        <p className="text-sm text-neutral-500">View your workout history</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
                
                <Link href="/dashboard/achievements" className="flex justify-between items-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">My Achievements</h3>
                        <p className="text-sm text-neutral-500">See your earned badges</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
                
                <Link href="/dashboard/progress" className="flex justify-between items-center p-4 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">My Progress</h3>
                        <p className="text-sm text-neutral-500">Track your improvement</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>
            
            {/* Daily Inspiration Quote */}
            <InspirationQuote />
        </main>
    )
}