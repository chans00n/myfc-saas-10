import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { pushSubscriptionsTable, usersTable } from '@/utils/db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

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
    const subscription = await request.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }
    
    console.log('Processing subscription for user:', user.id);
    
    // Check if subscription already exists
    const existingSubscriptions = await db
      .select()
      .from(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.user_id, user.id),
          eq(pushSubscriptionsTable.endpoint, subscription.endpoint)
        )
      );
    
    const existingSubscription = existingSubscriptions.length > 0 ? existingSubscriptions[0] : null;
    
    if (existingSubscription) {
      // Update existing subscription
      console.log('Updating existing subscription for user:', user.id);
      await db
        .update(pushSubscriptionsTable)
        .set({
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date()
        })
        .where(eq(pushSubscriptionsTable.id, existingSubscription.id));
    } else {
      // Insert new subscription
      console.log('Creating new subscription for user:', user.id);
      await db
        .insert(pushSubscriptionsTable)
        .values({
          id: uuidv4(),
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth
        });
    }
    
    // Update user preferences
    await db
      .update(usersTable)
      .set({ push_notifications_enabled: true })
      .where(eq(usersTable.id, user.id));
    
    return NextResponse.json(
      { success: true, message: 'Subscription saved' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
} 