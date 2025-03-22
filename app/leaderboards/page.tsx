import { Metadata } from "next"
import { createClient } from "@/utils/supabase/server"
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs"
import { getLeaderboardCategories } from "@/utils/supabase/community"

export const metadata: Metadata = {
  title: "MYFC - Community Leaderboards",
  description: "View the top performers in the MYFC community",
}

export default async function LeaderboardsPage() {
  const supabase = createClient()
  const { data: user } = await supabase.auth.getUser()
  
  // Fetch leaderboard categories
  const categories = await getLeaderboardCategories()
  
  // If no categories exist yet or there's an error, show placeholder
  if (!categories || categories.length === 0) {
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
      
      <LeaderboardTabs categories={categories} userId={user.user?.id} />
    </div>
  )
} 