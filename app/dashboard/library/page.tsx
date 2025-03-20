import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getWorkoutsLibrary, getFocusAreas } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Link from 'next/link';
import WorkoutLibraryClient from './WorkoutLibraryClient';

export default async function WorkoutLibraryPage({
  searchParams
}: {
  searchParams: { 
    page?: string;
    view?: string;
    sort?: string;
    order?: string;
    intensity?: string;
    focus?: string;
    q?: string;
  }
}) {
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

  // Get and validate query parameters
  const page = parseInt(searchParams.page || '1', 10);
  const view = searchParams.view === 'calendar' ? 'calendar' : 'list';
  const sortBy = searchParams.sort || 'created_at';
  const sortOrder = searchParams.order === 'asc' ? 'asc' : 'desc';
  const intensityFilter = ['beginner', 'intermediate', 'advanced'].includes(searchParams.intensity || '') 
    ? searchParams.intensity as 'beginner' | 'intermediate' | 'advanced'
    : null;
  const focusAreaFilter = searchParams.focus || null;
  const searchQuery = searchParams.q || null;

  // Get workouts with filters
  const { data: workouts, count, totalPages } = await getWorkoutsLibrary({
    page,
    limit: 12,
    sortBy,
    sortOrder,
    intensity: intensityFilter,
    focusArea: focusAreaFilter,
    search: searchQuery
  });

  // Get focus areas for filter options
  const focusAreas = await getFocusAreas();

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Workout Library</h1>
        <p className="text-gray-600">Discover and explore our collection of workouts</p>
      </div>
      
      {/* Pass all data to the client component for interactive features */}
      <WorkoutLibraryClient 
        initialWorkouts={workouts}
        totalWorkouts={count}
        totalPages={totalPages}
        currentPage={page}
        currentView={view}
        currentSort={sortBy}
        currentOrder={sortOrder}
        currentIntensity={intensityFilter}
        currentFocusArea={focusAreaFilter}
        currentSearch={searchQuery}
        focusAreas={focusAreas}
      />
    </main>
  );
} 