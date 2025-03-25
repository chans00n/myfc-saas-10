import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getWorkoutsLibrary } from '@/utils/supabase/database';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Check authentication
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get query parameters from URL
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const view = searchParams.get('view') === 'calendar' ? 'calendar' : 'list';
  const sortBy = searchParams.get('sort') || 'created_at';
  const sortOrder = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
  const intensityFilter = ['beginner', 'intermediate', 'advanced'].includes(searchParams.get('intensity') || '') 
    ? searchParams.get('intensity') as 'beginner' | 'intermediate' | 'advanced'
    : null;
  const focusAreaFilter = searchParams.get('focus') || null;
  const searchQuery = searchParams.get('q') || null;

  try {
    // Get workouts with filters
    const { data: workouts, count = 0, totalPages = 0 } = await getWorkoutsLibrary({
      page,
      limit: 12,
      sortBy,
      sortOrder,
      intensity: intensityFilter,
      focusArea: focusAreaFilter,
      search: searchQuery
    });

    // Return the filtered workouts
    return NextResponse.json({
      workouts,
      totalWorkouts: count,
      totalPages,
      currentPage: page,
      currentView: view,
      currentSort: sortBy,
      currentOrder: sortOrder,
      currentIntensity: intensityFilter,
      currentFocusArea: focusAreaFilter,
      currentSearch: searchQuery
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
} 