'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PatternBackgroundProps {
  className?: string;
  variant?: 'dots' | 'grid' | 'waves';
}

export function PatternBackground({ className, variant = 'grid' }: PatternBackgroundProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug log
  console.log('PatternBackground rendering:', { theme, systemTheme, mounted });

  if (!mounted) return null;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[70vh]',
        className
      )}
      style={{
        background: currentTheme === 'dark' 
          ? 'linear-gradient(to top, rgba(0,0,0,0.8), transparent), repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.1) 39px, rgba(255,255,255,0.1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.1) 39px, rgba(255,255,255,0.1) 40px)'
          : 'linear-gradient(to top, rgba(255,255,255,0.8), transparent), repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(0,0,0,0.1) 39px, rgba(0,0,0,0.1) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(0,0,0,0.1) 39px, rgba(0,0,0,0.1) 40px)'
      }}
    />
  );
} 