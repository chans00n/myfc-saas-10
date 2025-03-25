import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * DELETE endpoint to permanently delete a user account and all associated data
 */
export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Begin database transaction - delete user data from various tables
    try {
      // 1. Delete from users_table in our database
      await db.delete(usersTable)
        .where(eq(usersTable.id, user.id));
      
      // 2. Delete user's avatar from storage (if exists)
      await supabase.storage
        .from('avatars')
        .remove([`${user.id}-%`]); // Delete all files starting with the user's ID
      
      // 3. Delete user's facial progress photos from storage (if any)
      await supabase.storage
        .from('facial-progress')
        .remove([`${user.id}/`]); // Delete all files in the user's folder
      
      // 4. Finally, delete the user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        throw new Error(`Failed to delete Supabase user: ${error.message}`);
      }
      
      // Purge any cached data
      revalidatePath('/', 'layout');
      
      // Return success response
      return NextResponse.json({ 
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (dbError: any) {
      console.error('Database error during account deletion:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete account', details: dbError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 