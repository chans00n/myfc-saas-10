'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FocusArea, Movement } from '@/types/database';

interface MovementLibraryClientProps {
  initialMovements: Movement[];
  totalMovements: number;
  totalPages: number;
  currentPage: number;
  currentSort: string;
  currentOrder: string;
  currentDifficulty: string | null;
  currentFocusArea: string | null;
  currentSearch: string | null;
  focusAreas: FocusArea[];
}

interface MovementWithFocusArea extends Movement {
  focus_area?: {
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
  };
}

export default function MovementLibraryClient({
  initialMovements,
  totalMovements,
  totalPages,
  currentPage,
  currentSort,
  currentOrder,
  currentDifficulty,
  currentFocusArea,
  currentSearch,
  focusAreas
}: MovementLibraryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  
  const [movements, setMovements] = useState<MovementWithFocusArea[]>(initialMovements as MovementWithFocusArea[]);
  const [page, setPage] = useState(currentPage);
  const [search, setSearch] = useState(currentSearch || '');
  const [focusArea, setFocusArea] = useState(currentFocusArea);
  const [isSearching, setIsSearching] = useState(false);

  // Update movements when props change
  useEffect(() => {
    setMovements(initialMovements as MovementWithFocusArea[]);
  }, [initialMovements]);
  
  // Update the URL and refresh data when filters change
  const updateFilters = (newParams: URLSearchParams) => {
    startTransition(() => {
      router.push(`${pathname}?${newParams.toString()}`);
      router.refresh();
    });
  };
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (search.trim() !== '') {
      params.set('q', search);
    } else {
      params.delete('q');
    }
    
    updateFilters(params);
    setIsSearching(false);
  };
  
  // Handle focus area selection
  const handleFocusAreaClick = (areaName: string) => {
    // If clicking 'All' or the currently selected area, clear the filter
    const newFocusArea = areaName === 'all' || areaName === focusArea ? null : areaName;
    setFocusArea(newFocusArea);
    
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    if (newFocusArea) {
      params.set('focus', newFocusArea);
    } else {
      params.delete('focus');
    }
    
    updateFilters(params);
  };
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    
    const params = new URLSearchParams(searchParams);
    if (newPage !== 1) {
      params.set('page', newPage.toString());
    } else {
      params.delete('page');
    }
    
    updateFilters(params);
  };
  
  // Get difficulty label with color
  const getDifficultyLabel = (difficultyLevel: string | null) => {
    switch (difficultyLevel) {
      case 'beginner':
        return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Beginner</span>;
      case 'intermediate':
        return <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium">Intermediate</span>;
      case 'advanced':
        return <span className="bg-rose-100 text-rose-800 px-2 py-1 rounded text-xs font-medium">Advanced</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">All Levels</span>;
    }
  };
  
  // Get focus area color mapping
  const getFocusAreaColors = (areaName: string) => {
    const colorMap: { [key: string]: { bg: string, text: string, darkBg: string, darkText: string } } = {
      'Apple Cheeks': { 
        bg: 'bg-rose-100', 
        text: 'text-rose-800',
        darkBg: 'dark:bg-rose-900/30',
        darkText: 'dark:text-rose-200'
      },
      'Center Face': { 
        bg: 'bg-amber-100', 
        text: 'text-amber-800',
        darkBg: 'dark:bg-amber-900/30',
        darkText: 'dark:text-amber-200'
      },
      'Cheeks': { 
        bg: 'bg-pink-100', 
        text: 'text-pink-800',
        darkBg: 'dark:bg-pink-900/30',
        darkText: 'dark:text-pink-200'
      },
      'Eyes': { 
        bg: 'bg-purple-100', 
        text: 'text-purple-800',
        darkBg: 'dark:bg-purple-900/30',
        darkText: 'dark:text-purple-200'
      },
      'Forehead / Brows': { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        darkBg: 'dark:bg-blue-900/30',
        darkText: 'dark:text-blue-200'
      },
      'Full Face': { 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-800',
        darkBg: 'dark:bg-emerald-900/30',
        darkText: 'dark:text-emerald-200'
      },
      'Jawline': {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        darkBg: 'dark:bg-orange-900/30',
        darkText: 'dark:text-orange-200'
      },
      'Lips': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        darkBg: 'dark:bg-red-900/30',
        darkText: 'dark:text-red-200'
      },
      'Lower Face': {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        darkBg: 'dark:bg-cyan-900/30',
        darkText: 'dark:text-cyan-200'
      },
      'Nasolabial': {
        bg: 'bg-violet-100',
        text: 'text-violet-800',
        darkBg: 'dark:bg-violet-900/30',
        darkText: 'dark:text-violet-200'
      },
      'Neck': {
        bg: 'bg-teal-100',
        text: 'text-teal-800',
        darkBg: 'dark:bg-teal-900/30',
        darkText: 'dark:text-teal-200'
      },
      'Temples': {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        darkBg: 'dark:bg-indigo-900/30',
        darkText: 'dark:text-indigo-200'
      },
      'Under-Chin': {
        bg: 'bg-fuchsia-100',
        text: 'text-fuchsia-800',
        darkBg: 'dark:bg-fuchsia-900/30',
        darkText: 'dark:text-fuchsia-200'
      },
      'Upper Face': {
        bg: 'bg-sky-100',
        text: 'text-sky-800',
        darkBg: 'dark:bg-sky-900/30',
        darkText: 'dark:text-sky-200'
      }
    };

    return colorMap[areaName] || { 
      bg: 'bg-gray-100', 
      text: 'text-gray-800',
      darkBg: 'dark:bg-neutral-700',
      darkText: 'dark:text-neutral-200'
    };
  };

  return (
    <div className={isPending ? 'opacity-70 transition-opacity' : ''}>
      {/* Search and Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 p-4 mb-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search movements..."
            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent dark:bg-neutral-700 dark:text-neutral-200"
          />
          <button 
            type="submit" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            disabled={isSearching || isPending}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
        
        {/* Focus Areas Tag Cloud */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFocusAreaClick('all')}
            disabled={isPending}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !focusArea
                ? 'bg-neutral-200 text-neutral-800 dark:bg-neutral-600 dark:text-neutral-100'
                : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
          >
            All
          </button>
          {focusAreas.map((area) => {
            const colors = getFocusAreaColors(area.name);
            return (
              <button
                key={area.id}
                onClick={() => handleFocusAreaClick(area.name)}
                disabled={isPending}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  focusArea === area.name
                    ? `${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`
                    : `bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 hover:${colors.bg} hover:${colors.text} dark:hover:${colors.darkBg} dark:hover:${colors.darkText}`
                }`}
              >
                {area.name}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Grid of Movements */}
      <div className="space-y-4">
        {movements.length > 0 ? (
          movements.map((movement) => (
            <Link
              key={movement.id}
              href={`/dashboard/movements/${movement.id}`}
              className="block bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-700 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
            >
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-gray-200 dark:bg-neutral-700 shrink-0">
                  {movement.thumbnail_url ? (
                    <Image
                      src={movement.thumbnail_url}
                      alt={movement.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-neutral-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow p-4 sm:p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">{movement.name}</h3>
                      {movement.focus_area && (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          getFocusAreaColors(movement.focus_area.name).bg
                        } ${getFocusAreaColors(movement.focus_area.name).text} ${
                          getFocusAreaColors(movement.focus_area.name).darkBg
                        } ${getFocusAreaColors(movement.focus_area.name).darkText}`}>
                          {movement.focus_area.name}
                        </span>
                      )}
                    </div>
                    
                    {movement.description && (
                      <p className="text-gray-600 dark:text-neutral-400 line-clamp-2 text-sm sm:text-base">
                        {movement.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View details
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-neutral-400">No movements found matching your filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isPending}
              className={`p-2 rounded-md ${
                page === 1
                ? 'text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
              aria-label="Previous page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                disabled={isPending}
                className={`px-3 py-1 rounded-md ${
                  pageNum === page
                  ? 'bg-neutral-700 text-white'
                  : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isPending}
              className={`p-2 rounded-md ${
                page === totalPages
                ? 'text-gray-400 dark:text-neutral-600 cursor-not-allowed'
                : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
              }`}
              aria-label="Next page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 