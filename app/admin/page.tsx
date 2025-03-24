export default function AdminPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Welcome to the admin dashboard. Use the navigation on the left to manage your application.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Notification Management</h2>
          <p className="text-muted-foreground">
            Test and manage push notifications for your users.
          </p>
          <a href="/admin/notifications" className="text-primary hover:underline mt-4 inline-block">
            Manage Notifications →
          </a>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Notification Debug</h2>
          <p className="text-muted-foreground">
            View user notification preferences and subscriptions.
          </p>
          <a href="/admin/notifications/debug" className="text-primary hover:underline mt-4 inline-block">
            Debug Notifications →
          </a>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">User Management</h2>
          <p className="text-muted-foreground">
            View and manage user accounts and permissions.
          </p>
          <a href="/admin/users" className="text-primary hover:underline mt-4 inline-block">
            Manage Users →
          </a>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Database Management</h2>
          <p className="text-muted-foreground">
            View and manage database records.
          </p>
          <a href="/admin/database" className="text-primary hover:underline mt-4 inline-block">
            Manage Database →
          </a>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p className="text-muted-foreground">
            Configure system-wide settings and preferences.
          </p>
          <a href="/admin/settings" className="text-primary hover:underline mt-4 inline-block">
            Manage Settings →
          </a>
        </div>
      </div>
    </div>
  );
} 