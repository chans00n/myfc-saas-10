import { AdminSidebar } from '@/components/AdminSidebar';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <AdminSidebar />
      <div className="flex-1 bg-white dark:bg-neutral-900">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
} 