import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getUserBookmarks } from '@/utils/supabase/database';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export default async function BookmarksPage() {
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

  const bookmarks = await getUserBookmarks(data.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-6 flex justify-between items-center">
                <div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Save your favorite lifts for quick access</p>
                    <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100">MYFC Bookmarks</h1>
                </div>
            </div>


      {bookmarks.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 text-center shadow-sm">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-indigo-600 dark:text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-neutral-800 dark:text-neutral-100 mb-2">
            No bookmarked workouts yet
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            When you find workouts you want to save for later, tap the bookmark icon to add them here.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Browse Workouts
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="group">
              {bookmark.workouts && (
                <Link href={`/workout/${bookmark.workout_id}`}>
                  <div className="relative overflow-hidden rounded-xl bg-white dark:bg-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-52 w-full">
                      {bookmark.workouts.thumbnail_url ? (
                        <Image
                          src={bookmark.workouts.thumbnail_url}
                          alt={bookmark.workouts.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60"></div>
                      <div className="absolute top-3 left-3 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 text-xs font-medium text-white">
                        {bookmark.workouts.intensity.charAt(0).toUpperCase() + bookmark.workouts.intensity.slice(1)}
                      </div>
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-white/15 backdrop-blur-md rounded-full px-3 py-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-white">{bookmark.workouts.duration_minutes} min</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {bookmark.workouts.title}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {bookmark.workouts.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 