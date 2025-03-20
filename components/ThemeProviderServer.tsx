'use server';

import { db } from "@/utils/db/db";
import { usersTable } from "@/utils/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { ThemeProvider } from "@/contexts/ThemeContext";

export async function ThemeProviderServer({
  children,
}: {
  children: React.ReactNode;
}) {
  // Default theme
  let theme: 'light' | 'dark' = 'light';
  
  try {
    // Get the current user
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Fetch user's theme preference from database
        const userRecord = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, user.email!))
          .limit(1);
        
        // The theme_preference column might not exist yet, so use optional chaining
        // to avoid errors if the property doesn't exist
        if (userRecord.length > 0 && userRecord[0]?.theme_preference) {
          theme = userRecord[0].theme_preference as 'light' | 'dark';
        }
      } catch (dbError) {
        // Specifically handle the case where the column doesn't exist
        // This allows the app to work even if the migration hasn't been run
        console.error("Database error fetching theme preference:", dbError);
        // Continue with default theme
      }
    }
  } catch (error) {
    console.error("Authentication error:", error);
    // Continue with default theme
  }
  
  return (
    <ThemeProvider initialTheme={theme}>
      {children}
    </ThemeProvider>
  );
} 