import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Simple counter for logging
let requestCount = 0;
const requestsPerComponent: Record<string, number> = {};

// In-memory cache with 60-second TTL
type CacheEntry = {
  timestamp: number;
  data: any;
};
const userDataCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 60 * 1000; // 60 seconds

export async function GET(request: Request) {
  // Track API request counts
  requestCount++;
  
  // Extract referrer to track which component is making the request
  const referrer = request.headers.get('referer') || 'unknown';
  const component = new URL(referrer).pathname;
  requestsPerComponent[component] = (requestsPerComponent[component] || 0) + 1;
  
  // Log request counts periodically
  if (requestCount % 10 === 0) {
    console.log(`User data API called ${requestCount} times`);
    console.log('Requests per component:', requestsPerComponent);
  }
  
  try {
    const supabase = createClient();
    
    // Get auth cookie to use as cache key
    const cookies = request.headers.get('cookie') || '';
    const authCookie = cookies
      .split(';')
      .find(c => c.trim().startsWith('sb-'))
      ?.trim() || '';
    
    // Check cache first
    if (authCookie && userDataCache[authCookie] && (Date.now() - userDataCache[authCookie].timestamp < CACHE_TTL)) {
      console.log('Returning cached user DB data');
      return NextResponse.json(userDataCache[authCookie].data);
    }
    
    // Not in cache, fetch from Supabase and database
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch user record from database
    const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, data.user.email!));
    
    // Prepare response
    const result = userRecord && userRecord.length > 0 
      ? { user: userRecord[0] } 
      : { user: null };
    
    // Cache the result
    if (authCookie) {
      userDataCache[authCookie] = {
        timestamp: Date.now(),
        data: result
      };
    }
    
    // Clean up cache if it gets too large
    if (Object.keys(userDataCache).length > 100) {
      const now = Date.now();
      Object.keys(userDataCache).forEach(key => {
        if (now - userDataCache[key].timestamp > CACHE_TTL) {
          delete userDataCache[key];
        }
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 