'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function NotificationTester() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendTestNotification = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setResult({ error: 'Failed to send test notification' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button
        onClick={sendTestNotification}
        disabled={isLoading}
        variant="outline"
        className="flex items-center"
      >
        <Bell className="mr-2 h-4 w-4" />
        {isLoading ? 'Sending...' : 'Send Test Notification'}
      </Button>
      
      {result && (
        <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 