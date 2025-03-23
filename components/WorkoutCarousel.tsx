"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Workout } from '@/types/database';
import CardBookmarkButton from '@/app/components/CardBookmarkButton';

interface WorkoutCarouselProps {
  workouts: Workout[];
  title?: string;
}

export default function WorkoutCarousel({ workouts, title = "Popular Workouts" }: WorkoutCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Required min distance for a swipe (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex < workouts.length - 1) {
      setCurrentIndex(prevIndex => prevIndex + 1);
    } else if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prevIndex => prevIndex - 1);
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-scroll every 5 seconds if no user interaction
  useEffect(() => {
    const interval = setInterval(() => {
      if (workouts.length > 1) {
        setCurrentIndex(prevIndex => (prevIndex + 1) % workouts.length);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [workouts.length]);

  // No workouts to display
  if (!workouts.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium text-neutral-800 dark:text-neutral-200">{title}</h2>
        <Link href="/dashboard/library" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
          View All
        </Link>
      </div>
      
      <div 
        ref={carouselRef}
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {workouts.map((workout, index) => (
            <div key={workout.id} className="min-w-full">
              <Link href={`/workout/${workout.id}`}>
                <div className="relative rounded-xl overflow-hidden">
                  {/* Image/Thumbnail */}
                  <div className="relative h-64 w-full">
                    {workout.thumbnail_url ? (
                      <Image 
                        src={workout.thumbnail_url} 
                        alt={workout.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">MYFC</span>
                      </div>
                    )}
                    
                    {/* Bookmark button */}
                    <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
                      <CardBookmarkButton workoutId={workout.id} />
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    
                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 p-6 w-full">
                      {workout.intensity && (
                        <div className="mb-2">
                          <span className="text-xs uppercase tracking-wider px-2 py-1 bg-white/20 rounded-full text-white">
                            {workout.intensity}
                          </span>
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-white mb-1">{workout.title}</h3>
                      <div className="flex items-center text-white/90 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{workout.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        
        {/* Navigation dots */}
        {workouts.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {workouts.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index 
                    ? 'w-6 bg-neutral-800 dark:bg-neutral-200' 
                    : 'w-2 bg-neutral-300 dark:bg-neutral-600'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 