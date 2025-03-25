"use client";

import { WorkoutForm } from '@/components/admin/WorkoutForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FocusArea, Movement } from '@/types/database';

export default function CreateWorkoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchResources() {
      try {
        const response = await fetch('/api/admin/workouts/resources');
        
        if (!response.ok) {
          throw new Error('Failed to load resources');
        }
        
        const data = await response.json();
        setFocusAreas(data.focusAreas);
        setMovements(data.movements);
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading resources');
        console.error('Error loading resources:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchResources();
  }, []);
  
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" className="mb-2" asChild>
          <Link href="/admin/workouts">
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Workouts
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Create New Workout</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Fill out the form below to create a new workout
        </p>
      </div>
      
      {isLoading ? (
        <div className="py-12 text-center">Loading resources...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : (
        <WorkoutForm 
          focusAreas={focusAreas} 
          movements={movements} 
        />
      )}
    </div>
  );
} 