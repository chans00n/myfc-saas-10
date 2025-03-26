import { NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { createClient } from '@/utils/supabase/server';
import { dynamic, runtime, preferredRegion } from '@/app/config';

export { dynamic, runtime, preferredRegion };

export async function GET() {
  try {
    // Create supabase client
    const supabase = createClient();
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // TODO: Add actual admin role check here based on your auth system
    // For now, we'll use domain check for @myfc.app emails
    const isAdmin = session.user.email?.endsWith('@myfc.app') || session.user.email === 'admin@example.com';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch users from the database
    const allUsers = await db.select().from(usersTable);
    
    return NextResponse.json({
      users: allUsers.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        plan_name: user.plan_name,
        stripe_id: user.stripe_id,
        avatar_url: user.avatar_url,
        theme_preference: user.theme_preference,
        push_notifications_enabled: user.push_notifications_enabled === true || user.push_notifications_enabled === 1,
        email_notifications_enabled: user.email_notifications_enabled === true || user.email_notifications_enabled === 1,
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 