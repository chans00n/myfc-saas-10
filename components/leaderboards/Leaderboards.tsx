'use client'

import { useState, useEffect } from "react"
import { LeaderboardCategory } from "@/types/database"
import LeaderboardTable from "./LeaderboardTable"
import { getUserLeaderboardRank, getLeaderboardEntries } from "@/utils/supabase/community"
import { Skeleton } from "@/components/ui/skeleton"

interface LeaderboardsProps {
  categories: LeaderboardCategory[]
  userId?: string
}

export default function Leaderboards({ categories, userId }: LeaderboardsProps) {
  const [leaderboardData, setLeaderboardData] = useState<{
    [key: string]: {
      entries: any[];
      userRank: { rank: number; score: number } | null;
      loading: boolean;
    }
  }>({})

  useEffect(() => {
    // Initialize leaderboardData state for all categories
    const initialData: any = {}
    categories.forEach(category => {
      initialData[category.id] = {
        entries: [],
        userRank: null,
        loading: true
      }
    })
    setLeaderboardData(initialData)

    // Load data for all categories
    async function loadAllLeaderboardData() {
      for (const category of categories) {
        try {
          // Get leaderboard entries for this category
          const entries = await getLeaderboardEntries(category.id)
          
          // Get the current user's rank if they're logged in
          let userRank = null
          if (userId) {
            userRank = await getUserLeaderboardRank(category.id, userId)
          }
          
          setLeaderboardData(prev => ({
            ...prev,
            [category.id]: {
              entries: entries || [],
              userRank,
              loading: false
            }
          }))
        } catch (error) {
          console.error(`Error loading leaderboard data for ${category.name}:`, error)
          setLeaderboardData(prev => ({
            ...prev,
            [category.id]: {
              ...prev[category.id],
              loading: false
            }
          }))
        }
      }
    }
    
    loadAllLeaderboardData()
  }, [categories, userId])

  return (
    <div className="space-y-10">
      {categories.map((category) => {
        const data = leaderboardData[category.id] || { entries: [], userRank: null, loading: true }
        
        return (
          <div key={category.id} className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{category.name}</h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-sm">{category.description}</p>
            </div>
            
            {data.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {userId && data.userRank && (
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg mb-4 border border-neutral-200 dark:border-neutral-700">
                    <p className="font-medium">Your Ranking</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-neutral-600 dark:bg-neutral-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {data.userRank.rank}
                        </div>
                        <span className="font-medium">You</span>
                      </div>
                      <div className="font-semibold">
                        {data.userRank.score}
                      </div>
                    </div>
                  </div>
                )}
                
                <LeaderboardTable entries={data.entries} />
                
                {data.entries.length === 0 && !data.loading && (
                  <div className="text-center py-8">
                    <p className="text-neutral-600 dark:text-neutral-400">No entries yet. Be the first to make the leaderboard!</p>
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
} 