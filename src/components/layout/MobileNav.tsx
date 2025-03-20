'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Dumbbell, BarChart2, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Home',
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
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-neutral-200 md:hidden">
      <div className="grid h-full grid-cols-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center ${
              item.active 
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <item.icon
              className={`w-6 h-6 mb-1 ${
                item.active ? 'text-neutral-900' : 'text-neutral-500'
              }`}
            />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
} 