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

// Add a debounce function to prevent multiple rapid API calls
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(() => {
        resolve(func(...args));
        timeout = null;
      }, waitFor);
    });
  };
};

// Provider component
export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedWorkouts, setBookmarkedWorkouts] = useState<WorkoutId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Fetch all bookmarks once on mount
  const fetchAllBookmarks = async (): Promise<void> => {
    // If we've fetched within the last 2 seconds, skip this fetch
    const now = Date.now();
    if (now - lastFetchTime < 2000) {
      return;
    }
    
    try {
      setIsLoading(true);
      setLastFetchTime(now);
      
      const timestamp = Date.now(); // Add cache-busting parameter
      const response = await fetch(`/api/bookmarks/all?_t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch bookmarks: Status ${response.status}`, errorText);
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

  // Initialize on mount - only once
  useEffect(() => {
    fetchAllBookmarks();
    // No dependencies means this only runs once on mount
  }, []);

  // Check if a workout is bookmarked
  const isBookmarked = useCallback((workoutId: WorkoutId): boolean => {
    // Normalize the target workout ID
    const workoutIdStr = String(workoutId).trim();
    
    // Check if any bookmark matches the ID
    return bookmarkedWorkouts.some(id => String(id).trim() === workoutIdStr);
  }, [bookmarkedWorkouts]);

  // Toggle bookmark status with explicit typing
  const toggleBookmarkImpl = async (workoutId: WorkoutId): Promise<boolean> => {
    try {
      const timestamp = Date.now();
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ 
          workoutId: String(workoutId),
          _t: timestamp
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to toggle bookmark: Status ${response.status}`, errorText);
        throw new Error(`Failed to toggle bookmark: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      // Update local state based on the response
      if (data.isBookmarked) {
        setBookmarkedWorkouts(prev => {
          const newState = [...prev, workoutId];
          return newState;
        });
      } else {
        setBookmarkedWorkouts(prev => {
          const newState = prev.filter(id => String(id) !== String(workoutId));
          return newState;
        });
      }

      return data.isBookmarked;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return isBookmarked(workoutId); // Return current state if there's an error
    }
  };
  
  // Create a properly typed wrapper for toggleBookmark
  const toggleBookmark = useCallback(async (workoutId: WorkoutId): Promise<boolean> => {
    // Apply debounce but correctly handle the Promise<boolean> return type
    const debouncedToggle = debounce(toggleBookmarkImpl, 300);
    return await debouncedToggle(workoutId);
  }, [isBookmarked]);

  // Refresh all bookmarks - with proper Promise<void> return type
  const refreshBookmarks = useCallback(async (): Promise<void> => {
    const debouncedRefresh = debounce(fetchAllBookmarks, 300);
    await debouncedRefresh();
  }, []);

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    bookmarkedWorkouts,
    isLoading,
    refreshBookmarks,
    isBookmarked,
    toggleBookmark,
  }), [bookmarkedWorkouts, isLoading, refreshBookmarks, isBookmarked, toggleBookmark]);

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

  // Check if this specific workout is bookmarked - memoized to reduce unnecessary updates
  useEffect(() => {
    if (workoutId !== undefined) {
      const newState = isBookmarked(workoutId);
      // Only update state if it actually changed
      if (newState !== bookmarked) {
        setBookmarked(newState);
      }
    }
  }, [workoutId, bookmarkedWorkouts, isBookmarked, bookmarked]);

  // Wrapper for toggle function that sets local loading state
  const toggleBookmark = useCallback(async () => {
    if (workoutId === undefined) {
      console.warn('Cannot toggle bookmark: workoutId is undefined');
      return false;
    }
    
    try {
      setLoading(true);
      const result = await contextToggle(workoutId);
      setBookmarked(result);
      return result;
    } catch (error) {
      console.error('Error in toggleBookmark:', error);
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