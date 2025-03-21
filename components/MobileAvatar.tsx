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
            
            {/* Theme toggle */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-neutral-800 dark:text-neutral-200">Theme</span>
              <ThemeToggle />
            </div>
            
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