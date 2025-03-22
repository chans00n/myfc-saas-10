import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { facialProgressPhotosTable } from '@/utils/db/schema';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';

// POST endpoint to upload a new facial progress photo
export async function POST(request: Request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body (includes base64 image data)
    const body = await request.json();
    
    if (!body.imageData) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      );
    }
    
    // Extract base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = body.imageData.split(';base64,').pop();
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate unique filename using crypto instead of uuid
    const randomId = crypto.randomBytes(16).toString('hex');
    const filename = `${user.id}/${Date.now()}-${randomId}.jpg`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('facial-progress')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image', details: uploadError.message },
        { status: 500 }
      );
    }
    
    // Get signed URL for the uploaded image (valid for 1 week)
    const { data: urlData } = await supabase.storage
      .from('facial-progress')
      .createSignedUrl(filename, 60 * 60 * 24 * 7); // 7 days expiry
    
    const signedUrl = urlData?.signedUrl;
    
    if (!signedUrl) {
      console.error('Failed to generate signed URL');
      return NextResponse.json(
        { error: 'Failed to generate image URL' },
        { status: 500 }
      );
    }
    
    // Save record to database
    const photoId = crypto.randomBytes(16).toString('hex');
    
    try {
      await db.insert(facialProgressPhotosTable).values({
        id: photoId,
        user_id: user.id,
        photo_url: signedUrl,
        lighting_score: body.lightingScore || null,
        alignment_score: body.alignmentScore || null,
        notes: body.notes || null,
        metadata: body.metadata ? JSON.stringify(body.metadata) : null,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      
      // Clean up the uploaded file if database insert fails
      await supabase.storage
        .from('facial-progress')
        .remove([filename]);
        
      throw dbError;
    }
    
    // Return success response with photo information
    return NextResponse.json({
      success: true,
      photoId,
      photoUrl: signedUrl,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all facial progress photos for the authenticated user
export async function GET(request: Request) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Query the database for all photos belonging to the user, ordered by timestamp (newest first)
    const photos = await db.select()
      .from(facialProgressPhotosTable)
      .where(eq(facialProgressPhotosTable.user_id, user.id))
      .orderBy(desc(facialProgressPhotosTable.timestamp));
    
    // Generate new signed URLs for each photo
    const photosWithUpdatedUrls = await Promise.all(
      photos.map(async (photo) => {
        // Extract the path from the stored URL
        // The path is everything after /object/public/facial-progress/ or after the bucket name
        let path = '';
        try {
          // Try to extract path from URL that might have different formats
          const urlObj = new URL(photo.photo_url);
          const pathParts = urlObj.pathname.split('/');
          const bucketIndex = pathParts.findIndex(part => part === 'facial-progress');
          
          if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
            path = pathParts.slice(bucketIndex + 1).join('/');
          } else {
            // If we can't parse the path, use the original URL
            return photo;
          }
          
          // Remove any query parameters or tokens
          path = path.split('?')[0];
          
          // Create a new signed URL
          const { data: urlData } = await supabase.storage
            .from('facial-progress')
            .createSignedUrl(path, 60 * 60 * 24); // 1 day expiry
            
          if (urlData?.signedUrl) {
            return {
              ...photo,
              photo_url: urlData.signedUrl
            };
          }
        } catch (error) {
          console.error('Error generating signed URL:', error);
        }
        
        // Return original if we can't update
        return photo;
      })
    );
    
    // Return the photos with updated URLs
    return NextResponse.json({
      success: true,
      photos: photosWithUpdatedUrls
    });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
} 