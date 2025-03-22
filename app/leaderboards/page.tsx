import { Suspense } from "react"
import { createClient } from "@/utils/supabase/server"
import LeaderboardTabs from "@/components/leaderboards/LeaderboardTabs"
import { getServerLeaderboardCategories } from "@/utils/supabase/server-community"
import MYFCNavigation from "@/components/MYFCNavigation"
import { Skeleton } from "@/components/ui/skeleton"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { MobileAvatar } from '@/components/MobileAvatar'
import dynamic from 'next/dynamic'

// Import MobileNavigation using dynamic import for client-side only rendering
const MobileNavigation = dynamic(() => import('@/components/MobileNavigation'), { ssr: false })

// Loading UI
function LeaderboardSkeleton() {
  return (
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
  )
}

// Placeholder UI when no categories exist
function NoLeaderboardsPlaceholder() {
  return (
    <div className="flex-1 md:ml-64 pb-24 md:pb-8 pt-16 md:pt-0">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Community Leaderboards</h1>
        <div className="bg-white dark:bg-neutral-800 p-8 rounded-lg text-center border border-neutral-200 dark:border-neutral-700">
          <p className="mb-6">Leaderboards are being updated. Check back soon!</p>
        </div>
      </div>
    </div>
  )
}

// Main leaderboards content
async function LeaderboardContent() {
  const supabase = createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ''
  const userAvatarUrl = user?.user_metadata?.avatar_url || ''
  const userEmail = user?.email || ''
  
  // Get leaderboard categories
  const categories = await getServerLeaderboardCategories()
  
  if (!categories || categories.length === 0) {
    return <NoLeaderboardsPlaceholder />
  }
  
  return (
    <div className="flex-1 md:ml-64 pb-24 md:pb-8 pt-16 md:pt-0">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Community Leaderboards</h1>
        
        <LeaderboardTabs categories={categories} userId={userId} />
        
        {/* Admin-only section */}
        {user?.email === 'admin@myfc.app' && (
          <div className="mt-6 bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium mb-2">Admin Controls</h3>
            <div className="flex gap-2">
              <form action={`/api/leaderboards/update`} method="POST">
                <Button type="submit" size="sm">
                  Update Leaderboards
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Main page component
export default function LeaderboardsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Desktop navigation */}
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
      
      {/* Main content with suspense for loading state */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardContent />
      </Suspense>
      
      {/* Mobile navigation */}
      <MobileNavigation />
    </div>
  )
} 