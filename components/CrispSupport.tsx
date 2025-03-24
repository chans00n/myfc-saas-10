'use client';

import { useCrisp } from '@/hooks/useCrisp';
import { HelpCircle } from 'lucide-react';

export default function CrispSupport() {
  const { show } = useCrisp();

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        show();
      }}
      className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
      <HelpCircle className="mr-2 h-4 w-4" />
      <span>Support</span>
    </button>
  );
} 