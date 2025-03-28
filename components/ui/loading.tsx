'use client';

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./skeleton";

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'overlay';
  className?: string;
  children?: React.ReactNode;
}

export function Loading({ variant = 'spinner', className, children }: LoadingProps) {
  if (variant === 'overlay') {
    return (
      <div className={cn(
        'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm',
        'flex items-center justify-center',
        className
      )}>
        <Loader2 className="h-8 w-8 animate-spin" />
        {children}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        {children || (
          <>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Loader2 className="h-6 w-6 animate-spin" />
      {children && (
        <span className="ml-2 text-sm text-muted-foreground">{children}</span>
      )}
    </div>
  );
} 