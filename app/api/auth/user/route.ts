import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { dynamic } from '@/app/config'

export { dynamic }

export const runtime = 'nodejs';
export const preferredRegion = ['iad1']; // US East (N. Virginia)

// Simple counter for logging
let requestCount = 0;
const requestsPerComponent: Record<string, number> = {};

// In-memory cache with 30-second TTL
type CacheEntry = {
  timestamp: number;
  data: any;
};
const userCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 30 * 1000; // 30 seconds

export async function GET(request: Request) {
  // Track API request counts
  requestCount++;
  
  // Extract referrer to track which component is making the request
  const referrer = request.headers.get('referer') || 'unknown';
  const component = new URL(referrer).pathname;
  requestsPerComponent[component] = (requestsPerComponent[component] || 0) + 1;
  
  // Log request counts periodically
  if (requestCount % 10 === 0) {
    console.log(`Auth API called ${requestCount} times`);
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
    if (authCookie && userCache[authCookie] && (Date.now() - userCache[authCookie].timestamp < CACHE_TTL)) {
      console.log('Returning cached user data');
      return NextResponse.json(userCache[authCookie].data);
    }
    
    // Not in cache, fetch from Supabase
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    // Cache the result
    const result = { user: data.user };
    if (authCookie) {
      userCache[authCookie] = {
        timestamp: Date.now(),
        data: result
      };
    }
    
    // Clean up cache if it gets too large
    if (Object.keys(userCache).length > 100) {
      const now = Date.now();
      Object.keys(userCache).forEach(key => {
        if (now - userCache[key].timestamp > CACHE_TTL) {
          delete userCache[key];
        }
      });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in auth API:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
} 