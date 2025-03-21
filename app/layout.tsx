import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviderServer } from "@/components/ThemeProviderServer";
import Script from "next/script";
import Head from "next/head";
import { Suspense, useEffect } from 'react'

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
  // Register service worker for PWA functionality
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          // Check if we're on a subdomain
          const hostname = window.location.hostname;
          const isSubdomain = hostname.split('.').length > 2;
          
          console.log(`[PWA] Running on ${hostname}, subdomain: ${isSubdomain}`);
          
          // Choose the appropriate service worker based on environment
          const swPath = isSubdomain ? '/root-sw.js' : '/sw.js';
          const initialScope = '/';
          
          console.log(`[PWA] Attempting to register service worker from ${swPath} with scope ${initialScope}`);
          
          try {
            // Try to register with the primary service worker and root scope
            const registration = await navigator.serviceWorker.register(swPath, {
              scope: initialScope,
              updateViaCache: 'none' // Prevent the browser from using cached versions
            });
            
            console.log(`[PWA] Service worker registered successfully with scope: ${registration.scope}`);
            
            // Listen for new service workers and notify the user
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              
              if (!newWorker) return;
              
              console.log('[PWA] New service worker is being installed');
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New service worker available, refresh to update');
                  
                  // Show notification to the user about the update
                  if (window.confirm('A new version of the app is available. Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            });
          } catch (primaryError) {
            console.error(`[PWA] Primary service worker registration failed: ${primaryError}`);
            
            // If the primary registration failed, try with different scopes
            const fallbackScopes = ['/', '/app/', window.location.pathname];
            
            for (const scope of fallbackScopes) {
              try {
                console.log(`[PWA] Trying to register with scope: ${scope}`);
                const registration = await navigator.serviceWorker.register(swPath, {
                  scope: scope,
                  updateViaCache: 'none'
                });
                
                console.log(`[PWA] Service worker registered with fallback scope: ${registration.scope}`);
                return; // Exit if successful
              } catch (scopeError) {
                console.error(`[PWA] Registration with scope ${scope} failed: ${scopeError}`);
              }
            }
            
            // If all attempts with primary service worker failed, try the fallback service worker
            try {
              console.log('[PWA] Trying fallback service worker');
              const fallbackRegistration = await navigator.serviceWorker.register('/fallback-sw.js', {
                scope: '/',
                updateViaCache: 'none'
              });
              
              console.log(`[PWA] Fallback service worker registered with scope: ${fallbackRegistration.scope}`);
            } catch (fallbackError) {
              console.error(`[PWA] Fallback service worker registration also failed: ${fallbackError}`);
              console.log('[PWA] Service worker registration failed completely');
            }
          }
        } catch (error) {
          console.error('[PWA] Service worker registration error:', error);
        }
      };

      // Register the service worker when the app loads
      registerServiceWorker();
      
      // Set up online/offline status handling
      const handleOnlineStatus = () => {
        const isOnline = navigator.onLine;
        console.log(`[PWA] Network status changed. Online: ${isOnline}`);
        
        // Notify the service worker about the connection status change
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'ONLINE_STATUS_CHANGE',
            isOnline
          });
        }
        
        // Optionally show a toast notification to the user
        if (!isOnline) {
          // You can implement a toast component here
          console.log('[PWA] You are offline. The app will continue to work with limited functionality.');
        } else {
          console.log('[PWA] You are back online.');
        }
      };
      
      // Listen for online/offline events
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);
      
      // Initial check
      handleOnlineStatus();
      
      // Cleanup listeners on component unmount
      return () => {
        window.removeEventListener('online', handleOnlineStatus);
        window.removeEventListener('offline', handleOnlineStatus);
      };
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Theme colors */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
      
      {/* PWA Service Worker Registration */}
      <Script
        id="register-sw"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                // Determine if we're on a subdomain
                const isSubdomain = window.location.hostname.split('.').length > 2;
                const swPath = isSubdomain ? '/root-sw.js' : '/sw.js';
                console.log('Registering service worker from:', swPath);
                
                navigator.serviceWorker.register(swPath, {
                  scope: '/', // Explicitly set scope to root
                  updateViaCache: 'none' // Prevent browser cache from interfering with updates
                }).then(function(registration) {
                  console.log('Service Worker registered with scope:', registration.scope);
                  
                  // Check for updates on page load
                  registration.update().catch(err => console.log('Update check failed:', err));
                  
                  // Check for updates periodically
                  setInterval(() => {
                    registration.update().catch(err => console.log('Periodic update failed:', err));
                  }, 60 * 60 * 1000); // Check every hour
                  
                  // Update on page transitions
                  let refreshing = false;
                  
                  // When a new SW is waiting, handle refresh
                  navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (refreshing) return;
                    refreshing = true;
                    console.log('Service worker controller changed, reloading page');
                    window.location.reload();
                  });
                  
                  // Listen for messages from service worker
                  navigator.serviceWorker.addEventListener('message', (event) => {
                    console.log('Message from service worker:', event.data);
                    if (event.data && event.data.type === 'RELOAD_PAGE') {
                      window.location.reload();
                    }
                  });
                }).catch(function(err) {
                  console.error('Service Worker registration failed:', err);
                  
                  // Try different scope options if main registration fails
                  const scopeOptions = ['/', '/dashboard/', window.location.pathname];
                  console.log('Trying alternative scopes:', scopeOptions);
                  
                  let registerPromise = Promise.reject();
                  
                  // Try each scope option in sequence
                  scopeOptions.forEach(scope => {
                    registerPromise = registerPromise.catch(() => {
                      console.log('Trying registration with scope:', scope);
                      return navigator.serviceWorker.register(swPath, { 
                        scope: scope, 
                        updateViaCache: 'none'
                      });
                    });
                  });
                  
                  registerPromise
                    .then(reg => {
                      console.log('Successfully registered with alternative scope:', reg.scope);
                    })
                    .catch(error => {
                      console.error('All scope alternatives failed:', error);
                      
                      // Fall back to the fallback service worker if all attempts fail
                      navigator.serviceWorker.register('/fallback-sw.js', {
                        scope: '/'
                      }).then(reg => console.log('Fallback SW registered'))
                      .catch(e => console.error('Even fallback SW failed:', e));
                    });
                });
              });
              
              // Handle connectivity changes to update cached content
              window.addEventListener('online', () => {
                console.log('App is online again');
                
                // Inform service worker of online status
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'ONLINE_STATUS',
                    status: 'online'
                  });
                }
              });
              
              window.addEventListener('offline', () => {
                console.log('App is offline');
                if (navigator.serviceWorker.controller) {
                  navigator.serviceWorker.controller.postMessage({
                    type: 'ONLINE_STATUS',
                    status: 'offline'
                  });
                  
                  // Show a notification to the user
                  const offlineNotif = document.createElement('div');
                  offlineNotif.style.position = 'fixed';
                  offlineNotif.style.bottom = '20px';
                  offlineNotif.style.left = '20px';
                  offlineNotif.style.right = '20px';
                  offlineNotif.style.backgroundColor = '#ffc107';
                  offlineNotif.style.color = '#000';
                  offlineNotif.style.padding = '12px 16px';
                  offlineNotif.style.borderRadius = '8px';
                  offlineNotif.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
                  offlineNotif.style.zIndex = '9999';
                  offlineNotif.style.textAlign = 'center';
                  offlineNotif.textContent = 'You are offline. Some features may not be available.';
                  
                  document.body.appendChild(offlineNotif);
                  
                  // Remove notification when online again
                  window.addEventListener('online', function() {
                    if (document.body.contains(offlineNotif)) {
                      document.body.removeChild(offlineNotif);
                    }
                  }, { once: true });
                  
                  // Remove after 5 seconds
                  setTimeout(() => {
                    if (document.body.contains(offlineNotif)) {
                      document.body.removeChild(offlineNotif);
                    }
                  }, 5000);
                }
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
          {children}
        </ThemeProviderServer>
      </body>
    </html>
  );
}
