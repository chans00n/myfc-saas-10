'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { haptics } from '@/utils/haptics';

interface UseGestureNavigationOptions {
  threshold?: number;
  enabled?: boolean;
  onBack?: () => void;
  onForward?: () => void;
}

export function useGestureNavigation({
  threshold = 50,
  enabled = true,
  onBack,
  onForward,
}: UseGestureNavigationOptions = {}) {
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isNavigating) return;

      const touchEnd = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };

      const diffX = touchStart.current.x - touchEnd.x;
      const diffY = Math.abs(touchStart.current.y - touchEnd.y);

      // Ensure horizontal swipe by checking if vertical movement is not too large
      if (diffY < Math.abs(diffX) * 0.5) {
        const progressValue = Math.min(Math.abs(diffX) / threshold, 1);
        setProgress(progressValue);

        if (Math.abs(diffX) > threshold * 0.3) {
          // Add haptic feedback at 30% threshold
          haptics.trigger('light');
        }

        if (Math.abs(diffX) > threshold) {
          setIsNavigating(true);
          haptics.trigger('medium');

          if (diffX > 0 && onForward) {
            onForward();
          } else if (diffX < 0 && onBack) {
            onBack();
          } else if (diffX > 0) {
            router.forward();
          } else {
            router.back();
          }
        }
      }
    };

    const handleTouchEnd = () => {
      setProgress(0);
      setIsNavigating(false);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router, threshold, enabled, isNavigating, onBack, onForward]);

  return {
    isNavigating,
    progress,
  };
} 