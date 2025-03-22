import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviderServer } from "@/components/ThemeProviderServer";
import Script from "next/script";
import { ServiceWorkerRegistry } from "@/components/ServiceWorkerRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MYFC - My Face Coach",
  description: "Daily facial exercises and tracking",
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
    apple: [
      { url: './apple-icon.png' },
      { url: './apple-touch-icon.png' },
      { url: './apple-touch-icon-precomposed.png' },
      { url: './icons/180.png', sizes: '180x180', type: 'image/png' },
      { url: './icons/152.png', sizes: '152x152', type: 'image/png' },
      { url: './icons/120.png', sizes: '120x120', type: 'image/png' }
    ],
    icon: [
      { url: './favicon.ico', sizes: '16x16' },
      { url: './icons/16.png', sizes: '16x16' },
      { url: './icons/32.png', sizes: '32x32' },
      { url: './icons/192.png', sizes: '192x192' },
      { url: './icons/512.png', sizes: '512x512' },
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
        <link rel="manifest" href="./manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MYFC" />
        <meta name="format-detection" content="telephone=no" />
        
        <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="./icons/152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="./icons/180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="./icons/167.png" />
      </head>
      
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
      
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100`}>
        <ThemeProviderServer>
          <ServiceWorkerRegistry />
          {children}
        </ThemeProviderServer>
      </body>
    </html>
  );
}
