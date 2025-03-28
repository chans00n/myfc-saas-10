import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getDB } from '@/utils/db';
import { withRetry } from '@/utils/db/retry';
import { dynamic } from '@/app/config';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

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
      return NextResponse.json(userDataCache[authCookie].data, {
        headers: {
          'Cache-Control': 'private, max-age=300', // 5 minutes
          'Vary': 'Cookie'
        }
      });
    }
    
    // Get auth user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get DB user record with retry logic
    const db = getDB();
    const userRecord = await withRetry(
      () => db.select()
        .from(usersTable)
        .where(eq(usersTable.email, authData.user.email!))
        .limit(1),
      {
        retryCount: 3,
        onRetry: (error, attempt) => {
          console.warn(`Retrying database operation, attempt ${attempt}:`, error);
        },
      }
    );

    // Combine the data
    const userData = {
      auth: {
        id: authData.user.id,
        email: authData.user.email,
        metadata: authData.user.user_metadata,
        created_at: authData.user.created_at
      },
      profile: userRecord && userRecord.length > 0 ? userRecord[0] : null
    };

    // Cache the result
    if (authCookie) {
      userDataCache[authCookie] = {
        timestamp: Date.now(),
        data: userData
      };
    }

    return NextResponse.json(userData, {
      headers: {
        'Cache-Control': 'private, max-age=300',
        'Vary': 'Cookie'
      }
    });
  } catch (error: any) {
    console.error('Profile fetch error:', error);

    if (error.code === 'XX000' && error.message.includes('Max client connections')) {
      return new NextResponse(
        JSON.stringify({
          error: 'Service temporarily unavailable. Please try again in a moment.',
        }),
        {
          status: 503,
          headers: {
            'Retry-After': '5',
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
} 