import { db } from '@/utils/db/db';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// This is a public API endpoint (no auth check) specifically to fix the theme column
export async function GET(request: NextRequest) {
  // Add a secret key check to prevent unauthorized access
  const secretKey = request.nextUrl.searchParams.get('key');
  if (secretKey !== 'fix-theme-column-now') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if theme_preference column exists
    const columnCheckResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users_table' 
      AND column_name = 'theme_preference'
    `);

    if (columnCheckResult.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Column theme_preference already exists.' 
      });
    }

    // Add the column
    await db.execute(sql`
      ALTER TABLE users_table 
      ADD COLUMN theme_preference TEXT DEFAULT 'light'
    `);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Column theme_preference added successfully with default value "light"' 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
} 