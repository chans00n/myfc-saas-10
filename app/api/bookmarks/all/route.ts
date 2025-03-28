import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { workoutBookmarksTable } from '@/utils/db/schema';
import { eq, desc } from 'drizzle-orm';
import { dynamic } from '@/app/config'

export { dynamic }

export const runtime = 'nodejs';
export const preferredRegion = ['iad1']; // US East (N. Virginia)

/**
 * GET /api/bookmarks/all - Fetches all bookmarks for the current user
 */
export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use Drizzle ORM to fetch bookmarks
    const bookmarks = await db
      .select()
      .from(workoutBookmarksTable)
      .where(eq(workoutBookmarksTable.user_id, user.id))
      .orderBy(desc(workoutBookmarksTable.created_at));

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    // Return empty array instead of error
    return NextResponse.json({ bookmarks: [] });
  }
} 