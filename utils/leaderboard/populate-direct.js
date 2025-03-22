// Script to directly populate leaderboard with test data using Supabase JS client
const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase URL and anon key
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to populate leaderboard with sample data
async function populateLeaderboard() {
  try {
    console.log('Starting leaderboard population...');

    // First, let's get the category IDs
    const { data: categories, error: categoriesError } = await supabase
      .from('leaderboard_categories')
      .select('id, name')
      .eq('is_active', true);

    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }

    console.log('Found categories:', categories);
    
    // Get the current user ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error(`Error fetching user: ${userError.message}`);
    }
    
    if (!user) {
      throw new Error('No authenticated user found. Please log in first.');
    }
    
    const userId = user.id;
    console.log(`Using user ID: ${userId}`);
    
    // Generate some fake user IDs for demo purposes
    const fakeUser1 = '00000000-0000-0000-0000-000000000001';
    const fakeUser2 = '00000000-0000-0000-0000-000000000002';
    
    // Clear any existing entries for these users
    const { error: deleteError } = await supabase
      .from('leaderboard_entries')
      .delete()
      .in('user_id', [userId, fakeUser1, fakeUser2]);
      
    if (deleteError) {
      console.warn(`Warning when clearing entries: ${deleteError.message}`);
    }
    
    // Add entries for each category
    for (const category of categories) {
      // Define scores based on category
      let userScore, fake1Score, fake2Score;
      
      switch (category.name) {
        case 'All-Time Workouts':
          userScore = 42;
          fake1Score = 38;
          fake2Score = 35;
          break;
        case 'Longest Streak':
          userScore = 21;
          fake1Score = 18;
          fake2Score = 15;
          break;
        case 'Weekly Champions':
          userScore = 7;
          fake1Score = 6;
          fake2Score = 5;
          break;
        case 'Monthly Dedication':
          userScore = 95;
          fake1Score = 90;
          fake2Score = 85;
          break;
        default:
          userScore = 50;
          fake1Score = 45;
          fake2Score = 40;
      }
      
      const entries = [
        {
          category_id: category.id,
          user_id: userId,
          rank: 1,
          score: userScore,
          last_updated: new Date().toISOString()
        },
        {
          category_id: category.id,
          user_id: fakeUser1,
          rank: 2,
          score: fake1Score,
          last_updated: new Date().toISOString()
        },
        {
          category_id: category.id,
          user_id: fakeUser2,
          rank: 3,
          score: fake2Score,
          last_updated: new Date().toISOString()
        }
      ];
      
      const { error: insertError } = await supabase
        .from('leaderboard_entries')
        .insert(entries);
        
      if (insertError) {
        console.error(`Error adding entries for ${category.name}: ${insertError.message}`);
      } else {
        console.log(`Added entries for ${category.name}`);
      }
    }
    
    console.log('Leaderboard population completed!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
populateLeaderboard();

/*
Instructions to use this script:

1. Replace SUPABASE_URL and SUPABASE_ANON_KEY with your actual values
2. Make sure you're logged in to your Supabase account in the browser
3. Run this script with: node utils/leaderboard/populate-direct.js
4. Refresh your leaderboard page to see the results
*/ 