import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
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
  title: "MyFC",
  description: "My Face Coach App",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let theme: 'light' | 'dark' = 'light';
  
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        const userRecord = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, user.email!))
          .limit(1);
        
        if (userRecord.length > 0 && userRecord[0]?.theme_preference) {
          theme = userRecord[0].theme_preference as 'light' | 'dark';
        }
      } catch (dbError) {
        console.error("Database error fetching theme preference:", dbError);
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
  }

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
        <link rel="apple-touch-icon" href="/icons/192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
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
