import { db } from '@/utils/db/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Check if theme_preference column exists
    const columnCheckResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users_table' 
      AND column_name = 'theme_preference'
    `);

    const columnExists = columnCheckResult.length > 0;

    if (columnExists) {
      return NextResponse.json({ 
        success: true, 
        message: 'Column theme_preference already exists.' 
      });
    } else {
      try {
        // Add the column if it doesn't exist
        await db.execute(sql`
          ALTER TABLE users_table 
          ADD COLUMN theme_preference TEXT DEFAULT 'light'
        `);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Column theme_preference added successfully with default value "light"' 
        });
      } catch (alterError) {
        console.error('Error adding theme_preference column:', alterError);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to add theme_preference column',
          details: alterError 
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Error checking database schema:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error checking database schema',
      details: error 
    }, { status: 500 });
  }
} 