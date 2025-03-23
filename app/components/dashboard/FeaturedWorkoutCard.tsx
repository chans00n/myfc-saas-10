import Link from 'next/link';
import Image from 'next/image';
import { Workout } from '@/types/database';
import CardBookmarkButton from '@/app/components/CardBookmarkButton';
import { getImageSizes, getPlaceholderImage } from '@/utils/image-helpers';

interface FeaturedWorkoutCardProps {
  workout: Workout;
  label?: string;
}

export default function FeaturedWorkoutCard({ workout, label }: FeaturedWorkoutCardProps) {
  // Format today's date: Month, date, year
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 mb-8 transform transition-all duration-300 hover:shadow-xl">
      {/* Header with Today's Workout Label */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 dark:from-indigo-700 dark:to-indigo-900 px-6 py-3 flex justify-between items-center">
        <h2 className="text-white font-medium tracking-wide text-sm uppercase flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Today's Workout
        </h2>
        <span className="text-white text-sm font-medium">{formattedDate}</span>
      </div>

      {/* Main Content */}
      <div className="md:flex">
        {/* Workout Image */}
        <div className="relative h-60 md:h-auto md:w-2/5">
          {workout.thumbnail_url ? (
            <Image
              src={workout.thumbnail_url}
              alt={workout.title}
              fill
              sizes={getImageSizes('hero')}
              placeholder="blur"
              blurDataURL={getPlaceholderImage('indigo')}
              className="object-cover"
              quality={85}
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">MYFC</span>
            </div>
          )}
          
          {/* Bookmark button */}
          <div className="absolute top-3 right-3 z-10">
            <CardBookmarkButton workoutId={workout.id} size="md" />
          </div>
        </div>
        
        {/* Workout Details */}
        <div className="p-6 md:w-3/5 flex flex-col">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              {workout.title}
            </h3>
            
            <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
              {workout.description}
            </p>
            
            {/* Workout Metadata */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400"
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
                <span className="font-medium">{workout.duration_minutes} minutes</span>
              </div>
              
              <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="capitalize font-medium">{workout.intensity}</span>
              </div>
              
              <div className="flex items-center text-neutral-700 dark:text-neutral-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-500 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="capitalize font-medium">Focus Areas</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-auto">
            <Link href={`/workout/${workout.id}`} className="sm:flex-1">
              <button className="w-full bg-white hover:bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 font-medium py-3 px-5 rounded-lg border border-neutral-300 dark:border-neutral-600 transition duration-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Details
              </button>
            </Link>
            
            <Link href={`/workout/${workout.id}/start`} className="sm:flex-1">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 text-white font-medium py-3 px-5 rounded-lg transition duration-300 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Workout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 