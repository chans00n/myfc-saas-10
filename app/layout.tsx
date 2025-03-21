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
    statusBarStyle: "default",
    title: "MYFC",
  },
  applicationName: "MYFC - My Face Coach",
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: '/apple-icon.png',
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
  }
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
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
      
      <body className={`${inter.className} min-h-screen bg-neutral-50 dark:bg-neutral-900 dark:text-neutral-100`}>
        <ThemeProviderServer>
          {children}
        </ThemeProviderServer>
      </body>
    </html>
  );
}
