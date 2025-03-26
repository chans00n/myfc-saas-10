import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getMovementsLibrary, getFocusAreas } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Link from 'next/link';
import MovementLibraryClient from './MovementLibraryClient';

export default async function MovementLibraryPage({
  searchParams
}: {
  searchParams: { 
    page?: string;
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
  const focusAreaFilter = searchParams.focus || null;
  const searchQuery = searchParams.q || null;

  // Get focus areas for filter options
  const focusAreas = await getFocusAreas();
  
  // Find focus area ID if a focus area name is provided
  let focusAreaId = null;
  if (focusAreaFilter) {
    const matchingFocusArea = focusAreas.find(area => area.name === focusAreaFilter);
    focusAreaId = matchingFocusArea?.id || null;
  }

  // Get movements with filters
  const { data: movements, count = 0, totalPages = 0 } = await getMovementsLibrary({
    page,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
    focusAreaId: focusAreaFilter,
    search: searchQuery
  });

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Master your facial techniques</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">Movement Library</h1>
                </div>
            </div>
      
      {/* Pass all data to the client component for interactive features */}
      <MovementLibraryClient 
        initialMovements={movements}
        totalMovements={count}
        totalPages={totalPages}
        currentPage={page}
        currentSort="name"
        currentOrder="asc"
        currentDifficulty={null}
        currentFocusArea={focusAreaFilter}
        currentSearch={searchQuery}
        focusAreas={focusAreas}
      />
    </main>
  );
} 