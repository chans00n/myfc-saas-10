import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import { getUserWorkoutHistory } from '@/utils/supabase/database';
import Image from 'next/image';
import { UserWorkout } from '@/types/database';

// No need to extend UserWorkout as it already includes workouts?: Workout
type WorkoutHistoryItem = UserWorkout;

export default async function WorkoutHistoryPage() {
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

    // Get user's workout history
    let workoutHistory: WorkoutHistoryItem[] = [];
    
    try {
        workoutHistory = await getUserWorkoutHistory(data.user.id) as WorkoutHistoryItem[];
    } catch (err) {
        console.error('Error fetching workout history:', err);
    }

    // Group workouts by month and year
    const groupedWorkouts = workoutHistory.reduce((acc, workout) => {
        if (!workout.completed) return acc;
        
        const completedDate = workout.completed_at ? new Date(workout.completed_at) : null;
        if (!completedDate) return acc;
        
        const monthYear = completedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        
        if (!acc[monthYear]) {
            acc[monthYear] = [];
        }
        
        acc[monthYear].push(workout);
        return acc;
    }, {} as Record<string, WorkoutHistoryItem[]>);

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <main className="container max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Your Workout History</h1>
            
            {Object.keys(groupedWorkouts).length > 0 ? (
                Object.entries(groupedWorkouts).map(([monthYear, workouts]) => (
                    <div key={monthYear} className="mb-8">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">{monthYear}</h2>
                        <div className="space-y-4">
                            {workouts.map((workout: WorkoutHistoryItem) => (
                                <div key={workout.id} className="bg-white rounded-lg shadow-sm p-4">
                                    <div className="flex flex-col md:flex-row md:items-center">
                                        <div className="md:w-1/4 mb-3 md:mb-0">
                                            {workout.workouts?.thumbnail_url ? (
                                                <div className="h-20 w-full md:h-24 md:w-24 relative rounded-md overflow-hidden">
                                                    <Image 
                                                        src={workout.workouts.thumbnail_url}
                                                        alt={workout.workouts.title || 'Workout thumbnail'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-20 w-full md:h-24 md:w-24 bg-gray-100 flex items-center justify-center rounded-md">
                                                    <span className="text-gray-400 text-sm">No image</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="md:w-3/4 md:pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-medium text-gray-900">{workout.workouts?.title || 'Unknown workout'}</h3>
                                                <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded">
                                                    Completed
                                                </span>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 mb-2">
                                                {workout.completed_at && (
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span>{formatDate(workout.completed_at)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-sm">
                                                <div className="flex flex-wrap">
                                                    <div className="flex items-center mr-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-gray-600">{workout.duration_taken || workout.workouts?.duration_minutes || '-'} minutes</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                                        </svg>
                                                        <span className="text-gray-600">{workout.workouts?.intensity || 'Normal'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <h2 className="text-xl font-medium text-gray-900 mb-2">No workout history yet</h2>
                    <p className="text-gray-600 mb-6">
                        Complete your first workout to start building your history!
                    </p>
                    <a href="/dashboard" className="inline-block">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                            Go to Today's Workout
                        </button>
                    </a>
                </div>
            )}
        </main>
    )
} 