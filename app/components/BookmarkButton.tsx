'use client';

import { useWorkoutBookmark } from '@/hooks/useWorkoutBookmark';
import clsx from 'clsx';
import { useEffect } from 'react';

interface BookmarkButtonProps {
  workoutId: string | number;
  className?: string;
}

export default function BookmarkButton({ workoutId, className }: BookmarkButtonProps) {
  console.log(`[DETAIL_BOOKMARK] Rendering BookmarkButton for workout ${workoutId}, type: ${typeof workoutId}`);
  
  // Use the original workoutId without parsing
  const { isBookmarked, isLoading, toggleBookmark } = useWorkoutBookmark(workoutId);
  
  useEffect(() => {
    console.log(`[DETAIL_BOOKMARK] Effect: workout ${workoutId} isBookmarked=${isBookmarked}, isLoading=${isLoading}`);
  }, [workoutId, isBookmarked, isLoading]);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add more explicit debugging
    console.log(`[DETAIL_BOOKMARK] Button clicked for workout ${workoutId}, current status: ${isBookmarked}`);
    console.log(`[DETAIL_BOOKMARK] Button state: isLoading=${isLoading}, disabled=${isLoading}`);
    
    // Only proceed if not already loading
    if (isLoading) {
      console.log(`[DETAIL_BOOKMARK] Ignoring click because button is in loading state`);
      return;
    }
    
    // Make the API call
    toggleBookmark().then(newStatus => {
      console.log(`[DETAIL_BOOKMARK] Toggle result for workout ${workoutId}: ${newStatus}`);
    }).catch(err => {
      console.error(`[DETAIL_BOOKMARK] Error toggling bookmark for workout ${workoutId}:`, err);
    });
  };

  return (
    <button
      onClick={handleToggleBookmark}
      className={clsx(
        'text-white hover:text-indigo-200 transition',
        className
      )}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      disabled={isLoading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8"
        fill={isBookmarked ? 'currentColor' : 'none'}
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
    </button>
  );
} 