const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

console.error('Script started');
console.error('Environment variables:');
for (const key in process.env) {
  if (key.includes('SUPABASE')) {
    console.error(`${key}: ${process.env[key] ? 'Value exists (not showing for security)' : 'No value'}`);
  }
} 