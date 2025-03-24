'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Settings, Users, Database, Bug } from 'lucide-react';

export default function AdminNavigation() {
  const pathname = usePathname();
  
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
    <div className="w-64 border-r border-neutral-200 dark:border-neutral-700 h-screen p-4 sticky top-0">
      <div className="text-xl font-bold mb-8 px-4">Admin Panel</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
              item.active
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
} 