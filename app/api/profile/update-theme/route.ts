import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { dynamic } from '@/app/config'

export { dynamic }

export const runtime = 'nodejs';
export const preferredRegion = ['iad1']; // US East (N. Virginia)

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
  // Get the current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'You must be logged in to update your theme preference' },
      { status: 401 }
    );
  }
  
  try {
    // Parse the request body
    const { theme } = await request.json();
    
    if (theme !== 'light' && theme !== 'dark') {
      return NextResponse.json(
        { error: 'Invalid theme. Must be "light" or "dark"' },
        { status: 400 }
      );
    }
    
    // Update the user record in the database
    await db
      .update(usersTable)
      .set({ theme_preference: theme })
      .where(eq(usersTable.email, user.email!));
    
    return NextResponse.json({ success: true, theme });
    
  } catch (error) {
    console.error('Error updating theme preference:', error);
    return NextResponse.json(
      { error: 'Failed to update theme preference' },
      { status: 500 }
    );
  }
} 