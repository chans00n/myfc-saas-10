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
  return (
    <Link
      href={`/workout/${workout.id}`}
      className="flex flex-col h-full relative rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all"
    >
      <div className="relative w-full h-52 sm:h-72">
        {workout.thumbnail_url ? (
          <Image
            src={workout.thumbnail_url}
            alt={workout.title}
            fill
            sizes={getImageSizes('hero')}
            placeholder="blur"
            blurDataURL={getPlaceholderImage('indigo')}
            className="object-cover"
            quality={75}
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">MYFC</span>
          </div>
        )}
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
        
        {/* Add bookmark button in top right corner */}
        <div className="absolute top-3 right-3 z-10">
          <CardBookmarkButton workoutId={workout.id} size="md" />
        </div>
        
        {label && (
          <div className="absolute top-3 left-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
            {label}
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-200 transition-colors">
            {workout.title}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
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
                {workout.duration_minutes} min
              </span>
              
              <span className="flex items-center bg-white/20 px-2 py-1 rounded text-xs">
                {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
              </span>
            </div>
            
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1 rounded-full transition"
              aria-label="Start workout"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
} 