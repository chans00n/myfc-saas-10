import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistry } from "@/components/service-worker-registry";
import { dynamic } from './config';
import { Providers } from '@/components/Providers';
import { ClientLayout } from '@/components/client-layout';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'MYFC',
  description: 'Elevate your routine with facial fitness. Join MYFC - the ultimate destination for personalized training and support.',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MYFC',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f5' },
    { media: '(prefers-color-scheme: dark)', color: '#171717' },
  ],
};

export { dynamic };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </head>
      <body className={cn(
        'min-h-screen bg-neutral-50 dark:bg-neutral-900 font-sans antialiased',
        'h-full w-full overflow-x-hidden',
        'relative',
        inter.className
      )}>
        {/* Background that extends into safe areas */}
        <div className="fixed inset-0 w-full h-full bg-neutral-50 dark:bg-neutral-900 -z-10" />
        
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ServiceWorkerRegistry />
            <ClientLayout>
              <div className="pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right">
                {children}
              </div>
            </ClientLayout>
            <Toaster position="bottom-right" closeButton richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
