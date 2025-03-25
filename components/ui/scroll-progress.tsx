"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollProgressProps {
  color?: string;
  height?: number;
  zIndex?: number;
  className?: string;
}

export function ScrollProgress({
  color = "#4f46e5", // Default indigo color from your theme
  height = 2,
  zIndex = 50,
  className,
}: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentScrollY = window.scrollY;
      const scrollHeight = 
        document.documentElement.scrollHeight - 
        document.documentElement.clientHeight;
      
      if (scrollHeight) {
        setProgress((currentScrollY / scrollHeight) * 100);
      }
    };

    // Update on mount
    updateScrollProgress();
    
    // Add event listener
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    
    // Clean up
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, []);

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 w-full transition-transform duration-150", 
        className
      )}
      style={{ 
        height: `${height}px`, 
        zIndex: zIndex 
      }}
    >
      <div 
        className="h-full"
        style={{ 
          width: `${progress}%`, 
          backgroundColor: color,
          transition: "width 100ms ease-out"
        }}
      />
    </div>
  );
} 