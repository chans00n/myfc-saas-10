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
      console.log('[BOOKMARK] Starting to fetch all bookmarks');
      setIsLoading(true);
      const timestamp = Date.now(); // Add cache-busting parameter
      const response = await fetch(`/api/bookmarks/all?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BOOKMARK] Failed to fetch bookmarks: Status ${response.status}`, errorText);
        return;
      }
      
      const data = await response.json();
      console.log('[BOOKMARK] Received bookmark data:', data);
      setBookmarkedWorkouts(data.bookmarkedWorkoutIds || []);
      console.log('[BOOKMARK] Updated bookmarkedWorkouts state:', data.bookmarkedWorkoutIds || []);
    } catch (error) {
      console.error('[BOOKMARK] Error fetching bookmarks:', error);
    } finally {
      setIsLoading(false);
      console.log('[BOOKMARK] Finished loading bookmarks');
    }
  };

  // Initialize on mount
  useEffect(() => {
    console.log('[BOOKMARK] Provider mounted, fetching bookmarks');
    fetchAllBookmarks();
  }, []);

  // Check if a workout is bookmarked
  const isBookmarked = (workoutId: number): boolean => {
    const result = bookmarkedWorkouts.includes(workoutId);
    console.log(`[BOOKMARK] Checking if workout ${workoutId} is bookmarked:`, result);
    return result;
  };

  // Toggle bookmark status
  const toggleBookmark = async (workoutId: number): Promise<boolean> => {
    console.log(`[BOOKMARK] Toggling bookmark for workout ${workoutId}`);
    try {
      const timestamp = Date.now(); // Add cache-busting parameter
      console.log(`[BOOKMARK] Sending POST request to /api/bookmarks for workout ${workoutId}`);
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ 
          workoutId: String(workoutId),
          _t: timestamp // Add timestamp to prevent caching
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BOOKMARK] Failed to toggle bookmark: Status ${response.status}`, errorText);
        throw new Error(`Failed to toggle bookmark: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log(`[BOOKMARK] Toggle response:`, data);
      
      // Update local state based on the response
      if (data.isBookmarked) {
        console.log(`[BOOKMARK] Adding workout ${workoutId} to bookmarks`);
        setBookmarkedWorkouts(prev => {
          const newState = [...prev, workoutId];
          console.log('[BOOKMARK] New bookmarked workouts state:', newState);
          return newState;
        });
      } else {
        console.log(`[BOOKMARK] Removing workout ${workoutId} from bookmarks`);
        setBookmarkedWorkouts(prev => {
          const newState = prev.filter(id => id !== workoutId);
          console.log('[BOOKMARK] New bookmarked workouts state:', newState);
          return newState;
        });
      }

      return data.isBookmarked;
    } catch (error) {
      console.error('[BOOKMARK] Error toggling bookmark:', error);
      return isBookmarked(workoutId); // Return current state if there's an error
    }
  };

  // Refresh all bookmarks
  const refreshBookmarks = async () => {
    console.log('[BOOKMARK] Manually refreshing all bookmarks');
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
    console.log(`[BOOKMARK] Hook for workout ${workoutId} initialized. Is bookmarked:`, isBookmarked(workoutId));
    
    return {
      isLoading,
      isBookmarked: isBookmarked(workoutId),
      toggleBookmark: () => toggleBookmark(workoutId),
    };
  }

  // Return the full context for components that need access to all bookmarks
  return context;
} 