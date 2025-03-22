import Link from 'next/link';
import Image from 'next/image';
import { Workout } from '@/types/database';

interface FeaturedWorkoutCardProps {
  workout: Workout;
  label?: string;
}

export default function FeaturedWorkoutCard({ 
  workout, 
  label = "TODAY'S LIFT" 
}: FeaturedWorkoutCardProps) {
  return (
    <div className="relative rounded-xl overflow-hidden mb-8 shadow-sm bg-white dark:bg-neutral-800">
      <div className="relative">
        <div className="relative h-56 w-full">
          {workout.thumbnail_url ? (
            <Image 
              src={workout.thumbnail_url} 
              alt={workout.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">MYFC</span>
            </div>
          )}
          
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 p-6 w-full">
            <p className="uppercase tracking-wide text-xs font-medium text-white/80 mb-2">{label}</p>
            <h2 className="text-2xl font-bold text-white mb-2">{workout.title}</h2>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-white/90">{workout.duration_minutes} min</span>
              </div>
              
              <span className={`text-xs px-3 py-1 rounded-full font-medium 
                ${workout.intensity === 'beginner' 
                  ? 'bg-green-500/20 text-green-100' 
                  : workout.intensity === 'intermediate' 
                    ? 'bg-amber-500/20 text-amber-100' 
                    : 'bg-rose-500/20 text-rose-100'
                }`}>
                {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
              </span>
            </div>
            
            <Link href={`/workout/${workout.id}`} className="block">
              <button className="w-full bg-white hover:bg-white/90 text-neutral-900 font-medium py-3 rounded-lg transition duration-300">
                Start Workout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 