'use client';

import { useWorkoutBookmark } from '@/hooks/useWorkoutBookmark';
import clsx from 'clsx';

interface BookmarkButtonProps {
  workoutId: string | number;
  className?: string;
}

export default function BookmarkButton({ workoutId, className }: BookmarkButtonProps) {
  const workoutIdNumber = typeof workoutId === 'string' ? parseInt(workoutId, 10) : workoutId;
  const { isBookmarked, isLoading, toggleBookmark } = useWorkoutBookmark(workoutIdNumber);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark();
      }}
      className={clsx(
        'text-white hover:text-indigo-200 transition',
        className
      )}
      aria-label={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
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