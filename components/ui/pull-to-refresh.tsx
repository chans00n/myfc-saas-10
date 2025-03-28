"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  maxPull?: number;
  loadingIndicator?: React.ReactNode;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 100, // Distance in px needed to trigger refresh
  maxPull = 150,   // Maximum pull distance
  loadingIndicator = <Loader2 className="h-6 w-6 animate-spin" />
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull if at top of the page
      if (window.scrollY === 0) {
        pullStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return;
      
      const currentY = e.touches[0].clientY;
      const diff = currentY - pullStartY.current;
      
      // Only allow downward pull
      if (diff > 0) {
        // Use diminishing returns for longer pulls
        const newDistance = Math.min(maxPull, diff * 0.5);
        setPullDistance(newDistance);
        
        // Prevent default to disable regular scroll behavior
        if (newDistance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling) return;
      
      // If pulled far enough, trigger refresh
      if (pullDistance >= threshold) {
        setIsRefreshing(true);
        setPullDistance(0);
        
        try {
          await onRefresh();
        } catch (error) {
          console.error("Refresh failed:", error);
        } finally {
          if (isMounted.current) {
            setIsRefreshing(false);
          }
        }
      } else {
        // Not pulled far enough, reset
        setPullDistance(0);
      }
      
      setIsPulling(false);
    };

    const element = containerRef.current;
    if (element) {
      element.addEventListener("touchstart", handleTouchStart, { passive: true });
      element.addEventListener("touchmove", handleTouchMove, { passive: false });
      element.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      if (element) {
        element.removeEventListener("touchstart", handleTouchStart);
        element.removeEventListener("touchmove", handleTouchMove);
        element.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [isPulling, pullDistance, threshold, maxPull, onRefresh]);

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", className)}>
      {/* Pull indicator */}
      <div 
        className={cn(
          'absolute left-0 right-0 flex justify-center -mt-8 transition-all duration-200',
          'pull-indicator'
        )}
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          opacity: Math.min(1, pullDistance / threshold)
        }}
      >
        <div className={cn(
          'rounded-full bg-background/80 backdrop-blur-sm p-3 shadow-lg',
          isRefreshing && 'animate-spin'
        )}>
          {loadingIndicator}
        </div>
      </div>
      
      {/* Content with pull effect */}
      <div 
        className="transition-transform duration-200 ease-out"
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
} 