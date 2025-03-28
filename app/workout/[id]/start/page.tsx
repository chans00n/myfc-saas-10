'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer';
import { featureEvents } from '@/lib/analytics/events';
import { Loading } from '@/components/ui/loading';
import { PullToRefresh } from '@/components/ui/pull-to-refresh';
import { useGestureNavigation } from '@/hooks/use-gesture-navigation';
import { haptics } from '@/utils/haptics';

// Sample video URLs for testing
const TEST_VIDEOS = [
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
];

export default function WorkoutStartPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [workout, setWorkout] = useState<any>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Use gesture navigation
  useGestureNavigation({
    onBack: handleBack,
    threshold: 70, // Slightly higher threshold for video content
  });

  const fetchWorkout = async () => {
    try {
      setIsLoading(true);
      haptics.trigger('light');
      
      // In a production app, this would fetch from your API
      const response = await fetch(`/api/workouts/${params.id}`);
      
      // If the API route doesn't exist or fails, use test data
      if (!response.ok) {
        // Create a mock workout with a random test video
        const randomVideo = TEST_VIDEOS[Math.floor(Math.random() * TEST_VIDEOS.length)];
        setWorkout({
          id: params.id,
          title: "Morning Face Refresher",
          video_url: randomVideo,
          type: 'facial',
          user_type: 'free'
        });
        return;
      }
      
      const data = await response.json();
      
      // If the workout has no video, use a test video
      if (!data.video_url) {
        data.video_url = TEST_VIDEOS[0];
      }
      
      setWorkout(data);
      haptics.trigger('success');
    } catch (error) {
      console.error('Error in fetchWorkout:', error);
      haptics.trigger('error');
      // Still provide a fallback experience with a test video
      setWorkout({
        id: params.id,
        title: "Morning Face Refresher",
        video_url: TEST_VIDEOS[0],
        type: 'facial',
        user_type: 'free'
      });
    } finally {
      // Add a small delay to make the transition smoother
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  useEffect(() => {
    fetchWorkout();
  }, [params.id]);

  // Track workout start when the page loads
  useEffect(() => {
    if (workout) {
      featureEvents.startWorkout(workout.type || 'facial', workout.title, workout.user_type || 'free');
      setStartTime(Date.now());
      haptics.trigger('medium');
    }
  }, [workout]);

  // Handle closing the video and going back
  function handleBack() {
    haptics.trigger('light');
    // Track workout completion if it was started
    if (startTime && workout) {
      const duration = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      featureEvents.completeWorkout(workout.type || 'facial', duration, workout.title, workout.user_type || 'free');
    }
    router.back();
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col animate-in fade-in duration-300">
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 pt-12 md:pt-4 safe-top">
          <div className="h-8 w-8" />
          <Loading variant="skeleton" className="w-32 bg-neutral-800">
            <div className="h-6" />
          </Loading>
          <div className="w-8" />
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <Loading variant="spinner" className="text-neutral-400">
            Loading workout...
          </Loading>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Video Player - Base Layer */}
      <div className="absolute inset-0">
        {workout?.video_url ? (
          <VideoPlayer 
            videoUrl={workout.video_url}
            workoutId={params.id}
            title={workout.title}
          />
        ) : (
          <div className="text-center p-6 h-full flex flex-col items-center justify-center">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-white mb-6">Video is unavailable or could not be loaded.</p>
            <Link href={`/workout/${params.id}`}>
              <button 
                onClick={() => haptics.trigger('medium')}
                className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2 rounded-lg transition duration-300 touch-feedback"
              >
                Back to Workout
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Interactive Layer - Pull to Refresh */}
      <div className="absolute inset-0 pointer-events-none">
        <PullToRefresh 
          onRefresh={fetchWorkout} 
          className="h-full pointer-events-auto"
        >
          <div className="min-h-screen" />
        </PullToRefresh>
      </div>

      {/* UI Layer - Navigation and Controls */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top navigation */}
        <div className="pointer-events-auto">
          <div className="relative flex justify-between items-center p-4 pt-12 md:pt-4 safe-top bg-gradient-to-b from-black/50 to-transparent">
            <button 
              onClick={handleBack} 
              className="text-white transition-opacity hover:opacity-80 active:opacity-60 touch-feedback"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h1 className="text-white text-lg font-medium">{workout?.title}</h1>
            
            <div className="w-8"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>
    </div>
  );
} 