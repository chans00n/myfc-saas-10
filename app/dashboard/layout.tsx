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

const InstallPWA = dynamic(() => import('@/components/InstallPWA'), { ssr: false });

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
            {/* Only render side navigation on desktop */}
            <div className="hidden md:block">
                <MYFCNavigation />
            </div>
            
            {/* Mobile-only top avatar bar */}
            <div className="md:hidden flex justify-between items-center p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <div className="text-center">
                    <Image 
                        src={logoSrc}
                        alt="MYFC Logo" 
                        width={80} 
                        height={80} 
                        className="object-contain h-auto w-auto max-w-[80px] max-h-[80px] dark:hidden"
                    />
                    <Image 
                        src="/logo_white.png"
                        alt="MYFC Logo" 
                        width={80} 
                        height={80} 
                        className="object-contain h-auto w-auto max-w-[80px] max-h-[80px] hidden dark:block"
                    />
                </div>
                
                <div className="flex items-center">
                    <MobileAvatar userEmail={userEmail} userAvatarUrl={avatarUrl} />
                </div>
            </div>
            
            <div className="flex-1 md:ml-64 pb-24 md:pb-8">
                {children}
            </div>
            
            {/* PWA Install Prompt */}
            <InstallPWA />
            
            {/* Mobile Navigation */}
            <div className="md:hidden flex justify-around items-center fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-700 h-16 z-10">
                <Link href="/dashboard" className="flex flex-col items-center justify-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-800 dark:text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-xs mt-1 text-neutral-800 dark:text-neutral-300">Home</span>
                </Link>
                <Link href="/dashboard/library" className="flex flex-col items-center justify-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">Lifts</span>
                </Link>
                <Link href="/dashboard/movements" className="flex flex-col items-center justify-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">Movements</span>
                </Link>
                <Link href="/dashboard/history" className="flex flex-col items-center justify-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">History</span>
                </Link>
                <Link href="/dashboard/progress" className="flex flex-col items-center justify-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-600 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-xs mt-1 text-neutral-600 dark:text-neutral-400">Progress</span>
                </Link>
            </div>
        </div>
    );
}
