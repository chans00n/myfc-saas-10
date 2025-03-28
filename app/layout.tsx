import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistry } from "@/components/service-worker-registry";
import { dynamic } from './config';
import { Providers } from '@/components/Providers';
import { ClientLayout } from '@/components/client-layout';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rise & Lift",
  description: "Your daily facial fitness companion",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export { dynamic };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ServiceWorkerRegistry />
            <ClientLayout>{children}</ClientLayout>
            <Toaster position="bottom-right" closeButton richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
