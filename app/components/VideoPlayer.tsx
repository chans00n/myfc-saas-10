'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
  videoUrl: string;
  workoutId: string;
  title: string;
}

export default function VideoPlayer({ videoUrl, workoutId, title }: VideoPlayerProps) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(video.duration);
    };
    
    const handlePlayState = () => {
      setIsPlaying(!video.paused);
    };
    
    const handleEnded = () => {
      setIsEnded(true);
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlayState);
    video.addEventListener('pause', handlePlayState);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlayState);
      video.removeEventListener('pause', handlePlayState);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  const togglePlayPause = () => {
    if (isEnded) {
      // If the video has ended, restart it
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play();
        setIsEnded(false);
      }
    } else {
      // Normal play/pause toggle
      const video = videoRef.current;
      if (!video) return;
      
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
    
    // If video was ended and user seeks back, clear the ended state
    if (isEnded && pos < 1.0) {
      setIsEnded(false);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      // Call the API to mark the workout as complete
      const response = await fetch(`/api/workouts/${workoutId}/complete`, {
        method: 'POST',
      });
      
      if (response.ok) {
        // Redirect back to dashboard
        router.push('/dashboard');
      } else {
        console.error('Failed to mark workout as complete');
        setIsMarkingComplete(false);
      }
    } catch (error) {
      console.error('Error marking workout as complete:', error);
      setIsMarkingComplete(false);
    }
  };
  
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  if (error) {
    return (
      <div className="text-center p-6 w-full h-full flex flex-col items-center justify-center">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-white mb-6">Video is unavailable or could not be loaded.</p>
        <Link href={`/workout/${workoutId}`}>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition duration-300">
            Back to Workout
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        onClick={togglePlayPause}
        onError={() => setError(true)}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Play/Pause overlay */}
      {!isPlaying && !isEnded && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 z-10"
          onClick={togglePlayPause}
        >
          <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Video ended overlay with Mark Complete button */}
      {isEnded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10">
          <div className="text-center mb-8">
            <h3 className="text-white text-2xl font-bold mb-2">Workout Complete!</h3>
            <p className="text-white/80 mb-6">Great job finishing your workout.</p>
            
            <div className="flex flex-col space-y-4 w-64 mx-auto">
              <button 
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center"
              >
                {isMarkingComplete ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Marking Complete...
                  </>
                ) : (
                  'Mark as Complete'
                )}
              </button>
              
              <button 
                onClick={togglePlayPause}
                className="bg-white/10 hover:bg-white/20 text-white py-3 px-6 rounded-lg font-medium transition duration-300 backdrop-blur-sm"
              >
                Play Again
              </button>
              
              <Link href={`/workout/${workoutId}`} className="block">
                <button className="w-full bg-transparent border border-white/30 text-white py-3 px-6 rounded-lg font-medium transition duration-300 hover:bg-white/10">
                  Back to Details
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Video controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4 z-10">
        <div className="flex justify-between items-center text-white text-sm mb-2">
          <span>Progress</span>
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <div 
          className="h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-indigo-500 transition-all duration-100" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 