"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  // When the route changes
  useEffect(() => {
    setDisplayChildren(children);
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // Match this with the CSS transition time
    
    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div 
      className={cn(
        "transition-opacity duration-300",
        isTransitioning ? "opacity-0" : "opacity-100",
        className
      )}
    >
      {displayChildren}
    </div>
  );
} 