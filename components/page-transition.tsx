'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function PageTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-background pointer-events-none',
        'transition-opacity duration-300 ease-in-out',
        isTransitioning ? 'opacity-100' : 'opacity-0'
      )}
      style={{
        WebkitBackdropFilter: 'saturate(180%) blur(5px)',
        backdropFilter: 'saturate(180%) blur(5px)',
      }}
    />
  );
} 