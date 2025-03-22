// Script to populate leaderboard with test data
const { createClient } = require('../utils/supabase/server');

async function populateLeaderboards() {
  try {
    console.log('Starting leaderboard population...');
    
    const supabase = createClient();

    // Get all active leaderboard categories
    const { data: categories, error: categoriesError } = await supabase
      .from('leaderboard_categories')
      .select('id, name')
      .eq('is_active', true);

    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }

    if (!categories || categories.length === 0) {
      throw new Error('No leaderboard categories found');
    }

    console.log(`Found ${categories.length} leaderboard categories`);

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      throw new Error(`Error fetching user: ${userError.message}`);
    }

    // If not authenticated, let's get a user from the database
    let userId;
    if (!userData?.user) {
      const { data: users, error: usersError } = await supabase
        .from('users_table')
        .select('id')
        .limit(1);

      if (usersError || !users || users.length === 0) {
        throw new Error('No users found in the database');
      }

      userId = users[0].id;
      console.log(`Using existing user ID: ${userId}`);
    } else {
      userId = userData.user.id;
      console.log(`Using authenticated user ID: ${userId}`);
    }

    // Create some fake user IDs for other entries
    const fakeUser1 = '00000000-0000-0000-0000-000000000001';
    const fakeUser2 = '00000000-0000-0000-0000-000000000002';

    // Define scores for each category
    const categoryScores = {
      'All-Time Workouts': { user: 42, fake1: 38, fake2: 35 },
      'Longest Streak': { user: 21, fake1: 18, fake2: 15 },
      'Weekly Champions': { user: 7, fake1: 6, fake2: 5 },
      'Monthly Dedication': { user: 95, fake1: 90, fake2: 85 }
    };

    // First, clear existing entries for these users
    const { error: deleteError } = await supabase
      .from('leaderboard_entries')
      .delete()
      .in('user_id', [userId, fakeUser1, fakeUser2]);

    if (deleteError) {
      console.warn(`Warning when deleting existing entries: ${deleteError.message}`);
    }

    // Add entries for each category
    for (const category of categories) {
      const scores = categoryScores[category.name] || { user: 50, fake1: 45, fake2: 40 };
      
      const entries = [
        {
          category_id: category.id,
          user_id: userId,
          rank: 1,
          score: scores.user,
          last_updated: new Date().toISOString()
        },
        {
          category_id: category.id,
          user_id: fakeUser1,
          rank: 2,
          score: scores.fake1,
          last_updated: new Date().toISOString()
        },
        {
          category_id: category.id,
          user_id: fakeUser2,
          rank: 3,
          score: scores.fake2,
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

    console.log('Leaderboard population completed successfully');
  } catch (error) {
    console.error('Error populating leaderboards:', error);
  }
}

// Run the population function
populateLeaderboards(); 