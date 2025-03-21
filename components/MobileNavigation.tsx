'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function MobileNavigation() {
  const pathname = usePathname();
  
  // Define our navigation items
  const navItems = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Lifts',
      href: '/dashboard/library',
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Movements',
      href: '/dashboard/movements',
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      name: 'History',
      href: '/dashboard/history',
      icon: (active: boolean) => (
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
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
  // This allows for sub-paths like /dashboard/library/123 to still highlight the library tab
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };
  
  return (
    <div 
      className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 h-16 z-10"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        height: 'calc(64px + env(safe-area-inset-bottom))'
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link 
            key={item.name}
            href={item.href} 
            className={`flex flex-col items-center justify-center w-full py-2 ${active ? 'bg-neutral-100 dark:bg-neutral-700/50 rounded-md' : ''}`}>
            {item.icon(active)}
            <span className={`text-xs mt-1 ${active ? 'font-medium text-neutral-800 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-400'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
} 