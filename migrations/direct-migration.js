// Direct migration script to add theme_preference column to users_table
const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../.env.local');

console.log('Looking for env file at:', envPath);
if (fs.existsSync(envPath)) {
  console.log('.env.local file found');
  require('dotenv').config({ path: envPath });
} else {
  console.error('.env.local file not found');
  process.exit(1);
}

const postgres = require('postgres');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  
  console.log('Environment variables:');
  console.log('DATABASE_URL:', dbUrl ? '[exists]' : '[missing]');
  
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(dbUrl);

  try {
    console.log('Checking if theme_preference column exists...');
    const columnCheckResult = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users_table' 
      AND column_name = 'theme_preference'
    `;

    if (columnCheckResult.length > 0) {
      console.log('Column theme_preference already exists, skipping migration.');
    } else {
      console.log('Adding theme_preference column to users_table...');
      await sql`
        ALTER TABLE users_table 
        ADD COLUMN theme_preference TEXT DEFAULT 'light'
      `;
      console.log('Column theme_preference added successfully!');
    }
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    // Close the database connection
    await sql.end();
    console.log('Database connection closed');
  }
}

main(); 