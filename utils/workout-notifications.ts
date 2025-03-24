import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { sendPushNotification } from '@/utils/push-notification';
import { and, eq, gte, sql } from 'drizzle-orm';

// Send notification for a new workout
export async function sendNewWorkoutNotifications(workout: {
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
}) {
  try {
    console.log('Sending new workout notifications for:', workout.title);
    
    // Get all users who have enabled new workout notifications and push notifications
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email
      })
      .from(usersTable)
      .where(
        and(
          // Cast boolean to integer for comparison
          sql`${usersTable.push_notifications_enabled}::integer = 1`,
          sql`${usersTable.new_workout_notifications}::integer = 1`
        )
      );
    
    console.log(`Found ${users.length} users with new workout notifications enabled`);
    
    // Send push notification to each user
    const results = [];
    
    for (const user of users) {
      try {
        // Send the push notification
        const result = await sendPushNotification(user.id, {
          title: 'New Workout Available!',
          body: workout.title,
          icon: workout.thumbnail || '/icons/192.png',
          data: {
            url: workout.url || '/dashboard',
            workoutId: workout.title,
            type: 'new_workout'
          }
        });
        
        results.push({
          user_id: user.id,
          success: result.success,
          details: result
        });
      } catch (error) {
        console.error(`Error sending notification to user ${user.id}:`, error);
        results.push({
          user_id: user.id,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return {
      success: true,
      total: users.length,
      results
    };
  } catch (error) {
    console.error('Error sending new workout notifications:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Send workout reminder notifications
export async function sendWorkoutReminders() {
  try {
    console.log('Sending workout reminder notifications');
    
    // Get current hour in 24-hour format (e.g., "08:00", "17:00")
    const now = new Date();
    const currentHour = `${now.getHours().toString().padStart(2, '0')}:00`;
    
    console.log(`Current hour: ${currentHour}, sending reminders for this time`);
    
    // Get all users who have enabled workout reminders for this hour
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email
      })
      .from(usersTable)
      .where(
        and(
          // Cast boolean to integer for comparison
          sql`${usersTable.push_notifications_enabled}::integer = 1`,
          sql`${usersTable.workout_reminder_enabled}::integer = 1`,
          eq(usersTable.workout_reminder_time, currentHour)
        )
      );
    
    console.log(`Found ${users.length} users with workout reminders for ${currentHour}`);
    
    // Send push notification to each user
    const results = [];
    
    for (const user of users) {
      try {
        // Send the push notification
        const result = await sendPushNotification(user.id, {
          title: 'Workout Reminder',
          body: "Don't forget to complete your workout today!",
          icon: '/icons/192.png',
          data: {
            url: '/dashboard',
            type: 'workout_reminder'
          }
        });
        
        results.push({
          user_id: user.id,
          success: result.success,
          details: result
        });
      } catch (error) {
        console.error(`Error sending reminder to user ${user.id}:`, error);
        results.push({
          user_id: user.id,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return {
      success: true,
      total: users.length,
      results
    };
  } catch (error) {
    console.error('Error sending workout reminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 