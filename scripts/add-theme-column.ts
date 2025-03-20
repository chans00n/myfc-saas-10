import { db } from '@/utils/db/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding theme_preference column to users_table...');

  try {
    // Check if column exists
    const columnCheckResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users_table' 
      AND column_name = 'theme_preference'
    `);

    const columnExists = columnCheckResult.length > 0;

    if (columnExists) {
      console.log('Column theme_preference already exists.');
    } else {
      // Add the column
      await db.execute(sql`
        ALTER TABLE users_table 
        ADD COLUMN theme_preference TEXT DEFAULT 'light'
      `);
      console.log('Column theme_preference added successfully with default value "light"');
    }
  } catch (error) {
    console.error('Error while adding theme_preference column:', error);
    process.exit(1);
  }

  process.exit(0);
}

main(); 