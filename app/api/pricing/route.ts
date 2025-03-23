import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/api';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/utils/db/db';
import { usersTable } from '@/utils/db/schema';
import { eq } from 'drizzle-orm';

// Cache the prices for 1 hour (in milliseconds)
const CACHE_DURATION = 60 * 60 * 1000;
let cachedPrices: any[] = [];
let lastFetched = 0;

// IDs of the only plans we want to show
// Replace these with the actual price IDs of the plans you want to keep
const ALLOWED_PLAN_IDS: string[] = [
  // List your two price IDs here, e.g.:
  "price_1QxzMRAGGp9MhWwYzY4MgIEt",
  "price_1QxzLdAGGp9MhWwYuM49Lyif"
];

// Check if we should show all plans or filter them
// Set to false to only show plans with IDs in ALLOWED_PLAN_IDS
const SHOW_ALL_PLANS = true; // Changed to true to show all plans

export async function GET() {
  try {
    // Check if we need to refresh the cache
    const now = Date.now();
    if (now - lastFetched > CACHE_DURATION || cachedPrices.length === 0) {
      console.log('Fetching fresh pricing data from Stripe');
      // Get all active products
      const products = await stripe.products.list({
        active: true,
        expand: ['data.default_price'],
      });

      // Filter out products without default price and format them for the frontend
      cachedPrices = products.data
        .filter(product => product.default_price)
        .map(product => {
          const price = product.default_price as any;
          return {
            id: price.id,
            productId: product.id,
            name: product.name,
            description: product.description,
            price: price.unit_amount,
            currency: price.currency,
            interval: price.recurring?.interval || 'month',
            features: product.metadata?.features ? JSON.parse(product.metadata.features) : [],
            popular: product.metadata?.popular === 'true',
          };
        })
        .sort((a, b) => (a.price || 0) - (b.price || 0)); // Sort by price (lowest first)
      
      lastFetched = now;
    } else {
      console.log('Using cached pricing data');
    }

    // Apply plan filtering if enabled
    const filteredPrices = SHOW_ALL_PLANS 
      ? cachedPrices 
      : cachedPrices.filter(plan => ALLOWED_PLAN_IDS.includes(plan.id));

    return NextResponse.json(filteredPrices);
  } catch (error: any) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing information' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { priceId } = await request.json();
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }
    
    // Get the user's Stripe customer ID
    const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, user.email!));
    
    if (!userRecord.length) {
      return NextResponse.json(
        { error: 'User record not found' },
        { status: 404 }
      );
    }
    
    const stripeCustomerId = userRecord[0].stripe_id;
    
    // Get price details to check if it's a monthly plan (to add trial)
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    });
    
    // Safely check if it's a monthly plan by examining the product name
    let isMonthlyPlan = false;
    if (price.product && typeof price.product !== 'string') {
      const product = price.product as any; // Cast to any to avoid type issues
      if (product.name && typeof product.name === 'string') {
        isMonthlyPlan = product.name.toLowerCase().includes('monthly');
      }
    }
    
    // Create a checkout session with the selected price
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: isMonthlyPlan ? {
        trial_period_days: 7
      } : undefined,
      success_url: `${process.env.NODE_ENV === 'production' ? 'https://members.myfc.app' : process.env.NEXT_PUBLIC_WEBSITE_URL}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NODE_ENV === 'production' ? 'https://members.myfc.app' : process.env.NEXT_PUBLIC_WEBSITE_URL}/subscribe`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto',
        shipping: 'auto'
      },
    });
    
    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 