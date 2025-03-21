import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    console.log('Webhook received');
    
    const payload = await request.text();
    const sig = headers().get('stripe-signature');
    
    let event;
    
    try {
        // Verify the event came from Stripe
        if (endpointSecret && sig) {
            event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
        } else {
            // For development without signature verification
            event = JSON.parse(payload);
        }
        
        console.log(`Event type: ${event.type}`);
        
        // Handle the event based on its type
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                // When checkout is completed, update user with subscription ID
                await handleCheckoutComplete(session);
                break;
                
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subscription = event.data.object;
                // When subscription is created or updated
                await handleSubscriptionChange(subscription);
                break;
                
            case 'customer.subscription.deleted':
                // Handle subscription deletion if needed
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        return new Response('Success', { status: 200 });
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        });
    }
}

async function handleCheckoutComplete(session: any) {
    try {
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        
        if (customerId && subscriptionId) {
            console.log(`Updating user with customer ID ${customerId} to subscription ${subscriptionId}`);
            
            // Get the subscription details to extract plan name
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const planName = await getPlanNameFromSubscription(subscription);
            
            // Update user record with subscription ID and plan name
            await db.update(usersTable)
                .set({ 
                    plan: subscriptionId,
                    plan_name: planName
                })
                .where(eq(usersTable.stripe_id, customerId));
        }
    } catch (error) {
        console.error('Error handling checkout completion:', error);
    }
}

async function handleSubscriptionChange(subscription: any) {
    try {
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        
        console.log(`Subscription ${subscriptionId} for customer ${customerId} is ${status}`);
        
        // Only update if subscription is active
        if (status === 'active' && customerId) {
            const planName = await getPlanNameFromSubscription(subscription);
            
            await db.update(usersTable)
                .set({ 
                    plan: subscriptionId,
                    plan_name: planName
                })
                .where(eq(usersTable.stripe_id, customerId));
        }
    } catch (error) {
        console.error('Error handling subscription change:', error);
    }
}

async function getPlanNameFromSubscription(subscription: any): Promise<string> {
    try {
        // Default plan name
        let planName = 'Premium Subscription';
        
        // Try to get a more specific plan name from the subscription
        if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
            const item = subscription.items.data[0];
            
            if (item.price && item.price.id) {
                try {
                    // Get more detailed price information
                    const price = await stripe.prices.retrieve(item.price.id, {
                        expand: ['product']
                    });
                    
                    if (price.product && typeof price.product !== 'string') {
                        // Check if product is not deleted before accessing name
                        if (!price.product.deleted) {
                            planName = (price.product as Stripe.Product).name || planName;
                        }
                    }
                } catch (priceError) {
                    console.error('Error retrieving price details:', priceError);
                }
            }
        }
        
        return planName;
    } catch (error) {
        console.error('Error extracting plan name:', error);
        return 'Premium Subscription';
    }
}