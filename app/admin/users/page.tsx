import { Metadata } from 'next';
import UsersTable from '@/components/admin/UsersTable';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin - Users',
  description: 'Manage users of your application',
};

export default async function UsersPage() {
  // Create supabase client
  const supabase = createClient();
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if user is authenticated
  if (!session) {
    redirect('/login');
  }
  
  // TODO: Add actual admin role check here based on your auth system
  // For now, we'll use domain check for @myfc.app emails
  const isAdmin = session.user.email?.endsWith('@myfc.app') || session.user.email === 'admin@example.com';
  
  if (!isAdmin) {
    redirect('/dashboard'); // Redirect non-admin users to dashboard
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">Users</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage all users of your application</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm">
        <UsersTable />
      </div>
    </div>
  );
} 