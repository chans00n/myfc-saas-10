"use client";

import { WorkoutForm } from '@/components/admin/WorkoutForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, RefreshCw, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FocusArea, Movement, Workout } from '@/types/database';
import { useParams, useRouter } from 'next/navigation';

export default function EditWorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const workoutId = params.id as string;
  
  // Add a refresh counter to force component remount
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [workoutData, setWorkoutData] = useState<Workout | null>(null);
  const [workoutMovements, setWorkoutMovements] = useState<any[]>([]);
  const [workoutFocusAreas, setWorkoutFocusAreas] = useState<FocusArea[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Function to fetch workout data with timestamp for cache busting
  const fetchWorkoutData = async (forceRefresh = false) => {
    try {
      setIsRefreshing(forceRefresh);
      
      // Add timestamp to URL for cache busting
      const timestamp = new Date().getTime();
      console.log(`Fetching fresh data at ${new Date().toISOString()} with timestamp ${timestamp}`);
      
      // Clear previous data first if force refreshing
      if (forceRefresh) {
        setWorkoutData(null);
        setWorkoutMovements([]);
        setWorkoutFocusAreas([]);
      }
      
      // Fetch resources with no-cache headers
      const resourcesResponse = await fetch(`/api/admin/workouts/resources?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!resourcesResponse.ok) {
        throw new Error('Failed to load resources');
      }
      
      const resourcesData = await resourcesResponse.json();
      setFocusAreas(resourcesData.focusAreas);
      setMovements(resourcesData.movements);
      
      // Fetch workout details with cache busting and no-cache headers
      const workoutResponse = await fetch(`/api/admin/workouts/${workoutId}?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!workoutResponse.ok) {
        if (workoutResponse.status === 404) {
          throw new Error('Workout not found');
        }
        throw new Error('Failed to load workout');
      }
      
      const workoutDetails = await workoutResponse.json();
      console.log('Fresh workout data received:', workoutDetails.workout);
      
      setWorkoutData(workoutDetails.workout);
      setWorkoutMovements(workoutDetails.movements);
      setWorkoutFocusAreas(workoutDetails.focusAreas);
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading data');
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Function to manually refresh data with full reload
  const handleRefresh = () => {
    // Force a hard refresh
    setRefreshCounter(prev => prev + 1);
    
    // Clear state
    setWorkoutData(null);
    setWorkoutMovements([]);
    setWorkoutFocusAreas([]);
    
    // Show loading
    setIsLoading(true);
    
    // Fetch new data
    fetchWorkoutData(true);
  };
  
  // Function for hard refresh redirecting to the same page
  const handleHardRefresh = () => {
    // Clear browser cache by forcing navigation
    const currentUrl = window.location.href;
    router.push('/admin/workouts');
    setTimeout(() => {
      router.push(currentUrl + '?t=' + new Date().getTime());
    }, 100);
  };
  
  // Function for completely clearing browser cache and reloading
  const handleFullClearAndReload = () => {
    if (typeof window !== 'undefined') {
      // Show loading message
      setIsRefreshing(true);
      
      // Force a complete cache clear and reload
      window.location.href = `${window.location.pathname}?forceClear=${Date.now()}`;
    }
  };
  
  useEffect(() => {
    fetchWorkoutData();
    // Include refreshCounter in dependencies to re-fetch when it changes
  }, [workoutId, refreshCounter]);
  
  // If workout not found, redirect or show error
  if (!isLoading && !workoutData && !error) {
    router.push('/admin/workouts');
    return null;
  }
  
  return (
    <div className="container py-10" key={`workout-container-${refreshCounter}`}>
      <div className="mb-8 flex justify-between">
        <div>
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href="/admin/workouts">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Workouts
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Edit Workout</h1>
          {workoutData && (
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              Update workout: {workoutData.title}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="h-9"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleHardRefresh}
            className="h-9"
          >
            Force Reload
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleFullClearAndReload}
            className="h-9"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Clear Cache & Reload
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="py-12 text-center">Loading workout data...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : workoutData ? (
        <WorkoutForm 
          focusAreas={focusAreas} 
          movements={movements}
          workoutData={workoutData}
          workoutMovements={workoutMovements}
          workoutFocusAreas={workoutFocusAreas}
          isEditing
          key={`workout-form-${refreshCounter}`}
        />
      ) : null}
    </div>
  );
} 