'use client';

import { useState, useCallback } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

interface UseLoadingStateOptions {
  showOverlay?: boolean;
  delay?: number;
  onLoadingChange?: (loading: boolean) => void;
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { showOverlay = false, delay = 300, onLoadingChange } = options;
  const [isLoading, setLocalLoading] = useState(false);
  const { setIsLoading } = useLoading();

  const startLoading = useCallback(() => {
    setLocalLoading(true);
    if (showOverlay) {
      setIsLoading(true);
    }
    onLoadingChange?.(true);
  }, [showOverlay, setIsLoading, onLoadingChange]);

  const stopLoading = useCallback(() => {
    // Add a small delay to make transitions smoother
    setTimeout(() => {
      setLocalLoading(false);
      if (showOverlay) {
        setIsLoading(false);
      }
      onLoadingChange?.(false);
    }, delay);
  }, [delay, showOverlay, setIsLoading, onLoadingChange]);

  const withLoading = useCallback(
    async <T,>(promise: Promise<T>): Promise<T> => {
      try {
        startLoading();
        const result = await promise;
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
} 