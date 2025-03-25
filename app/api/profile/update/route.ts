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
    const gender = formData.get('gender') as string;
    const birthday = formData.get('birthday') as string;
    const location = formData.get('location') as string;
    
    // Validate the data
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    
    // Prepare the update data
    const updateData: Record<string, any> = { name };
    
    // Only add fields if they have values
    if (gender) updateData.gender = gender;
    if (birthday) updateData.birthday = birthday;
    if (location) updateData.location = location;
    
    // Update the user's record in the database
    await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.email, user.email!));
    
    // Also update the name in Supabase Auth metadata
    await supabase.auth.updateUser({
      data: { name }
    });
    
    // Clear any caches
    try {
      await fetch('/api/user/clear-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (cacheError) {
      console.error('Failed to clear cache:', cacheError);
      // Continue anyway
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Profile updated successfully',
        data: { name, gender, birthday, location }
      },
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