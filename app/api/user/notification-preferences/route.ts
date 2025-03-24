import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// GET endpoint to retrieve user notification preferences
export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get user preferences from database
    const userPreferences = await db
      .select({
        push_notifications_enabled: usersTable.push_notifications_enabled,
        email_notifications_enabled: usersTable.email_notifications_enabled,
        new_workout_notifications: usersTable.new_workout_notifications,
        new_workout_notification_time: usersTable.new_workout_notification_time,
        workout_reminder_enabled: usersTable.workout_reminder_enabled,
        workout_reminder_time: usersTable.workout_reminder_time
      })
      .from(usersTable)
      .where(eq(usersTable.id, user.id));
    
    if (!userPreferences || userPreferences.length === 0) {
      return NextResponse.json(
        { error: 'User preferences not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userPreferences[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// POST endpoint to update user notification preferences
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
    const preferences = await request.json();
    
    // Validate preferences
    if (typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences data' },
        { status: 400 }
      );
    }
    
    // Update user preferences in database
    await db
      .update(usersTable)
      .set({
        new_workout_notifications: preferences.new_workout_notifications,
        new_workout_notification_time: preferences.new_workout_notification_time,
        workout_reminder_enabled: preferences.workout_reminder_enabled,
        workout_reminder_time: preferences.workout_reminder_time
      })
      .where(eq(usersTable.id, user.id));
    
    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
} 