#!/usr/bin/env node

/**
 * This script refreshes signed URLs for facial progress photos
 * It's meant to be run manually if there are issues with photo display
 * 
 * Usage: node scripts/refresh-facial-urls.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY);

async function refreshUrls() {
  console.log('Fetching photos from the database...');
  
  // Fetch all photos from the database
  const { data: photos, error } = await supabase
    .from('facial_progress_photos')
    .select('*');
  
  if (error) {
    console.error('Error fetching photos:', error);
    return;
  }
  
  console.log(`Found ${photos.length} photos. Refreshing URLs...`);
  
  // Process each photo
  let successCount = 0;
  let errorCount = 0;
  
  for (const photo of photos) {
    try {
      // Extract the path from the URL
      let path = '';
      try {
        // Try different path extraction methods
        const urlObj = new URL(photo.photo_url);
        const pathParts = urlObj.pathname.split('/');
        
        // Find the bucket name in the path
        const bucketIndex = pathParts.findIndex(part => part === 'facial-progress');
        
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          // Get everything after 'facial-progress/'
          path = pathParts.slice(bucketIndex + 1).join('/');
        } else {
          // If we can't find 'facial-progress' in the path, try another method
          // Look for user ID pattern (UUID)
          const userIdMatch = pathParts.find(part => 
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(part));
          
          if (userIdMatch) {
            const userIdIndex = pathParts.indexOf(userIdMatch);
            if (userIdIndex !== -1) {
              path = pathParts.slice(userIdIndex).join('/');
            }
          }
        }
        
        // Remove any query params
        path = path.split('?')[0];
        
        if (!path) {
          console.log(`Could not extract path from URL: ${photo.photo_url}`);
          errorCount++;
          continue;
        }
        
        console.log(`Creating signed URL for path: ${path}`);
        
        // Create a new signed URL (valid for 7 days)
        const { data: urlData, error: signError } = await supabase.storage
          .from('facial-progress')
          .createSignedUrl(path, 60 * 60 * 24 * 7);
        
        if (signError) {
          console.error(`Error creating signed URL for ${photo.id}:`, signError);
          errorCount++;
          continue;
        }
        
        if (!urlData?.signedUrl) {
          console.error(`No signed URL returned for ${photo.id}`);
          errorCount++;
          continue;
        }
        
        // Update the database with the new signed URL
        const { error: updateError } = await supabase
          .from('facial_progress_photos')
          .update({ photo_url: urlData.signedUrl })
          .match({ id: photo.id });
        
        if (updateError) {
          console.error(`Error updating URL for ${photo.id}:`, updateError);
          errorCount++;
          continue;
        }
        
        successCount++;
        console.log(`Updated URL for photo ${photo.id}`);
      } catch (parseError) {
        console.error(`Error parsing URL for ${photo.id}:`, parseError);
        errorCount++;
      }
    } catch (e) {
      console.error(`Error processing photo ${photo.id}:`, e);
      errorCount++;
    }
  }
  
  console.log('\nRefresh complete!');
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run the script
refreshUrls()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 