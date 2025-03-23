'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';

// Type for the bookmark context
type BookmarkContextType = {
  bookmarkedWorkouts: number[];
  isLoading: boolean;
  refreshBookmarks: () => Promise<void>;
  isBookmarked: (workoutId: number) => boolean;
  toggleBookmark: (workoutId: number) => Promise<boolean>;
};

// Type for the single workout bookmark return type
type SingleWorkoutBookmarkType = {
  isLoading: boolean;
  isBookmarked: boolean;
  toggleBookmark: () => Promise<boolean>;
};

// Create context with default values
const BookmarkContext = createContext<BookmarkContextType>({
  bookmarkedWorkouts: [],
  isLoading: true,
  refreshBookmarks: async () => {},
  isBookmarked: () => false,
  toggleBookmark: async () => false,
});

// Provider component
export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedWorkouts, setBookmarkedWorkouts] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all bookmarks once on mount
  const fetchAllBookmarks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/bookmarks/all');
      
      if (!response.ok) {
        console.error('Failed to fetch bookmarks');
        return;
      }
      
      const data = await response.json();
      setBookmarkedWorkouts(data.bookmarkedWorkoutIds || []);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchAllBookmarks();
  }, []);

  // Check if a workout is bookmarked
  const isBookmarked = (workoutId: number): boolean => {
    return bookmarkedWorkouts.includes(workoutId);
  };

  // Toggle bookmark status
  const toggleBookmark = async (workoutId: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/bookmarks?workoutId=${workoutId}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle bookmark');
      }

      const data = await response.json();
      
      // Update local state based on the response
      if (data.isBookmarked) {
        setBookmarkedWorkouts(prev => [...prev, workoutId]);
      } else {
        setBookmarkedWorkouts(prev => prev.filter(id => id !== workoutId));
      }

      return data.isBookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return isBookmarked(workoutId); // Return current state if there's an error
    }
  };

  // Refresh all bookmarks
  const refreshBookmarks = async () => {
    await fetchAllBookmarks();
  };

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    bookmarkedWorkouts,
    isLoading,
    refreshBookmarks,
    isBookmarked,
    toggleBookmark,
  }), [bookmarkedWorkouts, isLoading]);

  return (
    <BookmarkContext.Provider value={contextValue}>
      {children}
    </BookmarkContext.Provider>
  );
}

// Hook for components to consume the bookmark context
export function useWorkoutBookmark(): BookmarkContextType;
export function useWorkoutBookmark(workoutId: number): SingleWorkoutBookmarkType;
export function useWorkoutBookmark(workoutId?: number): BookmarkContextType | SingleWorkoutBookmarkType {
  const context = useContext(BookmarkContext);
  
  if (!context) {
    throw new Error('useWorkoutBookmark must be used within a BookmarkProvider');
  }

  // For backward compatibility with existing components
  if (workoutId !== undefined) {
    const { isLoading, isBookmarked, toggleBookmark } = context;
    
    return {
      isLoading,
      isBookmarked: isBookmarked(workoutId),
      toggleBookmark: () => toggleBookmark(workoutId),
    };
  }

  // Return the full context for components that need access to all bookmarks
  return context;
} 