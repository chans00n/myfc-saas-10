"use client"

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Users, Database, Bug, ExternalLink, PanelLeftClose, PanelLeft, Dumbbell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminSidebarProps {
  onClose?: () => void;
  defaultCollapsed?: boolean;
}

export function AdminSidebar({ onClose, defaultCollapsed = true }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const { theme } = useTheme();
  
  // Update collapsed state when defaultCollapsed changes
  useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);
  
  // Define admin navigation items
  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Settings,
      active: pathname === '/admin',
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      active: pathname === '/admin/users',
    },
    {
      name: 'Workouts',
      href: '/admin/workouts',
      icon: Dumbbell,
      active: pathname.startsWith('/admin/workouts'),
    },
    {
      name: 'Database',
      href: '/admin/database',
      icon: Database,
      active: pathname === '/admin/database',
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: Bell,
      active: pathname === '/admin/notifications',
    },
    {
      name: 'Debug',
      href: '/admin/notifications/debug',
      icon: Bug,
      active: pathname === '/admin/notifications/debug',
    },
  ];

  // Determine which logo to show based on theme
  const logoSrc = theme === 'dark' ? '/myfc-logo-dark.png' : '/myfc-logo.png';

  return (
    <div 
      className={cn(
        "h-screen bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col overflow-y-auto transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        {!collapsed ? (
          <div className="flex-shrink-0">
            <Image 
              src={logoSrc} 
              alt="MYFC Logo" 
              width={120} 
              height={40} 
              className="h-8 w-auto" 
            />
          </div>
        ) : (
          <div className="flex-shrink-0 mx-auto">
            <Image 
              src={logoSrc} 
              alt="MYFC Logo" 
              width={30} 
              height={30} 
              className="h-8 w-auto" 
            />
          </div>
        )}
        
        <div className="flex items-center ml-auto">
          {/* Mobile close button */}
          {onClose && !collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="mr-2 lg:hidden text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
          
          {/* Collapse/expand button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          >
            {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        {!collapsed && (
          <div className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 px-2">
            Navigation
          </div>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  collapsed ? "justify-center" : "",
                  item.active 
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50" 
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-50"
                )}
                title={collapsed ? item.name : undefined}
                onClick={onClose && !item.active ? onClose : undefined}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sidebar Footer */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 mt-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("w-full mb-4", collapsed && "px-2")} 
          asChild
        >
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2" 
            title="Back to Main App"
            onClick={onClose}
          >
            <ExternalLink className="h-4 w-4" />
            {!collapsed && <span>Back to Main App</span>}
          </Link>
        </Button>
        {!collapsed && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} MYFC
          </p>
        )}
      </div>
    </div>
  );
} 