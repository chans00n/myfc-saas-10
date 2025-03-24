import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { pushSubscriptionsTable, usersTable } from '@/utils/db/schema';
import { and, eq, sql } from 'drizzle-orm';

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
    const { endpoint } = await request.json();
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      );
    }
    
    console.log('Unsubscribing user:', user.id, 'from endpoint:', endpoint);
    
    // Delete subscription from database
    await db
      .delete(pushSubscriptionsTable)
      .where(
        and(
          eq(pushSubscriptionsTable.user_id, user.id),
          eq(pushSubscriptionsTable.endpoint, endpoint)
        )
      );
    
    // Check if there are any remaining subscriptions for this user
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(pushSubscriptionsTable)
      .where(eq(pushSubscriptionsTable.user_id, user.id));
    
    const count = countResult.length > 0 ? Number(countResult[0].count) : 0;
    console.log('Remaining subscriptions for user:', user.id, ':', count);
    
    // If no subscriptions remain, update user preferences
    if (count === 0) {
      await db
        .update(usersTable)
        .set({ push_notifications_enabled: false })
        .where(eq(usersTable.id, user.id));
    }
    
    return NextResponse.json(
      { success: true, message: 'Unsubscribed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
} 