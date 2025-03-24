import { NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const allUsers = await db.select().from(usersTable);
    
    return NextResponse.json({
      users: allUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        push_notifications_enabled: user.push_notifications_enabled === true || user.push_notifications_enabled === 1,
        email_notifications_enabled: user.email_notifications_enabled === true || user.email_notifications_enabled === 1,
        new_workout_notifications: user.new_workout_notifications === true || user.new_workout_notifications === 1,
        workout_reminder_enabled: user.workout_reminder_enabled === true || user.workout_reminder_enabled === 1,
        new_workout_notification_time: user.new_workout_notification_time,
        workout_reminder_time: user.workout_reminder_time,
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 