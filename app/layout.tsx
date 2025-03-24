import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Script from "next/script";
import { ServiceWorkerRegistry } from "@/components/ServiceWorkerRegistry";
import { Toaster } from "sonner";
import { CrispWrapper } from '@/components/CrispWrapper';
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import { eq } from "drizzle-orm";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MYFC - My Face Coach",
  description: "Daily facial exercises and tracking",
  keywords: [
    'Fitness',
    'Gym',
    'Workout',
    'Progress',
    'Fitness tracking',
    'Exercise',
  ],
  authors: [
    {
      name: 'chriss',
      url: 'https://chriss.com',
    },
  ],
  creator: 'chriss',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://myfc.com',
    title: 'MYFC - My Face Coach',
    description: 'Daily facial exercises and tracking',
    siteName: 'MYFC - My Face Coach',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MYFC - My Face Coach',
    description: 'Daily facial exercises and tracking',
    images: [`https://myfc.com/og.jpg`],
    creator: '@chriss',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MYFC",
    startupImage: [
      {
        url: "./icons/512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "./icons/512.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  applicationName: "MYFC - My Face Coach",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { url: '/icons/192.png', sizes: '192x192' },
      { url: '/icons/512.png', sizes: '512x512' },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "MYFC"
  }
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Default theme
  let theme: 'light' | 'dark' = 'light';
  
  try {
    // Get the current user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Fetch user's theme preference from database
        const userRecord = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, user.email!))
          .limit(1);
        
        // The theme_preference column might not exist yet, so use optional chaining
        // to avoid errors if the property doesn't exist
        if (userRecord.length > 0 && userRecord[0]?.theme_preference) {
          theme = userRecord[0].theme_preference as 'light' | 'dark';
        }
      } catch (dbError) {
        // Continue with default theme
        console.error("Database error fetching theme preference:", dbError);
      }
    }
  } catch (error) {
    // Continue with default theme
    console.error("Authentication error:", error);
  }

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MYFC" />
        <meta name="format-detection" content="telephone=no" />
        
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/167.png" />
        
        {/* Early service worker registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              const isMembersSubdomain = window.location.hostname === 'members.myfc.app';
              const swPath = isMembersSubdomain ? './sw.js' : '/sw.js';
              const swScope = isMembersSubdomain ? './' : '/';
              
              console.log('[PWA] Registering service worker from layout.tsx');
              navigator.serviceWorker.register(swPath, {
                scope: swScope
              }).then(function(reg) {
                console.log('[PWA] Service worker registered:', reg.scope);
              }).catch(function(err) {
                console.error('[PWA] Service worker registration failed:', err);
              });
            }
          `
        }} />
        
        {/* Required for pricing table */}
        <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
        
        {/* Simple iOS standalone detection and redirection - subdomain aware */}
        <Script
          id="ios-standalone-fix"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // Simple detection
              function isMembersSubdomain() {
                return window.location.hostname === 'members.myfc.app';
              }
              
              console.log('Current hostname:', window.location.hostname);
              console.log('Is members subdomain:', isMembersSubdomain());
              
              if (window.navigator.standalone === true) {
                console.log('iOS standalone mode detected');
                localStorage.setItem('pwaStandalone', 'true');
                
                // Redirect directly to dashboard if on root
                if (window.location.pathname === '/' || 
                    window.location.pathname.includes('index')) {
                  console.log('Redirecting to dashboard from root'); 
                  window.location.replace('./dashboard');
                }
              }
            `,
          }}
        />
      </head>
      
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100`}>
        <ThemeProvider initialTheme={theme}>
          <CrispWrapper>
            <ServiceWorkerRegistry />
            {children}
            <Toaster position="bottom-right" closeButton richColors />
          </CrispWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
