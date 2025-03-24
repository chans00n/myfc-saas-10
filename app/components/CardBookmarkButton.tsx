'use client';

import { useWorkoutBookmark } from '@/hooks/useWorkoutBookmark';
import clsx from 'clsx';
import { useEffect } from 'react';

interface CardBookmarkButtonProps {
  workoutId: string | number;
  className?: string;
  size?: 'sm' | 'md'; // Size variants
  lightMode?: boolean; // For cards with dark backgrounds
}

export default function CardBookmarkButton({ 
  workoutId, 
  className,
  size = 'md',
  lightMode = false
}: CardBookmarkButtonProps) {
  // Use the original workoutId without trying to convert it
  const { isBookmarked, isLoading, toggleBookmark } = useWorkoutBookmark(workoutId);

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only proceed if not already loading
    if (isLoading) {
      return;
    }
    
    // Make the API call
    toggleBookmark().catch(err => {
      console.error(`Error toggling bookmark for workout ${workoutId}:`, err);
    });
  };

  return (
    <button
      onClick={handleToggleBookmark}
      className={clsx(
        'transition rounded-full flex items-center justify-center',
        lightMode 
          ? 'text-neutral-800 hover:text-indigo-600' 
          : 'text-white hover:text-indigo-200',
        size === 'sm' ? 'h-6 w-6' : 'h-8 w-8',
        isLoading ? 'opacity-50' : 'opacity-100',
        className
      )}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      disabled={isLoading}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'}
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