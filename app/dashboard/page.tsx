import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import { getTodaysWorkout, getUserStreak, getPopularWorkouts } from '@/utils/supabase/database';
import Image from 'next/image';
import Link from 'next/link';
import InspirationQuote from '@/components/InspirationQuote';
import WorkoutCarousel from '@/components/WorkoutCarousel';
import { Workout } from '@/types/database';
import FeaturedWorkoutCard from '@/app/components/dashboard/FeaturedWorkoutCard';
import StreakDisplay from '@/app/components/dashboard/StreakDisplay';
import QuickLinks from '@/app/components/dashboard/QuickLinks';

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
    let popularWorkouts: Workout[] = [];
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
    
    try {
        popularWorkouts = await getPopularWorkouts(5);
    } catch (err) {
        console.error('Error fetching popular workouts:', err);
        // Continue without popular workouts
    }

    return (
        <main className="max-w-md mx-auto px-4 pb-24">
            {/* Welcome Section */}
            <div className="mt-8 mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Welcome back</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{userName}</h1>
                </div>
                {/* Avatar handled by the navigation component */}
            </div>

            {/* Today's Workout */}
            {todaysWorkout ? (
                <FeaturedWorkoutCard workout={todaysWorkout} />
            ) : (
                <div className="rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden mb-8 bg-white dark:bg-neutral-800">
                    <div className="relative">
                        <div className="relative h-48 w-full bg-gradient-to-br from-neutral-400 to-neutral-600 dark:from-neutral-700 dark:to-neutral-900 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">MYFC</span>
                        </div>
                        
                        <div className="p-6">
                            <p className="uppercase text-xs tracking-wide text-neutral-500 dark:text-neutral-400 mb-2">TODAY'S LIFT</p>
                            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">No workout scheduled</h2>
                            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-6">Check back tomorrow for a new exercise routine</p>
                            
                            <Link href="/dashboard/library" className="block w-full">
                                <button className="w-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 font-medium py-3 rounded-lg transition duration-300">
                                    Browse Workout Library
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Streak Display */}
            <StreakDisplay streak={userStreak} />
            
            {/* Popular Workouts Carousel */}
            {popularWorkouts.length > 0 && (
                <WorkoutCarousel 
                    workouts={popularWorkouts} 
                    title="Recommended for You" 
                />
            )}
            
            {/* Quick Links */}
            <QuickLinks />
            
            {/* Daily Inspiration Quote */}
            <InspirationQuote />
        </main>
    )
}