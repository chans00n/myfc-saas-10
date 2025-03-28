'use client';

import { useState } from 'react';
import { SplashScreen } from '@/components/ui/splash-screen';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    setIsLoaded(true);
  };

  return (
    <>
      {/* Show splash screen on first load */}
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
      
      {/* Main content with fade-in animation */}
      <div
        className={`${
          isLoaded ? 'animate-in' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </>
  );
} 