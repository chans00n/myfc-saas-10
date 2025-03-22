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
      <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.id}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {categories.map((category) => (
        <TabsContent key={category.id} value={category.id} className="mt-0">
          <div className="bg-card rounded-lg shadow-sm border p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <p className="text-muted-foreground text-sm">{category.description}</p>
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
                  <div className="bg-primary-foreground p-4 rounded-lg mb-4 border">
                    <p className="font-medium">Your Ranking</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
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
                    <p className="text-muted-foreground">No entries yet. Be the first to make the leaderboard!</p>
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