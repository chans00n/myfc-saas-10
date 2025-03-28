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

export async function GET() {
  try {
    const db = getDB();
    
    const profile = await withRetry(
      () => db.select().from(usersTable).limit(1),
      {
        retryCount: 3,
        onRetry: (error, attempt) => {
          console.warn(`Retrying database operation, attempt ${attempt}:`, error);
        },
      }
    );

    if (!profile || profile.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404 }
      );
    }

    return NextResponse.json(profile[0]);
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