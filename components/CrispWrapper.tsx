'use client';

import React from 'react';
import CrispProvider from '@/contexts/CrispProvider';

export function CrispWrapper({ children }: { children: React.ReactNode }) {
  return <CrispProvider>{children}</CrispProvider>;
} 