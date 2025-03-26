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
import { dynamic } from '../config'

/**
 * Returns a random encouraging message for the user
 */
function getRandomGreeting(): string {
    const greetings = [
        "Ready to shine today",
        "Looking good",
        "Time to glow up",
        "Awesome to see you",
        "You've got this",
        "Let's crush today",
        "Hello gorgeous",
        "Great to see you",
        "Another day, another slay",
        "Hey fitness star",
        "Welcome to your day",
        "You're doing amazing",
        "Ready for greatness",
        "Looking fabulous",
        "Keep up the momentum",
        "Your commitment shows",
        "Consistency is key",
        "Your future self thanks you",
        "Making progress every day",
        "Champion in progress"
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
}

// Force dynamic rendering
export const revalidate = 0
export { dynamic }

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
    
    // Get a random greeting
    const greeting = getRandomGreeting();
    
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
        <main className="max-w-4xl mx-auto px-4 pb-24">
            {/* Welcome Section */}
            <div className="mt-8 mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{greeting}</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">{userName}</h1>
                </div>
                {/* Avatar handled by the navigation component */}
            </div>

            {/* Today's Workout */}
            <div className="mb-8">
                {todaysWorkout ? (
                    <FeaturedWorkoutCard workout={todaysWorkout} />
                ) : (
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                        <div className="text-center py-8">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto text-neutral-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="mt-4 text-xl font-medium text-neutral-900 dark:text-neutral-100">
                                No workout scheduled for today
                            </h3>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                                Check back later or explore our workout library to find something for today.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href="/dashboard/library"
                                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Browse Workouts
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Streak Display */}
            <StreakDisplay streak={userStreak} />
            
            {/* Popular Workouts Carousel */}
            <div className="mb-8">
                {popularWorkouts.length > 0 ? (
                    <WorkoutCarousel 
                        workouts={popularWorkouts} 
                        title="Recommended for You" 
                    />
                ) : (
                    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg p-6 border border-neutral-200 dark:border-neutral-700">
                        <p className="text-neutral-600 dark:text-neutral-400">No recommended workouts found.</p>
                    </div>
                )}
            </div>
            
            {/* Quick Links */}
            <QuickLinks />
            
            {/* Daily Inspiration Quote */}
            <InspirationQuote />
        </main>
    )
}