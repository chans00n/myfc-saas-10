# Facial Fitness Tracking

This document describes the facial fitness tracking feature, how it works, and how to test it.

## Overview

The facial fitness tracking system allows users to:

1. Take consistent, high-quality facial photos
2. Track progress over time
3. Compare before/after photos
4. Maintain a gallery of progress photos

The feature helps users visualize subtle changes in their face as they follow the facial fitness program.

## Architecture

The system consists of:

### Frontend Components

- `FacialTrackingCapture`: Camera interface with alignment guides and photo capture
- `FacialProgressGallery`: Gallery view of previously captured photos
- Facial progress page integrating these components

### Backend Components

- API endpoints for uploading and retrieving photos
- Supabase storage for secure file storage
- Database tables for tracking photo metadata and user associations

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS facial_progress_photos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users_table(id),
  photo_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lighting_score INTEGER,
  alignment_score INTEGER,
  notes TEXT,
  metadata TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users_table(id) ON DELETE CASCADE
);
```

## Storage

Photos are stored in a Supabase storage bucket named `facial-progress`. Files are organized in folders named after each user's ID to maintain security and isolation.

## Security

- Row Level Security (RLS) policies ensure users can only access their own photos
- Storage policies restrict access to only the authenticated user's files
- Photos are stored in user-specific folders for additional separation

## Testing

### Backend Testing

Run the test script to verify configuration:

```bash
node scripts/test-facial-tracking.js
```

This tests:
- Supabase bucket existence and configuration
- Database table setup
- RLS policies
- API accessibility

### Manual Testing

1. Navigate to `/dashboard/facial-progress` in the app
2. Allow camera access when prompted
3. Follow the alignment guide to position your face
4. Take a photo
5. Verify the photo appears in your gallery
6. Take another photo for comparison
7. Test comparing different photos

## Troubleshooting

### Common Issues

- **Camera access denied**: User must grant camera permissions
- **Upload errors**: Check Supabase bucket permissions
- **Missing photos**: Verify RLS policies are correctly configured
- **Black screen**: Browser may not support the camera API

### Checking Logs

Check browser console and server logs for errors.

## Future Improvements

Potential future enhancements:

- AI-powered facial landmark detection
- Automatic alignment assistance
- Facial measurement tools
- Progress analytics and reporting
- Image quality optimization
- Time-lapse generation from progress photos

## Support

For questions or issues, contact the development team. 