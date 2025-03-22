#!/usr/bin/env node

/**
 * This script provides instructions for setting up a CRON job to update leaderboards
 * 
 * You can run this script with:
 * node scripts/setup-cron.js
 */

const crypto = require('crypto');

// Generate a random CRON_SECRET if one doesn't already exist
function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

const generatedSecret = generateSecret();

console.log(`
===============================================
MYFC Leaderboard CRON Job Setup Instructions
===============================================

To keep leaderboards updated automatically, you need to set up a scheduled job
that calls the leaderboard update API endpoint daily.

1. First, set a CRON_SECRET environment variable in your .env or deployment platform:

   CRON_SECRET=${generatedSecret}

2. OPTION A - If using Vercel:
   - Go to your Vercel project settings
   - Navigate to "Cron Jobs"
   - Add a new Cron Job with the following settings:
     - Name: "Update Leaderboards"
     - Schedule: "0 0 * * *" (daily at midnight)
     - HTTP Method: GET
     - URL Path: /api/cron/update-leaderboards?secret=${generatedSecret}

3. OPTION B - If using another hosting provider:
   - Set up a cron job with the following command:
     curl -X GET "https://your-domain.com/api/cron/update-leaderboards?secret=${generatedSecret}"

4. OPTION C - If running locally or for testing:
   - You can manually trigger the job by visiting:
     http://localhost:3000/api/cron/update-leaderboards?secret=${generatedSecret}

NOTE: Keep your CRON_SECRET secure and don't share it publicly!
`);

// For verification, let's log a test command that can be run to test the endpoint
console.log(`
-----------------------------------------------
Test Command (for local testing only):
-----------------------------------------------
curl -X GET "http://localhost:3000/api/cron/update-leaderboards?secret=${generatedSecret}"
`); 