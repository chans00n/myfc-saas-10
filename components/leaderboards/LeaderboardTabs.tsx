'use client'

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeaderboardCategory } from "@/types/database"
import LeaderboardTable from "./LeaderboardTable"
import { getUserLeaderboardRank, getLeaderboardEntries } from "@/utils/supabase/community"
import { Skeleton } from "@/components/ui/skeleton"

interface LeaderboardTabsProps {
  categories: LeaderboardCategory[]
  userId?: string
}

export default function LeaderboardTabs({ categories, userId }: LeaderboardTabsProps) {
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || '')
  const [entries, setEntries] = useState<any[]>([])
  const [userRank, setUserRank] = useState<{rank: number, score: number} | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboardData() {
      setLoading(true)
      
      try {
        // Get leaderboard entries for the active category
        const leaderboardData = await getLeaderboardEntries(activeCategory)
        setEntries(leaderboardData || [])
        
        // Get the current user's rank if they're logged in
        if (userId) {
          const rankData = await getUserLeaderboardRank(activeCategory, userId)
          setUserRank(rankData)
        }
      } catch (error) {
        console.error("Error loading leaderboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (activeCategory) {
      loadLeaderboardData()
    }
  }, [activeCategory, userId])

  const handleTabChange = (value: string) => {
    setActiveCategory(value)
  }

  return (
    <Tabs defaultValue={categories[0]?.id} className="w-full" onValueChange={handleTabChange}>
      {/* Improved horizontal scrollable tab container */}
      <div className="relative mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
        {/* Smooth scrolling horizontal container with elegant scrollbar */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 -mx-2 px-2">
          <TabsList className="inline-flex h-11 min-w-full mb-2 p-1">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="px-6 py-2.5 mx-1 whitespace-nowrap text-sm font-medium min-w-[120px] flex-shrink-0 first:ml-0 last:mr-0"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {/* Optional fade effect indicators to show scrollability - can be removed if not needed */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none sm:hidden"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden"></div>
      </div>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-0">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">{category.description}</p>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {userId && userRank && (
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg mb-4 border border-neutral-200 dark:border-neutral-700">
                    <p className="font-medium">Your Ranking</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-600 dark:bg-neutral-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {userRank.rank}
                        </div>
                        <span className="font-medium">You</span>
                      </div>
                      <div className="font-semibold">
                        {userRank.score}
                      </div>
                    </div>
                  </div>
                )}
                
                <LeaderboardTable entries={entries} />
                
                {entries.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 dark:text-neutral-400">No entries yet. Be the first to make the leaderboard!</p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
} 