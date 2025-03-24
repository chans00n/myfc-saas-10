'use client';

import { useState, useEffect, ReactNode } from 'react';

interface BillingLinkProps {
  children: ReactNode;
}

export default function BillingLink({ children }: BillingLinkProps) {
  const [billingUrl, setBillingUrl] = useState<string>('#');
  
  useEffect(() => {
    const fetchBillingUrl = async () => {
      try {
        const response = await fetch('/api/billing/portal', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch billing portal URL');
        }
        
        const data = await response.json();
        setBillingUrl(data.url);
      } catch (error) {
        console.error('Error fetching billing URL:', error);
      }
    };
    
    fetchBillingUrl();
  }, []);
  
  return (
    <a 
      href={billingUrl} 
      className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
      {children}
    </a>
  );
} 