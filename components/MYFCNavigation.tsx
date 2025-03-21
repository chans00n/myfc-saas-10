"use client"

import Link from 'next/link';
import Image from 'next/image';
import { SimpleAvatar } from "@/components/ui/simple-avatar";
import { SimpleSheet, SimpleSheetTitle, SimpleSheetDescription } from "@/components/ui/simple-sheet";
import { useState, useEffect, useCallback } from "react";

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
              href={billingUrl} 
              className="flex items-center py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-neutral-100"
              onClick={() => setIsSheetOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Billing
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