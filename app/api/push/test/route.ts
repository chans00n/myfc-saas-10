import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendPushNotification } from '@/utils/push-notification';
import { db } from '@/utils/db/db';
import { pushSubscriptionsTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    console.log('Checking for subscriptions for user:', user.id);
    
    // First check if there are subscriptions for this user
    const subscriptions = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.user_id, user.id));
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscriptions found for user:', user.id);
      return NextResponse.json(
        { 
          success: false, 
          message: 'No subscriptions found. Please subscribe to push notifications first.',
          debug: {
            user_id: user.id,
            subscription_count: 0
          }
        },
        { status: 404 }
      );
    }
    
    console.log(`Found ${subscriptions.length} subscriptions for user:`, user.id);
    
    // Send a test notification to the current user
    const result = await sendPushNotification(user.id, {
      title: 'Test Notification',
      body: 'This is a test push notification from your app!',
      icon: '/icons/192.png',
      data: {
        url: '/dashboard',
        timestamp: new Date().toISOString()
      }
    });
    
    if (!result.success) {
      console.error('Failed to send notification:', result);
      return NextResponse.json({
        success: false,
        message: 'Failed to send notification',
        debug: {
          user_id: user.id,
          subscription_count: subscriptions.length,
          error: result
        }
      });
    }
    
    console.log('Notification sent successfully:', result);
    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      debug: {
        user_id: user.id,
        subscription_count: subscriptions.length,
        results: result.results
      }
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send test notification',
        message: error instanceof Error ? error.message : String(error),
        debug: { user_id: user.id }
      },
      { status: 500 }
    );
  }
} 