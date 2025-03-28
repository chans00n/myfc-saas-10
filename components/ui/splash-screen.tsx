'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { haptics } from '@/utils/haptics';

interface SplashScreenProps {
  onComplete?: () => void;
  minimumDisplayTime?: number;
}

export function SplashScreen({ 
  onComplete, 
  minimumDisplayTime = 2000 
}: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Trigger initial haptic feedback
    haptics.trigger('medium');

    timeout = setTimeout(() => {
      setIsExiting(true);
      haptics.trigger('light');
      
      // Add a small delay for the exit animation
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, minimumDisplayTime);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [minimumDisplayTime, onComplete]);

  return (
    <div
      className={`fixed inset-0 bg-neutral-900 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="relative w-32 h-32">
        <Image
          src="/logo_white.png"
          alt="MYFC Logo"
          fill
          className={`object-contain transition-transform duration-700 ${
            isExiting ? 'scale-95' : 'scale-100'
          }`}
          priority
        />
      </div>
      
      <div className="space-y-4 text-center">
        <h1 className="text-white text-2xl font-semibold animate-in slide-up">
          Rise & Lift
        </h1>
        
        {/* Loading indicator */}
        <div className="flex justify-center items-center space-x-2">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </div>
  );
} 