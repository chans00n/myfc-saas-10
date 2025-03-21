import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getMovementById } from '@/utils/supabase/database';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from "drizzle-orm";
import Image from 'next/image';
import Link from 'next/link';
import { Movement } from '@/types/database';

// Extended interface for Movement with focus_area property
interface MovementWithFocusArea extends Movement {
  focus_area?: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
  };
}

export default async function MovementDetailPage({
  params
}: {
  params: { id: string }
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
  
  // Get the movement data
  const movement = await getMovementById(params.id) as MovementWithFocusArea;
  
  if (!movement) {
    // If movement not found, redirect to movements library
    redirect('/dashboard/movements');
  }

  // Helper to display difficulty with proper styling
  const getDifficultyLabel = (difficultyLevel: string | null) => {
    switch (difficultyLevel) {
      case 'beginner':
        return <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Beginner</span>;
      case 'intermediate':
        return <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Intermediate</span>;
      case 'advanced':
        return <span className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-sm font-medium">Advanced</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">All Levels</span>;
    }
  };

  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link 
          href="/dashboard/movements" 
          className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Movement Library
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{movement.name}</h1>
        
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {getDifficultyLabel(movement.difficulty_level)}
          {movement.focus_area && (
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {movement.focus_area.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Video or Image */}
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-hidden">
            {movement.video_url ? (
              <div className="aspect-video">
                <iframe
                  src={movement.video_url}
                  title={movement.name}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : movement.thumbnail_url ? (
              <div className="relative aspect-video">
                <Image
                  src={movement.thumbnail_url}
                  alt={movement.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center text-gray-400 dark:text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
            {movement.description ? (
              <p className="text-gray-700 dark:text-gray-300">{movement.description}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">No description available.</p>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Featured In */}
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Featured In Workouts</h2>
            <p className="text-gray-500 dark:text-gray-400">This movement appears in the following workouts.</p>
            
            {/* This would require a database query to get workouts that include this movement */}
            {/* For now, show placeholder content */}
            <div className="py-4">
              <p className="text-gray-500 dark:text-gray-400 italic">Workout integration coming soon.</p>
            </div>
          </div>
          
          {/* Focus Area Information */}
          {movement.focus_area && (
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Focus Area</h2>
              <div className="flex items-center gap-4 mb-4">
                {movement.focus_area.image_url ? (
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-neutral-700">
                    <Image
                      src={movement.focus_area.image_url}
                      alt={movement.focus_area.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-800 text-xl font-bold">{movement.focus_area.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{movement.focus_area.name}</h3>
                  {movement.focus_area.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{movement.focus_area.description}</p>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/movements?focus=${encodeURIComponent(movement.focus_area.name)}`}
                className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
              >
                See all movements for this area
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 