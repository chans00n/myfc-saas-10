import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  
  // This won't be rendered, but including it for completeness
  return null;
} 