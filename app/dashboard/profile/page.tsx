"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SimpleAvatar } from "@/components/ui/simple-avatar";
import { redirect, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';
import { BillingSection } from '@/components/BillingSection';
import { PushNotificationSettings } from '@/components/PushNotificationSettings';
import { WorkoutNotificationSettings } from '@/components/WorkoutNotificationSettings';

export default function ProfilePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState<{
    id?: string;
    email?: string;
    name?: string;
    plan?: string;
    plan_name?: string;
    created_at?: string;
    avatar_url?: string;
  }>({});
  
  // Only log in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('ProfilePage component mounted');
      return () => {
        console.log('ProfilePage component unmounted');
      };
    }
  }, []);
  
  // Fetch user data with consolidated API
  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: { 'Cache-Control': 'max-age=300' }
      });
      const data = await response.json();
      
      if (!data.auth) {
        router.push('/login');
        return;
      }
      
      // Extract user data from consolidated response
      const authUser = data.auth;
      const profileData = data.profile;
      
      // Set avatar URL
      const userAvatarUrl = profileData?.avatar_url || authUser.metadata?.avatar_url;
      
      if (userAvatarUrl) {
        setAvatarUrl(userAvatarUrl);
      }
      
      // Set user data
      setUserData({
        id: authUser.id,
        email: authUser.email,
        name: authUser.metadata?.name || authUser.email?.split('@')[0] || 'User',
        plan: profileData?.plan || authUser.metadata?.plan || 'free',
        plan_name: profileData?.plan_name || 'Basic Plan',
        created_at: authUser.created_at,
        avatar_url: userAvatarUrl,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [router]);
  
  useEffect(() => {
    let isMounted = true;
    
    // Fetch data once when component mounts
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
  
  // Get current date in a readable format
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Handle avatar upload
  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Create a preview of the selected image
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
    
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      formData.append("avatar", file);
      
      // Upload to Supabase via API route
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.error) {
        console.error("Upload error:", result.error);
        alert("Failed to upload image: " + result.error);
        // Revert to the previous avatar URL if available
        setAvatarUrl(userData.avatar_url || null);
      } else {
        // Update the avatar URL with the one from Supabase
        setAvatarUrl(result.avatarUrl);
        
        // Update user data with new avatar URL
        setUserData(prev => ({
          ...prev,
          avatar_url: result.avatarUrl
        }));
        
        // Force refresh the data from both sources
        try {
          // Refresh auth data
          const authResponse = await fetch('/api/auth/user', { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          // Refresh DB data
          const dbResponse = await fetch('/api/profile/user-data', {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
          });
          
          console.log('Data refreshed after upload');
        } catch (refreshError) {
          console.error('Error refreshing data after upload:', refreshError);
        }
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("An error occurred while uploading your avatar");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <main className="pb-24">
      {/* Modern gradient profile header */}
      <div className="w-full bg-gradient-to-b from-white to-neutral-400 dark:from-neutral-900 dark:to-black text-neutral-800 dark:text-white px-0 pt-12 pb-16 mb-8">
        <div className="max-w-md mx-auto flex flex-col items-center px-6">
          
          <div className="relative group mb-6">
            {avatarUrl ? (
              <div
                className="h-28 w-28 rounded-full overflow-hidden border-2 border-neutral-300/30 dark:border-white/20 shadow-xl"
              >
                <img
                  src={avatarUrl}
                  alt={userData.name || "User"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <div
                className="h-28 w-28 rounded-full flex items-center justify-center bg-neutral-300 dark:bg-neutral-700 border-2 border-neutral-300/30 dark:border-white/20 shadow-xl"
              >
                <span className="text-neutral-800 dark:text-white font-medium text-2xl">
                  {getInitials(userData.email || '')}
                </span>
              </div>
            )}
            
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white rounded-full">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          
          <h2 className="font-bold text-2xl text-center text-neutral-800 dark:text-white">{userData.name}</h2>
          <p className="text-neutral-600 dark:text-neutral-300 text-sm text-center mt-1">{userData.email}</p>
          <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-3">
            Member since {formatDate(userData.created_at)}
          </p>
        </div>
      </div>
      
      <div className="max-w-md mx-auto px-6">
        {/* Personal Information Card */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-700 p-6 mb-8 -mt-12 z-10 relative">
          <h2 className="text-lg font-semibold mb-4 text-neutral-800 dark:text-neutral-100">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={userData.name}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-100 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-800 focus:border-neutral-800 dark:focus:ring-neutral-300 dark:focus:border-neutral-300"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                defaultValue={userData.email}
                disabled
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400"
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Plan
              </label>
              <div className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400">
                {userData.plan_name || 'Basic Plan'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Theme Settings */}
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4 text-neutral-900 dark:text-white">Appearance</h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Dark Mode</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Toggle between light and dark theme</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-neutral-100">Preferences</h2>
            
            <div className="space-y-4">
              <WorkoutNotificationSettings />
              
              <div className="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-5">
                <PushNotificationSettings />
              </div>
            </div>
          </div>
          
          {/* Billing Management Section */}
          <BillingSection />
          
          <div className="flex flex-col md:flex-row md:justify-end">
            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-neutral-800 text-white dark:bg-neutral-700 dark:text-neutral-100 font-medium rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-600 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
} 