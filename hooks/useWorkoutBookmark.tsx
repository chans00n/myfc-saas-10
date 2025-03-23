'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';

// Type for workout ID (can be string or number)
type WorkoutId = string | number;

// Type for the bookmark context
type BookmarkContextType = {
  bookmarkedWorkouts: WorkoutId[];
  isLoading: boolean;
  refreshBookmarks: () => Promise<void>;
  isBookmarked: (workoutId: WorkoutId) => boolean;
  toggleBookmark: (workoutId: WorkoutId) => Promise<boolean>;
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
  const [bookmarkedWorkouts, setBookmarkedWorkouts] = useState<WorkoutId[]>([]);
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
  const isBookmarked = (workoutId: WorkoutId): boolean => {
    // Normalize the target workout ID
    const workoutIdStr = String(workoutId).trim();
    
    // Additional debugging
    console.log(`[BOOKMARK] isBookmarked check for: "${workoutIdStr}" (${typeof workoutId})`);
    console.log(`[BOOKMARK] Current bookmarks array length: ${bookmarkedWorkouts.length}`);
    
    // For debugging, log each bookmark and comparison result
    if (bookmarkedWorkouts.length > 0) {
      console.log(`[BOOKMARK] Detailed comparison for ${workoutIdStr}:`);
      bookmarkedWorkouts.forEach((id, index) => {
        const idStr = String(id).trim();
        const matches = idStr === workoutIdStr;
        console.log(`[BOOKMARK] - Compare [${index}]: "${idStr}" === "${workoutIdStr}" => ${matches}`);
      });
    }
    
    // Check if any bookmark matches the ID
    const result = bookmarkedWorkouts.some(id => {
      const idStr = String(id).trim();
      return idStr === workoutIdStr;
    });
    
    console.log(`[BOOKMARK] Final isBookmarked result for ${workoutIdStr}: ${result}`);
    return result;
  };

  // Toggle bookmark status
  const toggleBookmark = async (workoutId: WorkoutId): Promise<boolean> => {
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
          const newState = prev.filter(id => String(id) !== String(workoutId));
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

// Hook to use in components
export function useWorkoutBookmark(workoutId?: WorkoutId) {
  const context = useContext(BookmarkContext);
  const [loading, setLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  if (!context) {
    throw new Error('useWorkoutBookmark must be used within a BookmarkProvider');
  }
  
  // Get the current state from context
  const { bookmarkedWorkouts, isLoading: contextLoading, isBookmarked, toggleBookmark: contextToggle } = context;

  // Check if this specific workout is bookmarked - runs when workoutId or bookmarkedWorkouts changes
  useEffect(() => {
    if (workoutId !== undefined) {
      console.log(`[BOOKMARK] Hook for workout ${workoutId} initialized. Is bookmarked:`, isBookmarked(workoutId));
      setBookmarked(isBookmarked(workoutId));
    }
  }, [workoutId, bookmarkedWorkouts]); // Depend on bookmarkedWorkouts to update when they change

  // Wrapper for toggle function that sets local loading state
  const toggleBookmark = useCallback(async () => {
    if (workoutId === undefined) {
      console.warn('[BOOKMARK] Cannot toggle bookmark: workoutId is undefined');
      return false;
    }
    
    try {
      setLoading(true);
      const result = await contextToggle(workoutId);
      setBookmarked(result);
      return result;
    } catch (error) {
      console.error('[BOOKMARK] Error in toggleBookmark:', error);
      return bookmarked; // Return current state if error
    } finally {
      setLoading(false);
    }
  }, [workoutId, contextToggle, bookmarked]);

  return {
    isBookmarked: bookmarked,
    isLoading: loading || contextLoading,
    toggleBookmark
  };
} 