'use client';

import { useState, useEffect } from 'react';
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
  
  const [movements, setMovements] = useState<MovementWithFocusArea[]>(initialMovements as MovementWithFocusArea[]);
  const [page, setPage] = useState(currentPage);
  const [sort, setSort] = useState(currentSort);
  const [order, setOrder] = useState(currentOrder);
  const [difficulty, setDifficulty] = useState(currentDifficulty);
  const [focusArea, setFocusArea] = useState(currentFocusArea);
  const [search, setSearch] = useState(currentSearch || '');
  const [isSearching, setIsSearching] = useState(false);
  
  // Update the URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    // Set or remove parameters based on values
    if (page !== 1) params.set('page', page.toString());
    else params.delete('page');
    
    if (sort !== 'name') params.set('sort', sort);
    else params.delete('sort');
    
    if (order !== 'asc') params.set('order', order);
    else params.delete('order');
    
    if (difficulty) params.set('difficulty', difficulty);
    else params.delete('difficulty');
    
    if (focusArea) params.set('focus', focusArea);
    else params.delete('focus');
    
    if (search && search.trim() !== '') params.set('q', search);
    else params.delete('q');
    
    // Update the URL
    router.push(`${pathname}?${params.toString()}`);
  }, [page, sort, order, difficulty, focusArea, search, pathname, router, searchParams]);
  
  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Reset to first page when applying a new search
    setPage(1);
    
    // The actual search is handled by the useEffect above
    setIsSearching(false);
  };
  
  // Handle filter changes
  const handleFilterChange = (filter: string, value: string | null) => {
    // Reset to first page when applying a new filter
    setPage(1);
    
    // Apply the filter
    switch (filter) {
      case 'difficulty':
        setDifficulty(value as 'beginner' | 'intermediate' | 'advanced' | null);
        break;
      case 'focusArea':
        setFocusArea(value);
        break;
      case 'sort':
        if (sort === value) {
          // Toggle sort order if clicking the same sort option
          setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
          setSort(value || 'name');
          setOrder('asc'); // Default to ascending when changing sort
        }
        break;
    }
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
  
  return (
    <div>
      {/* Filters and Search */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-100 dark:border-neutral-800 p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative flex-grow">
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
              disabled={isSearching}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
        
        <div className="flex flex-wrap gap-2 md:gap-4">
          {/* Difficulty Filter */}
          <div className="relative">
            <select
              value={difficulty || ''}
              onChange={(e) => handleFilterChange('difficulty', e.target.value || null)}
              className="appearance-none px-3 py-2 border border-neutral-700 rounded-lg pr-8 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-sm dark:text-neutral-200"
            >
              <option value="">All Difficulty Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Focus Area Filter */}
          <div className="relative">
            <select
              value={focusArea || ''}
              onChange={(e) => handleFilterChange('focusArea', e.target.value || null)}
              className="appearance-none px-3 py-2 border border-neutral-700 rounded-lg pr-8 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-sm dark:text-neutral-200"
            >
              <option value="">All Focus Areas</option>
              {focusAreas.map((area) => (
                <option key={area.id} value={area.name}>{area.name}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Sort By Filter */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="appearance-none px-3 py-2 border border-neutral-700 rounded-lg pr-8 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-sm dark:text-neutral-200"
            >
              <option value="name">Name</option>
              <option value="difficulty_level">Difficulty</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Sort Order */}
          <button 
            onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
            aria-label={order === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {order === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Grid of Movements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {movements.length > 0 ? (
          movements.map((movement) => (
            <Link
              key={movement.id}
              href={`/dashboard/movements/${movement.id}`}
              className="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden shadow-sm border border-gray-100 dark:border-neutral-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="relative h-40 w-full bg-gray-200 dark:bg-neutral-700">
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
              
              <div className="p-4">
                <h3 className="font-medium text-lg text-gray-800 dark:text-neutral-200 mb-1">{movement.name}</h3>
                
                <div className="flex items-center justify-between mb-2">
                  {getDifficultyLabel(movement.difficulty_level)}
                  
                  {movement.focus_area && (
                    <span className="text-sm text-gray-600 dark:text-neutral-400">
                      {movement.focus_area.name}
                    </span>
                  )}
                </div>
                
                {movement.description && (
                  <p className="text-sm text-gray-600 dark:text-neutral-400 line-clamp-2">
                    {movement.description}
                  </p>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500 dark:text-neutral-400">No movements found matching your filters. Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
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
                onClick={() => setPage(pageNum)}
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
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
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