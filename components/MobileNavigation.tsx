'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Dumbbell, Smile, BarChart3, Trophy, Move } from 'lucide-react';

export default function MobileNavigation() {
  const pathname = usePathname();
  
  // Define our navigation items - reduced to 5 most important ones
  const navItems = [
    {
      name: 'Lifts',
      href: '/dashboard/library',
      icon: (active: boolean) => (
        <Smile className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} />
      )
    },
    {
      name: 'Moves',
      href: '/dashboard/movements',
      icon: (active: boolean) => (
        <Move className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} />
      )
    },
    // Face is the 3rd item (will be center in a 5-item layout)
    {
      name: 'Capture',
      href: '/dashboard/facial-progress',
      isSpecial: true,
      icon: (active: boolean) => (
        <div className="relative">
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-neutral-800 dark:bg-neutral-100 flex items-center justify-center">
            <Camera className="h-7 w-7 text-white dark:text-neutral-800" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xs">+</span>
          </div>
        </div>
      )
    },
    {
      name: 'Leaders',
      href: '/leaderboards',
      icon: (active: boolean) => (
        <Trophy className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} />
      )
    },
    {
      name: 'Progress',
      href: '/dashboard/progress',
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];
  
  // Helper function to check if a path matches the current route
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };
  
  return (
    <div 
      className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 z-10"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
        height: 'auto',
        paddingTop: '12px'
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link 
            key={item.name}
            href={item.href} 
            className={`flex flex-col items-center justify-center w-full ${
              active && !item.isSpecial ? 'bg-neutral-100 dark:bg-neutral-700/50 rounded-md mx-2' : ''
            } ${
              item.isSpecial ? 'mt-6' : ''
            }`}>
            {item.icon(active)}
            <span className={`text-[10px] mt-0.5 ${
              active ? 'font-medium text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'
            } ${
              item.isSpecial ? 'mt-6' : ''
            }`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
} 