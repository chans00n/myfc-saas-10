"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import WorkoutsTable from '@/components/admin/WorkoutsTable';

export default function WorkoutsAdminPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Workout Management</h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Create and manage workout content for the application
          </p>
        </div>
        <div>
          <Button asChild>
            <Link href="/admin/workouts/create">
              <Plus className="mr-2 h-4 w-4" /> Create Workout
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <WorkoutsTable />
      </div>
    </div>
  );
} 