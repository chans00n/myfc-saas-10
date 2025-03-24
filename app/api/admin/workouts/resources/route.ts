import { NextRequest, NextResponse } from 'next/server';
import { adminGetAllFocusAreas, adminGetAllMovements } from '@/lib/supabase/admin-database';

export async function GET(request: NextRequest) {
  try {
    const [focusAreas, movements] = await Promise.all([
      adminGetAllFocusAreas(),
      adminGetAllMovements()
    ]);
    
    // Create a response with the data
    const response = NextResponse.json({
      focusAreas,
      movements
    });
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching workout resources:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 