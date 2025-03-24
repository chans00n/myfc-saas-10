import webpush from 'web-push';
import { db } from '@/utils/db/db';
import { pushSubscriptionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Set VAPID keys - in production, stored in environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidContact = process.env.VAPID_CONTACT || '';

webpush.setVapidDetails(
  `mailto:${vapidContact}`,
  vapidPublicKey,
  vapidPrivateKey
);

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
}

export async function sendPushNotification(
  userId: string,
  options: PushNotificationOptions
) {
  try {
    // Get all subscriptions for the user
    const subscriptions = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.user_id, userId));
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for user:', userId);
      return { success: false, message: 'No subscriptions found' };
    }
    
    const payload = JSON.stringify(options);
    const results = [];
    
    for (const sub of subscriptions) {
      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };
        
        await webpush.sendNotification(subscription, payload);
        results.push({ endpoint: sub.endpoint, success: true });
      } catch (error: any) {
        console.error('Error sending push notification:', error);
        
        // If subscription is expired or invalid, remove it
        if (error.statusCode === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.id, sub.id));
        }
        
        results.push({ 
          endpoint: sub.endpoint, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
} 