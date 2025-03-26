import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import MYFCNavigation from "@/components/MYFCNavigation";
import Link from 'next/link';
import Image from 'next/image';
import { MobileAvatar } from '@/components/MobileAvatar';
import dynamic from 'next/dynamic';
import { BookmarkProvider } from '@/hooks/useWorkoutBookmark';

const InstallPWA = dynamic(() => import('@/components/InstallPWA'), { ssr: false });
const MobileNavigation = dynamic(() => import('@/components/MobileNavigation'), { ssr: false });

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "MYFC - My Face Coach",
    description: "Daily facial exercises and tracking",
};

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect("/login")
    }

    // Check if user has a plan other than 'none'
    const userRecord = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, data.user.email!))

    // If no user record found or plan is 'none', redirect to subscribe page
    if (!userRecord.length || userRecord[0].plan === "none") {
        redirect("/subscribe")
    }

    // Get user avatar URL for mobile header
    const avatarUrl = data.user.user_metadata?.avatar_url || userRecord[0].avatar_url;
    const userEmail = data.user.email;
    
    // Check the theme setting for the user
    const theme = userRecord[0].theme_preference || 'light';
    const logoSrc = theme === 'dark' ? '/logo_white.png' : '/logo.png';

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <BookmarkProvider>
                <div className="hidden md:block">
                    <MYFCNavigation />
                </div>
                
                <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700" 
                     style={{
                         paddingTop: 'max(16px, env(safe-area-inset-top))',
                         paddingLeft: 'max(16px, env(safe-area-inset-left))',
                         paddingRight: 'max(16px, env(safe-area-inset-right))'
                     }}>
                    <Link href="/dashboard" className="text-center">
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
                    </Link>
                    
                    <div className="flex items-center">
                        <MobileAvatar userEmail={userEmail} userAvatarUrl={avatarUrl} />
                    </div>
                </div>
                
                <div className="flex-1 md:ml-64 pb-24 md:pb-8"
                     style={{
                         paddingBottom: '50px'
                     }}>
                    {children}
                </div>
                
                {/* PWA Install Prompt */}
                <InstallPWA />
                
                {/* Mobile Navigation with safe area insets */}
                <MobileNavigation />
            </BookmarkProvider>
        </div>
    );
}
