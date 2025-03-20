'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Dumbbell, BarChart2, User } from 'lucide-react';

export default function DesktopNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard',
    },
    {
      name: 'Workouts',
      href: '/workouts',
      icon: Dumbbell,
      active: pathname.startsWith('/workouts'),
    },
    {
      name: 'Progress',
      href: '/progress',
      icon: BarChart2,
      active: pathname === '/progress',
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      active: pathname === '/profile',
    },
  ];

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-neutral-200 h-screen p-4 sticky top-0">
      <div className="text-xl font-bold mb-8 px-4">MYFC</div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
              item.active
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
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