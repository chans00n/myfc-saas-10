"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Users, Database, Bug, ExternalLink, PanelLeftClose, PanelLeft, Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
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

  return (
    <div 
      className={cn(
        "h-screen bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col sticky top-0 overflow-y-auto transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
        {!collapsed && <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">MYFC Admin</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
        >
          {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </Button>
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
          <Link href="/dashboard" className="flex items-center gap-2" title="Back to Main App">
            <ExternalLink className="h-4 w-4" />
            {!collapsed && <span>Back to Main App</span>}
          </Link>
        </Button>
        {!collapsed && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {new Date().getFullYear()} MYFC Admin
          </p>
        )}
      </div>
    </div>
  );
} 