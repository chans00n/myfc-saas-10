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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, ArrowUpDown, ChevronDown, ChevronUp, Mail, Settings, Bell } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  plan_name?: string;
  stripe_id: string;
  avatar_url?: string;
  theme_preference?: string;
  push_notifications_enabled?: boolean;
  email_notifications_enabled?: boolean;
}

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [planFilter, setPlanFilter] = useState<string>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof User>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filter users when search or plan filter changes
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(lowerCaseQuery) ||
          user.email.toLowerCase().includes(lowerCaseQuery)
      );
    }
    
    // Apply plan filter
    if (planFilter !== 'all') {
      result = result.filter(user => user.plan === planFilter);
    }
    
    // Apply sorting
    result = result.sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any);
    });
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchQuery, planFilter, sortField, sortDirection]);
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Handle sorting
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sort icon
  const getSortIcon = (field: keyof User) => {
    if (field !== sortField) return <ArrowUpDown className="ml-2 h-4 w-4" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };
  
  // Handle pagination
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Get plan badge color
  const getPlanBadgeClasses = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'basic':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
    }
  };
  
  if (loading) {
    return <div className="p-4">Loading users...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="w-full">
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-auto sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          
          {/* Plan filter */}
          <Select
            value={planFilter}
            onValueChange={setPlanFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('name')}
                  className="font-medium flex items-center"
                >
                  User {sortField === 'name' && getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('email')}
                  className="font-medium flex items-center"
                >
                  Email {sortField === 'email' && getSortIcon('email')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  onClick={() => handleSort('plan')}
                  className="font-medium flex items-center"
                >
                  Plan {sortField === 'plan' && getSortIcon('plan')}
                </Button>
              </TableHead>
              <TableHead>
                <span className="font-medium">Notifications</span>
              </TableHead>
              <TableHead>
                <span className="font-medium">Theme</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {user.avatar_url ? (
                        <AvatarImage src={user.avatar_url} alt={user.name} />
                      ) : null}
                      <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getPlanBadgeClasses(user.plan)
                    }`}>
                      {user.plan_name || user.plan}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs">
                        Email: {user.email_notifications_enabled ? 'On' : 'Off'}
                      </div>
                      <div className="text-xs">
                        Push: {user.push_notifications_enabled ? 'On' : 'Off'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.theme_preference || 'light'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden">
        {currentUsers.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            No users found.
          </div>
        ) : (
          <div className="space-y-4 p-2">
            {currentUsers.map((user) => (
              <div key={user.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-12 w-12">
                    {user.avatar_url ? (
                      <AvatarImage src={user.avatar_url} alt={user.name} />
                    ) : null}
                    <AvatarFallback className="text-lg">{getUserInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">{user.name}</h3>
                    <div className="flex items-center text-sm text-neutral-500">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm mb-2">
                  <div>
                    <div className="text-neutral-500 dark:text-neutral-400 mb-1">Plan</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      getPlanBadgeClasses(user.plan)
                    }`}>
                      {user.plan_name || user.plan}
                    </span>
                  </div>
                  
                  <div>
                    <div className="text-neutral-500 dark:text-neutral-400 mb-1">Theme</div>
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 mr-1 text-neutral-500" />
                      <span>{user.theme_preference || 'light'}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="text-neutral-500 dark:text-neutral-400 mb-1">Notifications</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-neutral-500" />
                        <span>{user.email_notifications_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 mr-2 text-neutral-500" />
                        <span>{user.push_notifications_enabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center p-4 border-t">
          <nav className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Show simplified pagination on mobile */}
            {isMobile ? (
              <span className="px-3 py-1 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            ) : (
              // Desktop pagination with ellipsis
              Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show current page, first and last page, and pages around current
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                  
                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsisBefore && (
                        <span className="px-3 py-1">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => paginate(page)}
                      >
                        {page}
                      </Button>
                    </div>
                  );
                })
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
} 