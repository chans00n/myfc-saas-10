"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, SmartphoneIcon } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function PushNotificationSettings() {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotifications();
  
  const [statusMessage, setStatusMessage] = useState('');
  
  useEffect(() => {
    if (!isSupported) {
      setStatusMessage('Push notifications are not supported in this browser.');
    } else if (permission === 'denied') {
      setStatusMessage('Push notifications are blocked. Please enable them in your browser settings.');
    } else if (error) {
      setStatusMessage(`Error: ${error}`);
    } else {
      setStatusMessage('');
    }
  }, [isSupported, permission, error]);
  
  const handleToggleSubscription = async (enabled: boolean) => {
    if (enabled) {
      await subscribe();
    } else {
      await unsubscribe();
    }
  };
  
  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      await subscribe();
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center py-3">
        <div className="animate-pulse h-5 w-5 bg-neutral-200 dark:bg-neutral-700 rounded-full mr-2"></div>
        <div className="animate-pulse h-5 w-40 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
      </div>
    );
  }
  
  // Not supported or permission denied
  if (!isSupported || permission === 'denied') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Device Notification Permissions</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{statusMessage}</p>
          </div>
          <Switch disabled checked={false} />
        </div>
        
        {permission === 'denied' && (
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md text-sm text-neutral-600 dark:text-neutral-300">
            <p className="flex items-center">
              <BellOff className="h-4 w-4 mr-2 text-neutral-500" />
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          </div>
        )}
      </div>
    );
  }
  
  // Permission not requested yet
  if (permission === 'default') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Device Notification Permissions</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Enable browser notifications on this device</p>
          </div>
          <Button 
            onClick={handleRequestPermission}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <Bell className="h-4 w-4 mr-2" />
            Enable
          </Button>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Note: After enabling device permissions, you still need to enable the specific notification types above.
        </p>
      </div>
    );
  }
  
  // Permission granted - toggle subscription
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-neutral-800 dark:text-neutral-200">Device Notification Permissions</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {isSubscribed ? 'This device can receive notifications' : 'Not receiving notifications on this device'}
          </p>
        </div>
        <Switch 
          checked={isSubscribed} 
          onCheckedChange={handleToggleSubscription} 
        />
      </div>
      
      {isSubscribed && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Device permissions enabled. Make sure to also enable the specific notification types above.
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
} 