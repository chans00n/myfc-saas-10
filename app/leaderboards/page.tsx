'use client'

import { useEffect, useState } from "react"
import Leaderboards from "@/components/leaderboards/Leaderboards"
import { getLeaderboardCategories } from "@/utils/supabase/community"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"
import MYFCNavigation from "@/components/MYFCNavigation"
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { MobileAvatar } from '@/components/MobileAvatar'
import { Button } from "@/components/ui/button"

const MobileNavigation = dynamic(() => import('@/components/MobileNavigation'), { ssr: false });

export default function LeaderboardsPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string>('')
  const [userAvatarUrl, setUserAvatarUrl] = useState<string>('')
  const [isAdmin, setIsAdmin] = useState(false)
  
  useEffect(() => {
    // Set page title
    document.title = "MYFC - Community Leaderboards"
    
    // Fetch user and categories
    async function fetchData() {
      try {
        setLoading(true)
        
        // Get current user
        const supabase = createClient()
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user?.id) {
          setUserId(userData.user.id)
          setUserEmail(userData.user.email || '')
          setUserAvatarUrl(userData.user.user_metadata?.avatar_url || '')
          
          // Check if user email is for admin
          setIsAdmin(userData.user.email === 'admin@myfc.app')
        }
        
        // Get leaderboard categories
        const categoriesData = await getLeaderboardCategories()
        if (categoriesData) {
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error("Error loading leaderboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  const handleUpdateLeaderboards = async () => {
    if (!userId || !isAdmin) return
    
    try {
      const response = await fetch('/api/leaderboards/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        // Refresh categories to show updated data
        const categoriesData = await getLeaderboardCategories()
        if (categoriesData) {
          setCategories([...categoriesData]) // Force re-render
        }
        
        alert('Leaderboards updated successfully!')
      } else {
        const data = await response.json()
        alert(`Error: ${data.error || 'Failed to update leaderboards'}`)
      }
    } catch (error) {
      console.error('Error updating leaderboards:', error)
      alert('Failed to update leaderboards')
    }
  }
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="hidden md:block">
          <MYFCNavigation />
        </div>
        
        {/* Mobile-only top avatar bar */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 fixed top-0 left-0 right-0 z-10" 
             style={{
               paddingTop: 'max(16px, env(safe-area-inset-top))',
               paddingLeft: 'max(16px, env(safe-area-inset-left))',
               paddingRight: 'max(16px, env(safe-area-inset-right))'
             }}>
          <div className="text-center">
            <Image 
              src="/logo_white.png"
              alt="My Face Coach"
              width={80}
              height={80}
              className="w-16 h-auto hidden dark:block"
              priority
              unoptimized
            />
            <Image 
              src="/logo.png"
              alt="My Face Coach"
              width={80}
              height={80}
              className="w-16 h-auto dark:hidden"
              priority
              unoptimized
            />
          </div>
          
          <div className="flex items-center">
            <MobileAvatar userEmail="" userAvatarUrl="" />
          </div>
        </div>
        
        <div className="flex-1 md:ml-64 pb-24 md:pb-8 pt-16 md:pt-0">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <Skeleton className="h-10 w-64 mb-6" />
            <Skeleton className="h-6 w-full max-w-lg mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }
  
  // If no categories exist yet or there's an error, show placeholder
  if (categories.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="hidden md:block">
          <MYFCNavigation />
        </div>
        
        {/* Mobile-only top avatar bar */}
        <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 fixed top-0 left-0 right-0 z-10" 
             style={{
               paddingTop: 'max(16px, env(safe-area-inset-top))',
               paddingLeft: 'max(16px, env(safe-area-inset-left))',
               paddingRight: 'max(16px, env(safe-area-inset-right))'
             }}>
          <div className="text-center">
            <Image 
              src="/logo_white.png"
              alt="My Face Coach"
              width={80}
              height={80}
              className="w-16 h-auto hidden dark:block"
              priority
              unoptimized
            />
            <Image 
              src="/logo.png"
              alt="My Face Coach"
              width={80}
              height={80}
              className="w-16 h-auto dark:hidden"
              priority
              unoptimized
            />
          </div>
          
          <div className="flex items-center">
            <MobileAvatar userEmail={userEmail} userAvatarUrl={userAvatarUrl} />
          </div>
        </div>
        
        <div className="flex-1 md:ml-64 pb-24 md:pb-8 pt-16 md:pt-0">
          <div className="container max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Community Leaderboards</h1>
            <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg text-center border border-neutral-200 dark:border-neutral-700">
              <p className="mb-6">Leaderboards are being updated. Check back soon!</p>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="hidden md:block">
        <MYFCNavigation />
      </div>
      
      {/* Mobile-only top avatar bar */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 fixed top-0 left-0 right-0 z-10" 
           style={{
             paddingTop: 'max(16px, env(safe-area-inset-top))',
             paddingLeft: 'max(16px, env(safe-area-inset-left))',
             paddingRight: 'max(16px, env(safe-area-inset-right))'
           }}>
        <div className="text-center">
          <Image 
            src="/logo_white.png"
            alt="My Face Coach"
            width={80}
            height={80}
            className="w-16 h-auto hidden dark:block"
            priority
            unoptimized
          />
          <Image 
            src="/logo.png"
            alt="My Face Coach"
            width={80}
            height={80}
            className="w-16 h-auto dark:hidden"
            priority
            unoptimized
          />
        </div>
        
        <div className="flex items-center">
          <MobileAvatar userEmail={userEmail} userAvatarUrl={userAvatarUrl} />
        </div>
      </div>
      
      <div className="flex-1 md:ml-64 pb-24 md:pb-8 pt-16 md:pt-0">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Community Leaderboards</h1>
            
            {isAdmin && (
              <Button
                onClick={handleUpdateLeaderboards}
                size="sm"
                variant="outline"
                className="mt-2 sm:mt-0"
              >
                Update Leaderboards
              </Button>
            )}
          </div>
          
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            See how you rank against other members of the MYFC community!
          </p>
          
          <Leaderboards categories={categories} userId={userId} />
        </div>
      </div>
      <MobileNavigation />
    </div>
  )
} 