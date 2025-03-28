"use client"

import Link from 'next/link';
import Image from 'next/image';
import { SimpleAvatar } from "@/components/ui/simple-avatar";
import { SimpleSheet, SimpleSheetTitle, SimpleSheetDescription } from "@/components/ui/simple-sheet";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCrisp } from '@/hooks/useCrisp';

// Client component for the avatar with sheet functionality
function AvatarWithSheet({ userEmail, userAvatarUrl }: { userEmail: string | undefined, userAvatarUrl: string | undefined }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [billingUrl, setBillingUrl] = useState<string>('#');
  
  // Get the user's initials for the avatar fallback
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase();
  };
  
  // Get user's first name from email
  const getUserFirstName = (email: string) => {
    if (!email) return 'User';
    const namePart = email.split('@')[0];
    // Convert username to Title Case (first letter uppercase)
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  
  // Get billing portal URL when sheet is opened
  useEffect(() => {
    if (isSheetOpen) {
      const fetchBillingUrl = async () => {
        try {
          const response = await fetch('/api/billing/portal', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch billing portal URL');
          }
          
          const data = await response.json();
          setBillingUrl(data.url);
        } catch (error) {
          console.error('Error fetching billing URL:', error);
        }
      };
      
      fetchBillingUrl();
    }
  }, [isSheetOpen]);
  
  return (
    <div>
      <button
        onClick={() => setIsSheetOpen(true)}
        className="focus:outline-none"
        aria-label="Open profile menu"
      >
        {userAvatarUrl ? (
          <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-200">
            <Image 
              src={userAvatarUrl}
              alt={userEmail || 'User'}
              width={36}
              height={36}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neutral-100 border border-neutral-200">
            <span className="text-neutral-800 font-medium text-sm">
              {getInitials(userEmail || '')}
            </span>
          </div>
        )}
      </button>
      
      <SimpleSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)}
      >
        {/* Enhanced profile header with avatar and name */}
        <div className="pt-safe-top pb-6">
          <div className="flex items-center mb-4">
            <div className="mr-4">
              {userAvatarUrl ? (
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-600">
                  <Image 
                    src={userAvatarUrl}
                    alt={userEmail || 'User'}
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="h-14 w-14 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900 border-2 border-neutral-200 dark:border-neutral-600">
                  <span className="text-indigo-600 dark:text-indigo-300 font-bold text-lg">
                    {getInitials(userEmail || '')}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {getUserFirstName(userEmail || '')}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 break-all max-w-[200px]">{userEmail}</p>
            </div>
          </div>
          <div className="h-1 w-1/3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
        </div>
        
        <div className="py-2">
          <div className="space-y-1">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 px-1 mb-2">Account</h4>
            
            <Link 
              href="/dashboard/profile" 
              className="flex items-center py-2.5 px-1 text-sm text-neutral-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md"
              onClick={() => setIsSheetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </Link>
            
            <Link 
              href="/dashboard/bookmarks" 
              className="flex items-center py-2.5 px-1 text-sm text-neutral-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md"
              onClick={() => setIsSheetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Bookmarks
            </Link>
            
            <Link 
              href={billingUrl} 
              className="flex items-center py-2.5 px-1 text-sm text-neutral-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md"
              onClick={() => setIsSheetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Billing
            </Link>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
              <form action="/auth/signout" method="post">
                <button type="submit" className="flex items-center py-2.5 px-1 text-sm text-neutral-800 dark:text-neutral-200 hover:text-rose-600 dark:hover:text-rose-400 transition-colors w-full rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </SimpleSheet>
    </div>
  );
}

function UserProfileSection({ userEmail, userAvatarUrl }: { userEmail: string | undefined, userAvatarUrl: string | undefined }) {
  const [billingUrl, setBillingUrl] = useState<string>('#');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const { show: showCrisp } = useCrisp();
  
  // Get the user's initials for the avatar fallback
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const fetchBillingUrl = async () => {
      try {
        const response = await fetch('/api/billing/portal', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch billing portal URL');
        }
        
        const data = await response.json();
        setBillingUrl(data.url);
      } catch (error) {
        console.error('Error fetching billing URL:', error);
      }
    };
    
    fetchBillingUrl();

    // Get initial theme
    const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    setTheme(currentTheme as 'light' | 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center w-full gap-3 p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
              {userAvatarUrl ? (
                <Image 
                  src={userAvatarUrl}
                  alt={userEmail || 'User'}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  unoptimized
                />
              ) : (
                <span className="text-neutral-800 dark:text-neutral-200 font-medium text-sm">
                  {getInitials(userEmail || '')}
                </span>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{userEmail?.split('@')[0]}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">{userEmail}</div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" align="end" side="right" sideOffset={8}>
          <DropdownMenuLabel className="text-neutral-900 dark:text-neutral-100">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700" />
          <DropdownMenuGroup>
            <DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-700 cursor-pointer text-neutral-900 dark:text-neutral-100">
              <Link href="/dashboard/profile" className="flex items-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-700 cursor-pointer text-neutral-900 dark:text-neutral-100">
              <Link href="/dashboard/bookmarks" className="flex items-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Bookmarks
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-700 cursor-pointer text-neutral-900 dark:text-neutral-100">
              <Link href={billingUrl} className="flex items-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-700 cursor-pointer text-neutral-900 dark:text-neutral-100" onClick={showCrisp}>
              <div className="flex items-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Support
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-700 cursor-pointer text-neutral-900 dark:text-neutral-100" onClick={toggleTheme}>
              {theme === 'light' ? (
                <div className="flex items-center w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Dark Mode
                </div>
              ) : (
                <div className="flex items-center w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Light Mode
                </div>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-700" />
          <DropdownMenuItem className="focus:bg-neutral-100 dark:focus:bg-neutral-700 cursor-pointer text-red-600 dark:text-red-400">
            <form action="/auth/signout" method="post" className="w-full">
              <button type="submit" className="flex items-center w-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Main Navigation Component
export default function MYFCNavigation() {
  const [userData, setUserData] = useState<{
    email?: string;
    avatarUrl?: string;
  }>({});
  
  // Remove debug log in production
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('MYFCNavigation component mounted');
      return () => {
        console.log('MYFCNavigation component unmounted');
      };
    }
  }, []);
  
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', { 
        headers: { 'Cache-Control': 'max-age=300' }
      });
      const data = await response.json();
      
      if (data.auth) {
        setUserData({
          email: data.auth.email,
          avatarUrl: data.profile?.avatar_url || data.auth.metadata?.avatar_url,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    // Fetch data once on mount
    fetchUserData().finally(() => {
      if (!isMounted) return;
    });
    
    return () => {
      isMounted = false;
    };
  }, [fetchUserData]);
  
  // Get the user's initials for the avatar fallback
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Desktop Navigation - shown on md screens and up */}
      <div className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-800 shadow-lg h-screen fixed border-r border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="MYFC Logo" 
              width={80} 
              height={80} 
              className="h-auto dark:hidden"
            />
            <Image 
              src="/logo_white.png" 
              alt="MYFC Logo" 
              width={80} 
              height={80} 
              className="h-auto hidden dark:block"
            />
          </div>
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-6">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/library" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Daily Lifts
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/movements" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Movements
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/facial-progress" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Facial Tracker
              </Link>
            </li>
            <li>
              <Link 
                href="/leaderboards" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Leaderboard
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/progress" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Progress
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* Help & Resources Links */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
            Resources
          </div>
          <ul className="space-y-2">
            <li>
              <Link 
                href="/legal/knowledge-base" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Knowledge Base
              </Link>
            </li>
            <li>
              <Link 
                href="/legal/changelog" 
                className="flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-auto">
          <UserProfileSection userEmail={userData.email} userAvatarUrl={userData.avatarUrl} />
        </div>
      </div>

      {/* Mobile Navigation - minimal bottom tab bar */}
      <div className="md:hidden">
        {/* Fixed top bar with avatar */}
        <div className="fixed top-0 left-0 right-0 flex justify-between items-center bg-white border-b border-neutral-200 px-4 h-16 z-20">
          <div className="w-9"></div> {/* Empty div for spacing */}
          <Image 
            src="/logo.png" 
            alt="MYFC Logo" 
            width={32} 
            height={32}
            className="h-auto w-auto"
          />
          <div className="flex-none">
            <AvatarWithSheet userEmail={userData.email} userAvatarUrl={userData.avatarUrl} />
          </div>
        </div>
        
        {/* Fixed bottom tab bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-10">
          <div className="flex justify-around items-center h-16">
            <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            <Link href="/dashboard/history" className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1">History</span>
            </Link>
            
            <Link href="/leaderboards" className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-xs mt-1">Community</span>
            </Link>
            
            <Link href="/dashboard/library" className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="text-xs mt-1">Library</span>
            </Link>
            
            <Link href="/dashboard/progress" className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs mt-1">Progress</span>
            </Link>
          </div>
        </div>
        
        {/* Padding at the bottom to prevent content from being hidden behind the bottom tab bar */}
        <div className="pb-16 pt-16"></div>
      </div>
    </>
  );
} 