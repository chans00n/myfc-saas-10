'use client';

import { useEffect, useState } from 'react';
import { Loading } from './loading';
import { haptics } from '@/utils/haptics';

interface LoadingStateProps {
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  showDelay?: number;
  fullScreen?: boolean;
  preserveHeight?: boolean;
}

export function LoadingState({
  children,
  isLoading,
  loadingText = 'Loading...',
  showDelay = 300,
  fullScreen = false,
  preserveHeight = false,
}: LoadingStateProps) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowLoader(true);
        haptics.trigger('light');
      }, showDelay);
    } else {
      setShowLoader(false);
      if (showLoader) {
        haptics.trigger('success');
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isLoading, showDelay, showLoader]);

  if (!isLoading && !showLoader) {
    return <>{children}</>;
  }

  const loadingContent = (
    <div className={`flex items-center justify-center ${preserveHeight ? 'h-full' : 'min-h-[100px]'}`}>
      <Loading variant="spinner" className="text-neutral-400">
        {loadingText}
      </Loading>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in flex items-center justify-center">
        {loadingContent}
      </div>
    );
  }

  return (
    <div className={`animate-in ${preserveHeight ? 'h-full' : ''}`}>
      {loadingContent}
    </div>
  );
} 