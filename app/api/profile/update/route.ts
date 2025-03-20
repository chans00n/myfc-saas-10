import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
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
    // Parse the form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const emailNotifications = formData.get('emailNotifications') === 'on';
    const reminderNotifications = formData.get('reminderNotifications') === 'on';
    
    // Update the user's record in the database
    // Only update the name field for now since that's all we have in the schema
    await db
      .update(usersTable)
      .set({ name })
      .where(eq(usersTable.email, user.email!));
    
    // In a real app, you'd also store the other preferences in a separate table
    // For example:
    // await db
    //   .update(userPreferencesTable)
    //   .set({ 
    //     phone,
    //     email_notifications: emailNotifications, 
    //     reminder_notifications: reminderNotifications
    //   })
    //   .where(eq(userPreferencesTable.user_id, user.id));
    
    return NextResponse.json(
      { success: true, message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Redirect GET requests to the profile page
export async function GET() {
  return NextResponse.redirect('/dashboard/profile');
} 