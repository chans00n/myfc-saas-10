import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviderServer } from "@/components/ThemeProviderServer";
import Script from "next/script";

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
      {/* Required for pricing table */}
      <script async src="https://js.stripe.com/v3/pricing-table.js"></script>
      
      {/* PWA Service Worker Registration */}
      <Script
        id="register-sw"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(err) {
                  console.error('Service Worker registration failed:', err);
                  // Try to register fallback service worker
                  navigator.serviceWorker.register('/fallback-sw.js').catch(function(err) {
                    console.error('Fallback Service Worker registration failed:', err);
                  });
                });
              });
            }
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
            // Check if we're on iOS and not in standalone mode
            if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone) {
              // Check if we're not already on the redirect page or installation page
              if (!window.location.pathname.includes('ios-redirect') && 
                  !window.location.pathname.includes('index-ios')) {
                // Remember this URL for after installation
                sessionStorage.setItem('pwaRedirectUrl', window.location.pathname);
              }
            }
            
            // If we're in standalone mode and there's a saved URL, go there
            if (window.navigator.standalone && sessionStorage.getItem('pwaRedirectUrl')) {
              const savedUrl = sessionStorage.getItem('pwaRedirectUrl');
              sessionStorage.removeItem('pwaRedirectUrl');
              if (savedUrl && savedUrl !== window.location.pathname) {
                window.location.replace(savedUrl);
              }
            }
          `,
        }}
      />
      
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100`}>
        <ThemeProviderServer>
          {children}
        </ThemeProviderServer>
      </body>
    </html>
  );
}
