'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/app/components/VideoPlayer';
import { featureEvents } from '@/lib/analytics/events';

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

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        // In a production app, this would fetch from your API
        // For now, we're using a test video URL
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
            user_type: 'free' // Default user type
          });
          setIsLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // If the workout has no video, use a test video
        if (!data.video_url) {
          data.video_url = TEST_VIDEOS[0];
        }
        
        // Ensure we have user type
        if (!data.user_type) {
          data.user_type = 'free';
        }
        
        setWorkout(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchWorkout:', error);
        // Still provide a fallback experience with a test video
        setWorkout({
          id: params.id,
          title: "Morning Face Refresher",
          video_url: TEST_VIDEOS[0],
          type: 'facial',
          user_type: 'free' // Default user type
        });
        setIsLoading(false);
      }
    };

    fetchWorkout();
  }, [params.id]);

  // Track workout start when the page loads
  useEffect(() => {
    if (workout) {
      featureEvents.startWorkout(workout.type || 'facial', workout.title, workout.user_type || 'free');
      setStartTime(Date.now());
    }
  }, [workout]);

  // Handle closing the video and going back
  const handleBack = () => {
    // Track workout completion if it was started
    if (startTime && workout) {
      const duration = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
      featureEvents.completeWorkout(workout.type || 'facial', duration, workout.title, workout.user_type || 'free');
    }
    router.back();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Top navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-4 pt-12 md:pt-4 safe-top">
        <button onClick={handleBack} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h1 className="text-white text-lg font-medium">{workout?.title}</h1>
        
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>
      
      {/* Video Player - Full height */}
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
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-300">
                Back to Workout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 