"use client";

import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-neutral-100 dark:bg-neutral-950 relative">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - fixed position on mobile, regular on desktop */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:relative lg:z-0 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar 
          onClose={() => setSidebarOpen(false)} 
          defaultCollapsed={isMobile ? false : true}
        />
      </div>
      
      {/* Main content */}
      <div className="flex-1 bg-white dark:bg-neutral-900 min-w-0">
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
          <h1 className="text-lg font-semibold">MYFC Admin</h1>
        </div>
        
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
} 