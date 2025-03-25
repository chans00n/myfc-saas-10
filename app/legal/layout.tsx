import type { Metadata } from "next";
import MYFCNavigation from "@/components/MYFCNavigation";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { MobileAvatar } from "@/components/MobileAvatar";
import { createClient } from "@/utils/supabase/server";

const MobileNavigation = dynamic(() => import('@/components/MobileNavigation'), { ssr: false });

export const metadata: Metadata = {
  title: "Legal Information | My Facial Fitness",
  description: "Legal information and policy documents for My Facial Fitness",
};

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { userEmail: undefined, userAvatarUrl: undefined };
  }
  
  // Try to get the avatar URL from user metadata
  const userAvatarUrl = user.user_metadata?.avatar_url;
  
  return {
    userEmail: user.email,
    userAvatarUrl
  };
}

export default async function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userEmail, userAvatarUrl } = await getUser();
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
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
        
        {/* Add user avatar menu here */}
        <div className="flex items-center">
          <MobileAvatar userEmail={userEmail} userAvatarUrl={userAvatarUrl} />
        </div>
      </div>
      
      <div className="flex-1 md:ml-64 pb-24 md:pb-8"
           style={{
               paddingBottom: 'max(96px, calc(64px + env(safe-area-inset-bottom)))'
           }}>
        {children}
      </div>
      
      {/* Mobile Navigation with safe area insets */}
      <MobileNavigation />
    </div>
  );
} 