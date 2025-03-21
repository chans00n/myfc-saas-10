'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function BillingSection() {
  const [billingUrl, setBillingUrl] = useState<string>('#');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchBillingUrl = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBillingUrl();
  }, []);
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-700 p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4 dark:text-neutral-100">Manage Billing</h2>
      
      <div className="space-y-4">
        <div className="flex flex-col">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
            Manage your subscription, payment methods, and billing history.
          </p>
          
          <Link 
            href={billingUrl}
            className={`w-full md:w-auto inline-flex items-center justify-center px-4 py-2 bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100 font-medium rounded-lg hover:bg-neutral-900 dark:hover:bg-neutral-600 transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            onClick={(e) => isLoading && e.preventDefault()}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Manage Membership
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
} 