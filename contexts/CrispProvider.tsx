'use client';

import { ReactNode, useEffect, useState } from 'react';
import CrispChat from '@/components/Crisp';
import { useCrisp } from '@/hooks/useCrisp';
import { createClient } from '@/utils/supabase/client';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Get Crisp Website ID from environment variables
const CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID || '';

export default function CrispProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{
    userId?: string;
    email?: string;
    name?: string;
  } | null>(null);
  const supabase = createClient();
  const { identifyUser } = useCrisp();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get additional user info from database if needed
          const { data: userData } = await supabase
            .from('users_table')
            .select('id, email, name')
            .eq('id', session.user.id)
            .single();
            
          const crispUser = {
            userId: session.user.id,
            email: session.user.email,
            name: userData?.name || session.user.email?.split('@')[0],
          };
          
          setUser(crispUser);
          
          // Identify user to Crisp
          identifyUser({
            userId: crispUser.userId,
            email: crispUser.email,
            name: crispUser.name,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data for Crisp:', error);
      }
    };

    getUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        getUser();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, identifyUser]);
  
  return (
    <>
      {children}
      <CrispChat 
        websiteId={CRISP_WEBSITE_ID} 
        user={user || undefined}
      />
    </>
  );
} 