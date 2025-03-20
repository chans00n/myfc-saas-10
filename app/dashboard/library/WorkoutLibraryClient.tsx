'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FocusArea, Workout } from '@/types/database';

interface WorkoutLibraryClientProps {
  initialWorkouts: any[];
  totalWorkouts: number;
  totalPages: number;
  currentPage: number;
  currentView: string;
  currentSort: string;
  currentOrder: string;
  currentIntensity: string | null;
  currentFocusArea: string | null;
  currentSearch: string | null;
  focusAreas: FocusArea[];
}

export default function WorkoutLibraryClient({
  initialWorkouts,
  totalWorkouts,
  totalPages,
  currentPage,
  currentView,
  currentSort,
  currentOrder,
  currentIntensity,
  currentFocusArea,
  currentSearch,
  focusAreas
}: WorkoutLibraryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [view, setView] = useState(currentView);
  const [page, setPage] = useState(currentPage);
  const [sort, setSort] = useState(currentSort);
  const [order, setOrder] = useState(currentOrder);
  const [intensity, setIntensity] = useState(currentIntensity);
  const [focusArea, setFocusArea] = useState(currentFocusArea);
  const [search, setSearch] = useState(currentSearch || '');
  const [isSearching, setIsSearching] = useState(false);
  
  // Create a calendar representation of workouts
  const calendarWorkouts = createCalendarData(workouts);
  
  // Update the URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Set or remove parameters based on values
    if (page !== 1) params.set('page', page.toString());
    else params.delete('page');
    
    if (view !== 'list') params.set('view', view);
    else params.delete('view');
    
    if (sort !== 'created_at') params.set('sort', sort);
    else params.delete('sort');
    
    if (order !== 'desc') params.set('order', order);
    else params.delete('order');
    
    if (intensity) params.set('intensity', intensity);
    else params.delete('intensity');
    
    if (focusArea) params.set('focus', focusArea);
    else params.delete('focus');
    
    if (search && search.trim() !== '') params.set('q', search);
    else params.delete('q');
    
    // Update the URL
    router.push(`${pathname}?${params.toString()}`);
  }, [page, view, sort, order, intensity, focusArea, search, pathname, router, searchParams]);
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Reset to first page when applying a new search
    setPage(1);
    
    // The actual search is handled by the useEffect above
    setIsSearching(false);
  };
  
  // Toggle view between list and calendar
  const toggleView = (newView: string) => {
    setView(newView);
  };
  
  // Handle filter changes
  const handleFilterChange = (filter: string, value: string | null) => {
    // Reset to first page when applying a new filter
    setPage(1);
    
    // Apply the filter
    switch (filter) {
      case 'intensity':
        setIntensity(value as 'beginner' | 'intermediate' | 'advanced' | null);
        break;
      case 'focusArea':
        setFocusArea(value);
        break;
      case 'sort':
        if (sort === value) {
          // Toggle sort order if clicking the same sort option
          setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
          setSort(value || 'created_at');
          setOrder('desc'); // Default to descending when changing sort
        }
        break;
    }
  };
  
  // Get intensity label with color
  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'beginner':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Beginner</span>;
      case 'intermediate':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">Intermediate</span>;
      case 'advanced':
        return <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-medium">Advanced</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">Unknown</span>;
    }
  };
  
  return (
    <div>
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-grow">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workouts..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-700"
              disabled={isSearching}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          
          {/* View Toggles */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => toggleView('list')}
              className={`p-2 border rounded-md ${view === 'list' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700'}`}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button 
              onClick={() => toggleView('calendar')}
              className={`p-2 border rounded-md ${view === 'calendar' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700'}`}
              aria-label="Calendar view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          {/* Intensity Filter */}
          <div className="relative">
            <select
              value={intensity || ''}
              onChange={(e) => handleFilterChange('intensity', e.target.value || null)}
              className="appearance-none px-3 py-2 border border-gray-300 rounded-lg pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">All Intensities</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Focus Area Filter */}
          <div className="relative">
            <select
              value={focusArea || ''}
              onChange={(e) => handleFilterChange('focusArea', e.target.value || null)}
              className="appearance-none px-3 py-2 border border-gray-300 rounded-lg pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">All Focus Areas</option>
              {focusAreas.map((area) => (
                <option key={area.id} value={area.name}>{area.name}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Sort By Filter */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="appearance-none px-3 py-2 border border-gray-300 rounded-lg pr-8 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="created_at">Date Added</option>
              <option value="title">Title</option>
              <option value="duration_minutes">Duration</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Sort Order */}
          <button 
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            aria-label={order === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {order === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="mb-6">
        <p className="text-gray-600">
          {totalWorkouts} workout{totalWorkouts !== 1 ? 's' : ''} found
          {currentSearch ? ` for "${currentSearch}"` : ''}
          {currentIntensity ? ` • ${currentIntensity.charAt(0).toUpperCase() + currentIntensity.slice(1)} intensity` : ''}
          {currentFocusArea ? ` • Focus: ${currentFocusArea}` : ''}
        </p>
      </div>
      
      {/* List View */}
      {view === 'list' && (
        <div>
          {workouts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workouts found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search criteria.</p>
              <button 
                onClick={() => {
                  setSearch('');
                  setIntensity(null);
                  setFocusArea(null);
                  setSort('created_at');
                  setOrder('desc');
                  setPage(1);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <Link 
                  href={`/workout/${workout.id}`} 
                  key={workout.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300"
                >
                  <div className="relative h-40">
                    {workout.thumbnail_url ? (
                      <Image 
                        src={workout.thumbnail_url} 
                        alt={workout.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        onError={(e) => {
                          // Replace with fallback on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.classList.add('bg-gradient-to-b', 'from-indigo-500', 'to-indigo-700', 'flex', 'items-center', 'justify-center');
                          const span = document.createElement('span');
                          span.className = 'text-white text-2xl font-bold';
                          span.innerText = 'MYFC';
                          target.parentElement!.appendChild(span);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-b from-indigo-500 to-indigo-700 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">MYFC</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{workout.title}</h3>
                      {getIntensityLabel(workout.intensity)}
                    </div>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{workout.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm">{workout.duration_minutes} min</span>
                      </div>
                      {workout.focus_areas && workout.focus_areas.length > 0 && (
                        <div className="text-xs text-gray-500">
                          {workout.focus_areas.slice(0, 2).join(', ')}
                          {workout.focus_areas.length > 2 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Pagination - Only show if there are pages */}
          {totalPages > 1 && (
            <div className="mt-8 mb-20 flex justify-center">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Show pages around current page and first/last page
                    return p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)
                  })
                  .map((p, i, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsisBefore = i > 0 && array[i - 1] !== p - 1;
                    
                    return (
                      <div key={p}>
                        {showEllipsisBefore && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            page === p 
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' 
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
      
      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-20">
          <div className="grid grid-cols-7 gap-1 text-sm">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="font-medium text-center py-2">{day}</div>
            ))}
            
            {calendarWorkouts.map((week, weekIndex) => (
              week.map((day, dayIndex) => (
                <div 
                  key={`${weekIndex}-${dayIndex}`} 
                  className={`min-h-24 border rounded-md p-1 flex flex-col ${
                    day.isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'
                  }`}
                >
                  <div className="text-right text-xs mb-1">{day.date.getDate()}</div>
                  
                  {day.workouts.length > 0 ? (
                    <div className="flex-grow overflow-y-auto">
                      {day.workouts.map((workout) => (
                        <Link 
                          key={workout.id} 
                          href={`/workout/${workout.id}`}
                          className="block text-xs mb-1 p-1 rounded bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 truncate"
                        >
                          {workout.title}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-grow"></div>
                  )}
                </div>
              ))
            ))}
          </div>
          
          {workouts.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">No workouts scheduled for the current filters.</p>
              <button 
                onClick={() => {
                  setSearch('');
                  setIntensity(null);
                  setFocusArea(null);
                  setSort('created_at');
                  setOrder('desc');
                  setPage(1);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to create calendar data from workouts
function createCalendarData(workouts: any[]) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get first day of month
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0 for Sunday, 1 for Monday, etc.
  
  // Get last day of month
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  // Create calendar days including some days from previous and next months to fill weeks
  const calendarDays = [];
  
  // Add days from previous month
  const lastMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, lastMonthLastDay - i);
    calendarDays.push({
      date,
      isCurrentMonth: false,
      workouts: getWorkoutsForDate(workouts, date)
    });
  }
  
  // Add days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    calendarDays.push({
      date,
      isCurrentMonth: true,
      workouts: getWorkoutsForDate(workouts, date)
    });
  }
  
  // Add days from next month to complete last week
  const remainingDays = 7 - (calendarDays.length % 7);
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        workouts: getWorkoutsForDate(workouts, date)
      });
    }
  }
  
  // Group days into weeks
  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  
  return weeks;
}

// Helper to get workouts for a specific date
function getWorkoutsForDate(workouts: any[], date: Date) {
  const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  
  return workouts.filter(workout => {
    if (!workout.scheduled_dates) return false;
    return workout.scheduled_dates.includes(dateStr);
  });
} 