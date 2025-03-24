'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Pencil, Timer, Eye, EyeOff, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Workout } from '@/types/database';

export default function WorkoutsTable() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [intensityFilter, setIntensityFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Workout>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Fetch workouts on component mount
  const fetchWorkouts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      // Add timestamp for cache busting
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/workouts/list?t=${timestamp}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      
      const data = await response.json();
      setWorkouts(data);
      setFilteredWorkouts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    fetchWorkouts(true);
  };
  
  useEffect(() => {
    fetchWorkouts();
  }, []);
  
  // Filter workouts when search or filters change
  useEffect(() => {
    let result = [...workouts];
    
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        workout =>
          workout.title.toLowerCase().includes(lowerCaseQuery) ||
          (workout.description?.toLowerCase().includes(lowerCaseQuery) || false)
      );
    }
    
    // Apply intensity filter
    if (intensityFilter !== 'all') {
      result = result.filter(workout => workout.intensity === intensityFilter);
    }
    
    // Apply active filter
    if (activeFilter !== 'all') {
      const isActive = activeFilter === 'active';
      result = result.filter(workout => workout.is_active === isActive);
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number or boolean fields
      const aNum = aValue === null ? 0 : Number(aValue);
      const bNum = bValue === null ? 0 : Number(bValue);
      
      return sortDirection === 'asc'
        ? aNum - bNum
        : bNum - aNum;
    });
    
    setFilteredWorkouts(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [workouts, searchQuery, intensityFilter, activeFilter, sortField, sortDirection]);
  
  // Get current workouts for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWorkouts = filteredWorkouts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredWorkouts.length / itemsPerPage);
  
  // Handle sorting
  const handleSort = (field: keyof Workout) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (field: keyof Workout) => {
    if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };
  
  // Handle pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Format date for display
  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Within the last 7 days
    if (diffDays < 7) {
      return `${date.toLocaleDateString([], { weekday: 'long' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // This year
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Different year
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  if (loading && !isRefreshing) {
    return <div className="p-4">Loading workouts...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="w-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-auto lg:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Intensity filter */}
            <Select
              value={intensityFilter}
              onValueChange={setIntensityFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Intensity" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Intensities</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Active status filter */}
            <Select
              value={activeFilter}
              onValueChange={setActiveFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            
            {/* Refresh button */}
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
            >
              <ChevronUp className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('title')}
                className="font-medium flex items-center"
              >
                Title {getSortIcon('title')}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('duration_minutes')}
                className="font-medium flex items-center whitespace-nowrap"
              >
                Duration {getSortIcon('duration_minutes')}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('intensity')}
                className="font-medium flex items-center"
              >
                Intensity {getSortIcon('intensity')}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('created_at')}
                className="font-medium flex items-center whitespace-nowrap"
              >
                Published {getSortIcon('created_at')}
              </Button>
            </TableHead>
            <TableHead>
              <Button 
                variant="ghost" 
                onClick={() => handleSort('is_active')}
                className="font-medium flex items-center"
              >
                Status {getSortIcon('is_active')}
              </Button>
            </TableHead>
            <TableHead>
              <span className="font-medium">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentWorkouts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No workouts found.
              </TableCell>
            </TableRow>
          ) : (
            currentWorkouts.map((workout) => (
              <TableRow key={workout.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {workout.thumbnail_url ? (
                      <img 
                        src={workout.thumbnail_url} 
                        alt={workout.title} 
                        className="h-10 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-10 w-16 bg-neutral-100 dark:bg-neutral-800 rounded flex items-center justify-center">
                        <Timer className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{workout.title}</div>
                      {workout.description && (
                        <div className="text-sm text-neutral-500 truncate max-w-xs">
                          {workout.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Timer className="mr-2 h-4 w-4 text-neutral-500" />
                    <span>{workout.duration_minutes} min</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      workout.intensity === 'beginner' ? 'outline' : 
                      workout.intensity === 'intermediate' ? 'secondary' : 
                      'default'
                    }
                  >
                    {workout.intensity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-neutral-500" />
                    <span title={new Date(workout.created_at).toLocaleString()}>
                      {formatPublishedDate(workout.created_at)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {workout.is_active ? (
                      <>
                        <Eye className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-green-500">Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4 text-neutral-500" />
                        <span className="text-neutral-500">Inactive</span>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/workouts/${workout.id}`} className="flex items-center">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <Button
              key={number}
              variant={currentPage === number ? "default" : "outline"}
              size="sm"
              onClick={() => paginate(number)}
            >
              {number}
            </Button>
          ))}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 