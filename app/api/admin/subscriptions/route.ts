import { NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { pushSubscriptionsTable } from '@/utils/db/schema';

export async function GET() {
  try {
    const subscriptions = await db.select().from(pushSubscriptionsTable);
    
    return NextResponse.json({
      subscriptions: subscriptions.map((sub: any) => ({
        id: sub.id,
        user_id: sub.user_id,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        created_at: sub.created_at,
        updated_at: sub.updated_at
      }))
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }
} 