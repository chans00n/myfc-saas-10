"use client"

import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import { SimpleAvatar } from "@/components/ui/simple-avatar";
import { SimpleSheet, SimpleSheetTitle, SimpleSheetDescription } from "@/components/ui/simple-sheet";
import { useState, useEffect } from "react";

// Client component for the avatar with sheet functionality
function AvatarWithSheet({ userEmail, userAvatarUrl }: { userEmail: string | undefined, userAvatarUrl: string | undefined }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Get the user's initials for the avatar fallback
  const getInitials = (email: string) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase();
  };
  
  return (
    <div>
      <button
        onClick={() => setIsSheetOpen(true)}
        className="focus:outline-none"
        aria-label="Open profile menu"
      >
        {userAvatarUrl ? (
          <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-200">
            <img 
              src={userAvatarUrl}
              alt={userEmail || 'User'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
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
        <div className="pb-4">
          <SimpleSheetTitle>Your Profile</SimpleSheetTitle>
          <SimpleSheetDescription>{userEmail}</SimpleSheetDescription>
        </div>
        
        <div className="py-4">
          <div className="space-y-4">
            <Link 
              href="/dashboard/profile" 
              className="flex items-center py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100"
              onClick={() => setIsSheetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Edit Profile
            </Link>
            
            <Link 
              href="/dashboard/settings" 
              className="flex items-center py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100"
              onClick={() => setIsSheetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
              <form action="/auth/auth/logout" method="post">
                <button type="submit" className="flex items-center py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100 w-full">
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

// Main Navigation Component
export default function MYFCNavigation() {
  const [userData, setUserData] = useState<{
    email?: string;
    avatarUrl?: string;
  }>({});
  
  // Add a mount tracker to debug mounting cycles
  useEffect(() => {
    console.log('MYFCNavigation component mounted');
    return () => {
      console.log('MYFCNavigation component unmounted');
    };
  }, []);
  
  useEffect(() => {
    let isMounted = true;
    
    // Fetch user data on the client side - only once
    async function fetchUserData() {
      // Prevent duplicate calls by tracking if component is still mounted
      if (!isMounted) return;
      
      console.log('Fetching user data in MYFCNavigation');
      
      try {
        // Get user auth data
        const response = await fetch('/api/auth/user', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();
        
        // Also fetch user record from database
        let dbData = null;
        try {
          const dbResponse = await fetch('/api/profile/user-data', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          dbData = await dbResponse.json();
        } catch (dbError) {
          console.error('Error fetching DB user data:', dbError);
        }
        
        if (isMounted && data.user) {
          // Prioritize database avatar_url, fall back to metadata
          const avatarUrl = 
            (dbData?.user?.avatar_url) || 
            (data.user.user_metadata?.avatar_url);
          
          setUserData({
            email: data.user.email,
            avatarUrl: avatarUrl,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    
    // Only fetch once when component mounts
    fetchUserData();
    
    // Clean up function
    return () => {
      isMounted = false;
    };
    
    // TEMPORARY: Disable all polling and visibility change listeners to debug
    // const interval = setInterval(fetchUserData, 300000); // 5 minutes = 300000ms
    
    // // Refresh when the component becomes visible again (user returns to tab)
    // const handleVisibilityChange = () => {
    //   if (document.visibilityState === 'visible') {
    //     fetchUserData();
    //   }
    // };
    
    // document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // return () => {
    //   clearInterval(interval);
    //   document.removeEventListener('visibilitychange', handleVisibilityChange);
    // };
  }, []);
  
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
              width={40} 
              height={40} 
              className="mr-2 h-auto w-auto dark:hidden"
            />
            <Image 
              src="/logo_white.png" 
              alt="MYFC Logo" 
              width={40} 
              height={40} 
              className="mr-2 h-auto w-auto hidden dark:block"
            />
          </div>
          {userData.email && <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-2">{userData.email}</p>}
        </div>
        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/dashboard" 
                className="flex items-center px-6 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-l-2 border-transparent hover:border-neutral-800 dark:hover:border-neutral-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/history" 
                className="flex items-center px-6 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-l-2 border-transparent hover:border-neutral-800 dark:hover:border-neutral-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/achievements" 
                className="flex items-center px-6 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-l-2 border-transparent hover:border-neutral-800 dark:hover:border-neutral-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Achievements
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/progress" 
                className="flex items-center px-6 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-l-2 border-transparent hover:border-neutral-800 dark:hover:border-neutral-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Progress
              </Link>
            </li>
            <li>
              <Link 
                href="/dashboard/library" 
                className="flex items-center px-6 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 border-l-2 border-transparent hover:border-neutral-800 dark:hover:border-neutral-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Library
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-6 border-t border-neutral-200">
          <form action="/auth/auth/logout" method="post">
            <button type="submit" className="flex items-center px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 w-full rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </form>
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
            
            <Link href="/dashboard/achievements" className="flex flex-col items-center justify-center w-full h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="text-xs mt-1">Badges</span>
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