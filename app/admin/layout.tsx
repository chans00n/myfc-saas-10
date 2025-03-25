"use client";

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to determine mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use the 80.png icon for both light and dark mode
  const logoSrc = '/icons/80.png';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-100 dark:bg-neutral-950 relative">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - fixed position on both mobile and desktop */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 h-full",
          "lg:h-screen lg:sticky lg:top-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AdminSidebar 
          onClose={() => setSidebarOpen(false)} 
          defaultCollapsed={isMobile ? false : true}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-white dark:bg-neutral-900 min-w-0 w-full">
        {/* Mobile header with menu button */}
        <div className="sticky top-0 z-30 flex items-center p-4 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 lg:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(true)}
            className="mr-4"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Image 
            src={logoSrc} 
            alt="MYFC Logo" 
            width={80} 
            height={80} 
            className="h-7 w-auto"
          />
        </div>
        
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
} 