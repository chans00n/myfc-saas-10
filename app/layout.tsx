import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviderServer } from "@/components/ThemeProviderServer";
import Script from "next/script";
import Head from "next/head";
import { ServiceWorkerRegistry } from "@/components/ServiceWorkerRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MYFC - My Face Coach",
  description: "Daily facial exercises and tracking",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MYFC",
    startupImage: [
      {
        url: "/icons/512.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
      },
      {
        url: "/icons/512.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
      }
    ]
  },
  applicationName: "MYFC - My Face Coach",
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: [
      { url: '/apple-icon.png' },
      { url: '/apple-touch-icon.png' },
      { url: '/apple-touch-icon-precomposed.png' },
      { url: '/icons/180.png', sizes: '180x180', type: 'image/png' },
      { url: '/icons/152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/120.png', sizes: '120x120', type: 'image/png' }
    ],
    icon: [
      { url: '/favicon.ico', sizes: '16x16' },
      { url: '/icons/16.png', sizes: '16x16' },
      { url: '/icons/32.png', sizes: '32x32' },
      { url: '/icons/192.png', sizes: '192x192' },
      { url: '/icons/512.png', sizes: '512x512' },
    ]
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MyFC" />
        <meta name="format-detection" content="telephone=no" />
        
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/167.png" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      {/* Required for pricing table */}
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      
      {/* Direct iOS Standalone Mode Meta Tags */}
      <Script
        id="ios-meta-tags"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Add direct meta tags to head
            const metaTags = [
              { name: "apple-mobile-web-app-capable", content: "yes" },
              { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
              { name: "apple-mobile-web-app-title", content: "MYFC" },
              { name: "format-detection", content: "telephone=no" }
            ];
            
            metaTags.forEach(tag => {
              const meta = document.createElement('meta');
              meta.name = tag.name;
              meta.content = tag.content;
              document.head.appendChild(meta);
            });
            
            // Add direct link tags for icons
            const linkTags = [
              { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
              { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/180.png" },
              { rel: "apple-touch-icon", sizes: "152x152", href: "/icons/152.png" },
              { rel: "apple-touch-icon", sizes: "120x120", href: "/icons/120.png" }
            ];
            
            linkTags.forEach(tag => {
              const link = document.createElement('link');
              link.rel = tag.rel;
              if (tag.sizes) link.sizes = tag.sizes;
              link.href = tag.href;
              document.head.appendChild(link);
            });
          `,
        }}
      />
      
      {/* Standalone mode detector */}
      <Script
        id="standalone-detector"
        src="/standalone.js"
        strategy="beforeInteractive"
      />
      
      {/* iOS Standalone Mode Fix */}
      <Script
        id="ios-standalone-fix"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            // Helper function to check if we're on iOS
            function isIOS() {
              return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            }
            
            // Check if app is in standalone mode (installed to home screen)
            function isInStandaloneMode() {
              return window.navigator.standalone || 
                window.matchMedia('(display-mode: standalone)').matches ||
                localStorage.getItem('pwaStandalone') === 'true';
            }
            
            // If we're on iOS in standalone mode, store the flag
            if (isIOS() && isInStandaloneMode()) {
              localStorage.setItem('pwaStandalone', 'true');
              console.log('Running in iOS standalone mode');
              
              // Also set a temporary flag in sessionStorage for this session
              sessionStorage.setItem('iosStandaloneSession', 'true');
              
              // Redirect to dashboard if we're on the root URL
              if (window.location.pathname === '/' || 
                  window.location.pathname === '/index.html' ||
                  window.location.pathname === '/index-ios.html') {
                console.log('Redirecting standalone session to dashboard');
                window.location.replace('/dashboard');
              }
            }
            
            // Remember URL after installation
            if (isIOS() && !isInStandaloneMode()) {
              // Save current URL unless we're on special pages
              if (!window.location.pathname.includes('ios-redirect') && 
                  !window.location.pathname.includes('index-ios')) {
                sessionStorage.setItem('pwaRedirectUrl', window.location.pathname);
              }
            }
            
            // If we're in standalone mode and there's a saved URL, go there
            if (isInStandaloneMode() && sessionStorage.getItem('pwaRedirectUrl')) {
              const savedUrl = sessionStorage.getItem('pwaRedirectUrl');
              sessionStorage.removeItem('pwaRedirectUrl');
              if (savedUrl && savedUrl !== window.location.pathname) {
                console.log('Redirecting to saved URL:', savedUrl);
                window.location.replace(savedUrl);
              }
            }
          `,
        }}
      />
      
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100`}>
        <ThemeProviderServer>
          <ServiceWorkerRegistry />
          {children}
        </ThemeProviderServer>
      </body>
    </html>
  );
}
