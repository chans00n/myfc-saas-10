import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';
import { dynamic } from '@/app/config'

export { dynamic }

export const runtime = 'nodejs';
export const preferredRegion = ['iad1']; // US East (N. Virginia)

// Cache with longer TTL for better performance
const userDataCache: Record<string, {timestamp: number; data: any}> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    // Get auth cookie for cache key
    const cookies = request.headers.get('cookie') || '';
    const authCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('sb-'))
      ?.trim() || '';
    
    // Check cache first
    if (authCookie && userDataCache[authCookie] && 
        (Date.now() - userDataCache[authCookie].timestamp < CACHE_TTL)) {
      // Add cache control headers for HTTP caching
      return NextResponse.json(userDataCache[authCookie].data, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes
          'Vary': 'Cookie'
        }
      });
    }
    
    // Get auth user
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get DB user record in the same request
    const userRecord = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, data.user.email!))
      .limit(1);
    
    // Combine the data
    const userData = {
      auth: {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata,
        created_at: data.user.created_at
      },
      profile: userRecord && userRecord.length > 0 ? userRecord[0] : null
    };
    
    // Log the user data to help with debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log('User record from DB:', userRecord && userRecord.length > 0 ? {
        // Log key fields
        id: userRecord[0].id,
        email: userRecord[0].email,
        name: userRecord[0].name,
        gender: userRecord[0].gender,
        birthday: userRecord[0].birthday,
        location: userRecord[0].location
      } : 'No user record found');
    }
    
    // Cache the result
    if (authCookie) {
      userDataCache[authCookie] = {
        timestamp: Date.now(),
        data: userData
      };
    }
    
    // Return with cache headers
    return NextResponse.json(userData, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'Vary': 'Cookie'
      }
    });
  } catch (error) {
    console.error('Error in consolidated user API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 