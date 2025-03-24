'use client';

import { useState, useEffect } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSupport = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if Push API is supported
        const supported = 'serviceWorker' in navigator && 
                          'PushManager' in window && 
                          'Notification' in window;
        
        setIsSupported(supported);
        
        if (!supported) {
          console.log('Push notifications are not supported in this browser');
          setIsLoading(false);
          return;
        }
        
        // Check notification permission
        setPermission(Notification.permission);
        console.log('Notification permission status:', Notification.permission);
        
        // Check for existing subscription
        if (Notification.permission === 'granted') {
          try {
            const registration = await navigator.serviceWorker.ready;
            console.log('Service worker is ready:', registration);
            
            const existingSubscription = await registration.pushManager.getSubscription();
            console.log('Existing subscription:', existingSubscription ? 'Found' : 'None');
            
            setSubscription(existingSubscription);
          } catch (err) {
            console.error('Error checking existing subscription:', err);
          }
        }
      } catch (err) {
        console.error('Error checking push notification support:', err);
        setError('Failed to initialize push notifications');
      }
      
      setIsLoading(false);
    };
    
    checkSupport();
  }, []);

  const requestPermission = async () => {
    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setPermission(permission);
      return permission;
    } catch (err) {
      console.error('Error requesting permission:', err);
      setError('Failed to request notification permission');
      return 'denied';
    }
  };

  const subscribe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure permission is granted
      if (Notification.permission !== 'granted') {
        console.log('Permission not granted, requesting...');
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') {
          setError('Permission denied');
          setIsLoading(false);
          return null;
        }
      }
      
      // Get service worker registration
      console.log('Waiting for service worker to be ready...');
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);
      
      // Get VAPID public key from server
      console.log('Fetching VAPID public key...');
      const response = await fetch('/api/push/keys');
      const data = await response.json();
      const { publicKey } = data;
      
      if (!publicKey) {
        console.error('No VAPID public key returned from server');
        throw new Error('VAPID public key not available');
      }
      
      console.log('VAPID public key retrieved');
      
      // Convert base64 to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      
      // Subscribe to push service
      console.log('Subscribing to push service...');
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      
      console.log('Push subscription created:', newSubscription);
      
      // Save subscription to server
      console.log('Saving subscription to server...');
      const saveResponse = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription)
      });
      
      const saveResult = await saveResponse.json();
      console.log('Subscription save result:', saveResult);
      
      if (!saveResponse.ok) {
        throw new Error(`Failed to save subscription: ${saveResult.error || 'Unknown error'}`);
      }
      
      setSubscription(newSubscription);
      setIsLoading(false);
      return newSubscription;
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError(`Failed to subscribe: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      return null;
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!subscription) {
        console.log('No active subscription to unsubscribe');
        setIsLoading(false);
        return true;
      }
      
      console.log('Unsubscribing from push service...');
      
      // Unsubscribe from push service
      await subscription.unsubscribe();
      console.log('Unsubscribed from push service');
      
      // Remove subscription from server
      console.log('Removing subscription from server...');
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });
      
      const result = await response.json();
      console.log('Unsubscribe server result:', result);
      
      if (!response.ok) {
        throw new Error(`Failed to remove subscription: ${result.error || 'Unknown error'}`);
      }
      
      setSubscription(null);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError(`Failed to unsubscribe: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
      return false;
    }
  };

  // Helper function to convert base64 string to Uint8Array
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe
  };
} 