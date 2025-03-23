import Link from 'next/link';

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      <Link href="/dashboard/history" className="flex flex-col items-center p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 text-center">Workout History</h3>
      </Link>
      
      <Link href="/dashboard/achievements" className="flex flex-col items-center p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
        <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 text-center">Achievements</h3>
      </Link>
      
      <Link href="/dashboard/progress" className="flex flex-col items-center p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
        <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 text-center">Progress</h3>
      </Link>
      
      <Link href="/dashboard/library" className="flex flex-col items-center p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
        <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 text-center">All Workouts</h3>
      </Link>
      
      {/* Bookmarks Section */}
      <Link href="/dashboard/bookmarks" className="flex flex-col items-center p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </div>
        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 text-center">Bookmarks</h3>
      </Link>
      
      {/* Leaders Section */}
      <Link href="/leaderboards" className="flex flex-col items-center p-5 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-300">
        <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-lg mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 text-center">Leaders</h3>
      </Link>
    </div>
  );
} 