'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SimpleSheet, SimpleSheetTitle, SimpleSheetDescription } from "@/components/ui/simple-sheet";
import { ThemeToggle } from './ThemeToggle';

interface MobileAvatarProps {
  userEmail: string | undefined;
  userAvatarUrl: string | undefined;
}

export function MobileAvatar({ userEmail, userAvatarUrl }: MobileAvatarProps) {
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