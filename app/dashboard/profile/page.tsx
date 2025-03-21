"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SimpleAvatar } from "@/components/ui/simple-avatar";
import { redirect, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfilePage() {
  const router = useRouter();
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
  
  // Add mount tracking
  useEffect(() => {
    console.log('ProfilePage component mounted');
    return () => {
      console.log('ProfilePage component unmounted');
    };
  }, []);
  
  // Fetch user data
  useEffect(() => {
    let isMounted = true;
    
    console.log('Starting user data fetch in ProfilePage');
    
    async function fetchUserData() {
      // Prevent fetches if component unmounted
      if (!isMounted) return;
      
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
        
        if (!isMounted) return; // Exit if unmounted during fetch
        
        if (data?.user) {
          // Prioritize database avatar_url, fall back to metadata
          const avatarUrl = 
            (dbData?.user?.avatar_url) || 
            (data.user.user_metadata?.avatar_url);
            
          console.log('Profile using avatar URL:', avatarUrl);
          
          setUserData({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            plan: dbData?.user?.plan || data.user.user_metadata?.plan || 'free',
            plan_name: dbData?.user?.plan_name || 'Basic Plan',
            created_at: data.user.created_at,
            avatar_url: avatarUrl,
          });
          
          if (avatarUrl) {
            setAvatarUrl(avatarUrl);
          }
        } else {
          // Redirect to login if no user data
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
    
    fetchUserData();
    
    // No need for frequent polling on profile page - only fetch once
    // If you absolutely need polling, use a much longer interval like 30 seconds
    // const interval = setInterval(fetchUserData, 30000);
    // return () => clearInterval(interval);
    
    return () => {
      isMounted = false; // Clean up
    };
  }, [router]);
  
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
  
  // Mock data for profile statistics
  const profileStats = {
    totalWorkouts: 42, // Replace with actual data
    streak: 7, // Replace with actual data
  };
  
  return (
    <main className="max-w-md mx-auto px-6 pt-8 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1">Your Profile</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Manage your account information</p>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 mb-8">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group mb-4">
            {avatarUrl ? (
              <div
                className="h-24 w-24 rounded-full overflow-hidden border border-neutral-200"
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
                className="h-24 w-24 rounded-full flex items-center justify-center bg-neutral-100 border border-neutral-200"
              >
                <span className="text-neutral-800 font-medium text-xl">
                  {getInitials(userData.email || '')}
                </span>
              </div>
            )}
            
            <label 
              htmlFor="avatar-upload" 
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
              style={{borderRadius: '9999px'}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="sr-only">Change avatar</span>
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
          <h2 className="font-semibold text-lg text-center">{userData.name}</h2>
          <p className="text-neutral-500 text-sm text-center">{userData.email}</p>
          <p className="text-xs text-neutral-400 mt-1">
            Click on avatar to upload a new image
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <p className="text-xl font-semibold dark:text-neutral-100">{profileStats.totalWorkouts}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Workouts</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <p className="text-xl font-semibold dark:text-neutral-100">{profileStats.streak}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Day Streak</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <p className="text-xl font-semibold capitalize dark:text-neutral-100">
                {userData.plan_name || 'Basic Plan'}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Plan</p>
            </div>
          </div>
          
          <p className="text-sm text-neutral-500">Joined {formatDate(userData.created_at)}</p>
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
          <h2 className="text-lg font-semibold mb-4 dark:text-neutral-100">Personal Information</h2>
          
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
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6">
          <h2 className="text-lg font-semibold mb-4 dark:text-neutral-100">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                defaultChecked
                className="h-4 w-4 text-neutral-800 border-neutral-300 dark:border-neutral-600 rounded focus:ring-neutral-800 dark:focus:ring-neutral-300"
              />
              <label className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300" htmlFor="emailNotifications">
                Email notifications for new workouts
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="reminderNotifications"
                name="reminderNotifications"
                defaultChecked
                className="h-4 w-4 text-neutral-800 border-neutral-300 dark:border-neutral-600 rounded focus:ring-neutral-800 dark:focus:ring-neutral-300"
              />
              <label className="ml-2 block text-sm text-neutral-700 dark:text-neutral-300" htmlFor="reminderNotifications">
                Daily reminder notifications
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-neutral-800 text-white dark:bg-neutral-700 dark:text-neutral-100 font-medium rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </main>
  );
} 