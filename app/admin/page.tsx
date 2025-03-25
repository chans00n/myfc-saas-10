import { UserStatsOverview } from '@/components/admin/UserStatsOverview';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">MYFC Admin Dashboard</h1>
      <p className="mt-2 mb-8 text-neutral-600 dark:text-neutral-400">
        Welcome to the MYFC Admin Dashboard. Use the navigation on the left to manage your application.
      </p>
      
      {/* User Stats Overview */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-50">User Statistics</h2>
        <UserStatsOverview />
      </div>
      
      {/* Quick Access Cards */}
      <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-50">Quick Access</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Notification Management</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Test and manage push notifications for your users.
          </p>
          <a href="/admin/notifications" className="text-primary hover:underline mt-4 inline-flex items-center">
            Manage Notifications <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Workout Management</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Create and manage workout content for the application.
          </p>
          <a href="/admin/workouts" className="text-primary hover:underline mt-4 inline-flex items-center">
            Manage Workouts <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Notification Debug</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            View user notification preferences and subscriptions.
          </p>
          <a href="/admin/notifications/debug" className="text-primary hover:underline mt-4 inline-flex items-center">
            Debug Notifications <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">User Management</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            View and manage user accounts and permissions.
          </p>
          <a href="/admin/users" className="text-primary hover:underline mt-4 inline-flex items-center">
            Manage Users <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">Database Management</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            View and manage database records.
          </p>
          <a href="/admin/database" className="text-primary hover:underline mt-4 inline-flex items-center">
            Manage Database <span className="ml-1">→</span>
          </a>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">System Settings</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Configure system-wide settings and preferences.
          </p>
          <a href="/admin/settings" className="text-primary hover:underline mt-4 inline-flex items-center">
            Manage Settings <span className="ml-1">→</span>
          </a>
        </div>
      </div>
    </div>
  );
} 