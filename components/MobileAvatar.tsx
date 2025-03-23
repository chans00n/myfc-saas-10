'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SimpleSheet, SimpleSheetTitle, SimpleSheetDescription } from "@/components/ui/simple-sheet";
import { ThemeToggle } from './ThemeToggle';

interface MobileAvatarProps {
  userEmail: string | undefined;
  userAvatarUrl: string | undefined;
}

export function MobileAvatar({ userEmail, userAvatarUrl }: MobileAvatarProps) {
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

  // Get user's first name from email
  const getUserFirstName = (email: string) => {
    if (!email) return 'User';
    const namePart = email.split('@')[0];
    // Convert username to Title Case (first letter uppercase)
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };
  
  return (
    <div>
      <button
        onClick={() => setIsSheetOpen(true)}
        className="focus:outline-none"
        aria-label="Open profile menu"
      >
        {userAvatarUrl ? (
          <div className="h-9 w-9 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <img 
              src={userAvatarUrl}
              alt={userEmail || 'User'}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
            />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600">
            <span className="text-neutral-800 dark:text-neutral-200 font-medium text-sm">
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
        <div className="pb-6">
          <div className="flex items-center mb-4">
            <div className="mr-4">
              {userAvatarUrl ? (
                <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-600">
                  <img 
                    src={userAvatarUrl}
                    alt={userEmail || 'User'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
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

            {/* Theme toggle styled consistently with other options */}
            <button 
              className="w-full flex items-center justify-between py-2.5 px-1 text-sm text-neutral-800 dark:text-neutral-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-md"
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Theme
              </div>
              <ThemeToggle />
            </button>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-4">
              <form action="/auth/auth/logout" method="post">
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