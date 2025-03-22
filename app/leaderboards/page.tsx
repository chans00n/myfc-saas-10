'use client'

import { useEffect, useState } from "react"
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs"
import { getLeaderboardCategories } from "@/utils/supabase/community"
import { createClient } from "@/utils/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardsPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  
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
  
  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-6 w-full max-w-lg mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }
  
  // If no categories exist yet or there's an error, show placeholder
  if (categories.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Community Leaderboards</h1>
        <div className="bg-muted p-8 rounded-lg text-center">
          <p>Leaderboards are being updated. Check back soon!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Community Leaderboards</h1>
      <p className="text-muted-foreground mb-8">
        See how you rank against other members of the MYFC community!
      </p>
      
      <LeaderboardTabs categories={categories} userId={userId} />
    </div>
  )
} 