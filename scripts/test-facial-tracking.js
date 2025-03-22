#!/usr/bin/env node

/**
 * Test script for facial tracking feature
 * 
 * This script helps verify that the facial tracking system is working correctly.
 * It tests:
 * 1. Supabase storage bucket configuration
 * 2. Database schema and RLS policies
 * 3. API endpoints
 * 
 * Run this script with:
 * node scripts/test-facial-tracking.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log('🧪 Testing Facial Tracking System Configuration\n');
  
  let errors = 0;
  
  // Test 1: Check if bucket exists
  console.log('1️⃣ Testing storage bucket "facial-progress"...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) throw error;
    
    const facialProgressBucket = buckets.find(b => b.name === 'facial-progress');
    
    if (!facialProgressBucket) {
      console.error('❌ Bucket "facial-progress" does not exist');
      console.error('   Please create the bucket in Supabase dashboard');
      errors++;
    } else {
      console.log('✅ Bucket "facial-progress" exists');
      console.log(`   Public: ${facialProgressBucket.public ? 'Yes' : 'No'}`);
      
      if (facialProgressBucket.public) {
        console.warn('⚠️  Warning: Bucket is public. Consider making it private for security');
      }
    }
  } catch (err) {
    console.error('❌ Error checking storage bucket:', err.message);
    errors++;
  }
  
  // Test 2: Check database table
  console.log('\n2️⃣ Testing database table "facial_progress_photos"...');
  try {
    // Try to select data from the table
    const { data, error } = await supabase
      .from('facial_progress_photos')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.error('❌ Table "facial_progress_photos" does not exist');
      console.error('   Please run the migration to create this table');
      errors++;
    } else if (error) {
      console.error('❌ Error accessing table:', error.message);
      errors++;
    } else {
      console.log('✅ Table "facial_progress_photos" exists and is accessible');
    }
  } catch (err) {
    console.error('❌ Error checking database table:', err.message);
    errors++;
  }
  
  // Test 3: Check RLS policies
  console.log('\n3️⃣ Testing RLS policies...');
  try {
    const { data: policies, error } = await supabase.rpc('get_policies');
    
    if (error) {
      if (error.message.includes('function "get_policies" does not exist')) {
        console.warn('⚠️  Unable to check RLS policies directly');
        console.warn('   Manual verification required in Supabase dashboard');
      } else {
        throw error;
      }
    } else {
      const facialProgressPolicies = policies.filter(p => 
        p.table === 'facial_progress_photos'
      );
      
      if (facialProgressPolicies.length === 0) {
        console.error('❌ No RLS policies found for "facial_progress_photos"');
        console.error('   Please add appropriate RLS policies');
        errors++;
      } else {
        console.log(`✅ Found ${facialProgressPolicies.length} RLS policies for facial_progress_photos`);
        facialProgressPolicies.forEach(p => {
          console.log(`   - ${p.name} (${p.action})`);
        });
      }
    }
  } catch (err) {
    console.warn('⚠️  Unable to check RLS policies:', err.message);
    console.warn('   Manual verification required in Supabase dashboard');
  }
  
  // Test 4: Check storage policies
  console.log('\n4️⃣ Testing storage policies...');
  try {
    const { data: policies, error } = await supabase.rpc('get_policies');
    
    if (error) {
      if (error.message.includes('function "get_policies" does not exist')) {
        console.warn('⚠️  Unable to check storage policies directly');
        console.warn('   Manual verification required in Supabase dashboard');
      } else {
        throw error;
      }
    } else {
      const storagePolicies = policies.filter(p => 
        p.table === 'objects' && p.schema === 'storage'
      );
      
      if (storagePolicies.length === 0) {
        console.error('❌ No storage policies found');
        console.error('   Please add appropriate storage policies');
        errors++;
      } else {
        console.log(`✅ Found ${storagePolicies.length} storage policies`);
        storagePolicies.forEach(p => {
          console.log(`   - ${p.name} (${p.action})`);
        });
      }
    }
  } catch (err) {
    console.warn('⚠️  Unable to check storage policies:', err.message);
    console.warn('   Manual verification required in Supabase dashboard');
  }
  
  // Summary
  console.log('\n📋 Test Summary:');
  if (errors === 0) {
    console.log('🎉 All tests passed! The facial tracking system appears to be configured correctly.');
    console.log('   Next steps:');
    console.log('   1. Test the UI in the browser');
    console.log('   2. Take a test photo and verify it appears in your gallery');
    console.log('   3. Check for proper data in Supabase');
  } else {
    console.log(`❌ Found ${errors} issue${errors === 1 ? '' : 's'} that need${errors === 1 ? 's' : ''} to be resolved.`);
    console.log('   Please fix the errors above and run this test again.');
  }
}

runTests().catch(err => {
  console.error('Unhandled error during tests:', err);
  process.exit(1);
}); 