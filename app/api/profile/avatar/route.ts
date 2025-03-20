import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Maximum avatar file size (2MB)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Simple in-memory request tracking for rate limiting
const requestTracker: Record<string, { count: number, timestamp: number }> = {};

// Rate limiting function - 5 requests per minute per user
function shouldRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  
  // Clean up old entries every 100 requests
  if (Object.keys(requestTracker).length > 100) {
    Object.keys(requestTracker).forEach(key => {
      if (now - requestTracker[key].timestamp > windowMs) {
        delete requestTracker[key];
      }
    });
  }
  
  if (!requestTracker[userId]) {
    requestTracker[userId] = {
      count: 1,
      timestamp: now
    };
    return false;
  }
  
  const userTracker = requestTracker[userId];
  
  // Reset counter if outside window
  if (now - userTracker.timestamp > windowMs) {
    userTracker.count = 1;
    userTracker.timestamp = now;
    return false;
  }
  
  // Increment count
  userTracker.count++;
  
  // Rate limit if too many requests
  return userTracker.count > 5;
}

export async function POST(request: Request) {
  try {
    console.log('Avatar upload API called');
    
    const supabase = createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    
    if (authError || !auth?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = auth.user.id;
    
    // Apply rate limiting
    if (shouldRateLimit(userId)) {
      console.log(`Rate limited avatar upload for user ${userId}`);
      return NextResponse.json({ error: 'Too many requests, please try again later' }, { status: 429 });
    }
    
    const userEmail = auth.user.email;
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }
    
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    console.log('Generated public URL:', publicUrl);
    
    // Update user metadata with the avatar URL
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });
    
    if (updateError) {
      console.error('User update error:', updateError);
      // Continue anyway to try database update
    } else {
      console.log('Successfully updated user metadata with avatar_url');
    }
    
    // ALSO update the users_table with the avatar URL
    if (userEmail) {
      try {
        await db.update(usersTable)
          .set({ avatar_url: publicUrl })
          .where(eq(usersTable.email, userEmail));
        
        console.log('Successfully updated avatar_url in users_table');
      } catch (dbError) {
        console.error('Error updating users_table:', dbError);
        return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      avatarUrl: publicUrl 
    });
    
  } catch (error) {
    console.error('Error in avatar upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 