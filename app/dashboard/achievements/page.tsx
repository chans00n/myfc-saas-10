import { redirect } from 'next/navigation';

export default async function AchievementsPage() {
  // Redirect to the progress page since the achievements have been merged there
  redirect('/dashboard/progress');
} 