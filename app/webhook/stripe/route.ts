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
    console.log(`STRIPE KEY TYPE: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? 'TEST MODE' : 'LIVE MODE'}`);
    console.log(`WEBHOOK SECRET: ${endpointSecret ? 'Present' : 'Missing'}`);
    
    const payload = await request.text();
    const sig = headers().get('stripe-signature');
    
    let event;
    
    try {
        // Verify the event came from Stripe
        if (endpointSecret && sig) {
            console.log('Attempting to verify webhook signature...');
            try {
                event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
                console.log('Webhook signature verified successfully');
            } catch (verifyError: any) {
                console.error('Webhook signature verification failed:', verifyError.message);
                return new Response(`Webhook signature verification failed: ${verifyError.message}`, { status: 400 });
            }
        } else {
            // For development without signature verification
            console.log('No webhook secret or signature - parsing payload directly');
            event = JSON.parse(payload);
        }
        
        console.log(`Event type: ${event.type}`);
        console.log(`Event ID: ${event.id}`);
        console.log(`Event created: ${new Date(event.created * 1000).toISOString()}`);
        
        // Handle the event based on its type
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Checkout session completed:', JSON.stringify(session, null, 2));
                // When checkout is completed, update user with subscription ID
                await handleCheckoutComplete(session);
                break;
                
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subscription = event.data.object;
                console.log(`Subscription ${event.type}:`, JSON.stringify(subscription, null, 2));
                // When subscription is created or updated
                await handleSubscriptionChange(subscription);
                break;
                
            case 'customer.subscription.deleted':
                // Handle subscription deletion if needed
                const deletedSubscription = event.data.object;
                console.log('Subscription deleted:', JSON.stringify(deletedSubscription, null, 2));
                await handleSubscriptionCancellation(deletedSubscription);
                break;
                
            case 'invoice.payment_failed':
                const failedInvoice = event.data.object;
                console.log('Payment failed:', JSON.stringify(failedInvoice, null, 2));
                await handlePaymentFailure(failedInvoice);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        console.log('Webhook processing completed successfully');
        return new Response('Success', { status: 200 });
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        console.error('Error stack:', error.stack);
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        });
    }
}

async function handleCheckoutComplete(session: any) {
    try {
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        
        console.log(`Handling checkout complete for customer: ${customerId}`);
        console.log(`Success URL configured as: ${session.success_url}`);
        
        if (customerId && subscriptionId) {
            console.log(`Updating user with customer ID ${customerId} to subscription ${subscriptionId}`);
            
            try {
                // Get the subscription details to extract plan name
                console.log('Retrieving subscription details from Stripe...');
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                console.log('Subscription retrieved successfully:', subscription.id);
                
                const planName = await getPlanNameFromSubscription(subscription);
                console.log(`Determined plan name: ${planName}`);
                
                // Lookup user to verify they exist in the database
                console.log(`Looking up user with stripe_id: ${customerId}`);
                const existingUsers = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                console.log(`Found ${existingUsers.length} user(s) with matching stripe_id`);
                
                if (existingUsers.length === 0) {
                    console.error(`No user found with stripe_id: ${customerId}`);
                    return;
                }
                
                console.log(`User found: ${existingUsers[0].email} (${existingUsers[0].id})`);
                
                // Update user record with subscription ID and plan name
                console.log('Updating user record in database...');
                const updateResult = await db.update(usersTable)
                    .set({ 
                        plan: subscriptionId,
                        plan_name: planName
                    })
                    .where(eq(usersTable.stripe_id, customerId));
                
                console.log('Database update executed, checking if any rows were affected...');
                // Note: Drizzle doesn't return affected rows count, so we need to verify manually
                
                // Verify update succeeded by checking if plan was updated
                const updatedUser = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                
                if (updatedUser.length > 0 && updatedUser[0].plan === subscriptionId) {
                    console.log('Database update confirmed successful!');
                } else {
                    console.error('Database update may have failed - plan not updated correctly');
                    console.log('Updated user data:', JSON.stringify(updatedUser[0], null, 2));
                }
            } catch (dbError: any) {
                console.error('Database operation failed:', dbError.message);
                console.error('Database error stack:', dbError.stack);
                throw dbError; // Rethrow to be caught by the parent catch
            }
        } else {
            console.warn('Missing customer ID or subscription ID in checkout session');
            console.log('Session data:', JSON.stringify(session, null, 2));
        }
    } catch (error: any) {
        console.error('Error handling checkout completion:', error.message);
        console.error('Error stack:', error.stack);
    }
}

async function handleSubscriptionChange(subscription: any) {
    try {
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        
        console.log(`Handling subscription change for subscription ${subscriptionId}, customer ${customerId}, status ${status}`);
        
        // Only update if subscription is active
        if (status === 'active' && customerId) {
            try {
                const planName = await getPlanNameFromSubscription(subscription);
                console.log(`Determined plan name for subscription change: ${planName}`);
                
                // Lookup user to verify they exist in the database
                console.log(`Looking up user with stripe_id: ${customerId}`);
                const existingUsers = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                console.log(`Found ${existingUsers.length} user(s) with matching stripe_id`);
                
                if (existingUsers.length === 0) {
                    console.error(`No user found with stripe_id: ${customerId}`);
                    return;
                }
                
                console.log(`User found: ${existingUsers[0].email} (${existingUsers[0].id})`);
                
                // Update user record with subscription ID and plan name
                console.log('Updating user record for subscription change...');
                await db.update(usersTable)
                    .set({ 
                        plan: subscriptionId,
                        plan_name: planName
                    })
                    .where(eq(usersTable.stripe_id, customerId));
                
                // Verify update succeeded
                const updatedUser = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                
                if (updatedUser.length > 0 && updatedUser[0].plan === subscriptionId) {
                    console.log('Subscription change database update confirmed successful!');
                } else {
                    console.error('Subscription change database update may have failed');
                }
            } catch (dbError: any) {
                console.error('Database operation failed during subscription change:', dbError.message);
                throw dbError;
            }
        } else {
            console.log(`Subscription status is ${status}, not updating database`);
        }
    } catch (error: any) {
        console.error('Error handling subscription change:', error.message);
        console.error('Error stack:', error.stack);
    }
}

async function handleSubscriptionCancellation(subscription: any) {
    try {
        const customerId = subscription.customer;
        const subscriptionId = subscription.id;
        
        console.log(`Handling subscription cancellation for subscription ${subscriptionId}, customer ${customerId}`);
        
        if (customerId) {
            try {
                // Lookup user to verify they exist in the database
                console.log(`Looking up user with stripe_id: ${customerId}`);
                const existingUsers = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                console.log(`Found ${existingUsers.length} user(s) with matching stripe_id`);
                
                if (existingUsers.length === 0) {
                    console.error(`No user found with stripe_id: ${customerId}`);
                    return;
                }
                
                const user = existingUsers[0];
                console.log(`User found: ${user.email} (${user.id})`);
                
                // Only reset if this is the subscription that was active
                if (user.plan === subscriptionId) {
                    // Update user record to remove subscription access
                    console.log('Removing subscription access from user record...');
                    await db.update(usersTable)
                        .set({ 
                            plan: 'none',
                            plan_name: ''
                        })
                        .where(eq(usersTable.stripe_id, customerId));
                    
                    // Verify update succeeded
                    const updatedUser = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                    
                    if (updatedUser.length > 0 && updatedUser[0].plan === 'none') {
                        console.log('Database update for cancellation confirmed successful!');
                    } else {
                        console.error('Database update for cancellation may have failed');
                    }
                } else {
                    console.log(`Cancelled subscription ${subscriptionId} is not the current active subscription ${user.plan}, no action needed`);
                }
            } catch (dbError: any) {
                console.error('Database operation failed during subscription cancellation:', dbError.message);
                throw dbError;
            }
        } else {
            console.warn('Missing customer ID in subscription cancellation event');
        }
    } catch (error: any) {
        console.error('Error handling subscription cancellation:', error.message);
        console.error('Error stack:', error.stack);
    }
}

async function handlePaymentFailure(invoice: any) {
    try {
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;
        
        console.log(`Handling payment failure for invoice ${invoice.id}, customer ${customerId}, subscription ${subscriptionId}`);
        
        if (!customerId || !subscriptionId) {
            console.warn('Missing customer ID or subscription ID in failed invoice');
            return;
        }
        
        // Get subscription details to check status
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log(`Subscription status: ${subscription.status}`);
        
        // Only modify user access if subscription is past_due or canceled
        if (['past_due', 'canceled', 'unpaid'].includes(subscription.status)) {
            try {
                // Lookup user to verify they exist in the database
                console.log(`Looking up user with stripe_id: ${customerId}`);
                const existingUsers = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                console.log(`Found ${existingUsers.length} user(s) with matching stripe_id`);
                
                if (existingUsers.length === 0) {
                    console.error(`No user found with stripe_id: ${customerId}`);
                    return;
                }
                
                const user = existingUsers[0];
                console.log(`User found: ${user.email} (${user.id})`);
                
                // Only reset if this is the subscription that was active
                if (user.plan === subscriptionId) {
                    // Update user record to remove subscription access
                    console.log(`Removing subscription access due to payment failure (status: ${subscription.status})...`);
                    await db.update(usersTable)
                        .set({ 
                            plan: 'none',
                            plan_name: ''
                        })
                        .where(eq(usersTable.stripe_id, customerId));
                    
                    // Verify update succeeded
                    const updatedUser = await db.select().from(usersTable).where(eq(usersTable.stripe_id, customerId));
                    
                    if (updatedUser.length > 0 && updatedUser[0].plan === 'none') {
                        console.log('Database update for payment failure confirmed successful!');
                    } else {
                        console.error('Database update for payment failure may have failed');
                    }
                } else {
                    console.log(`Failed payment for subscription ${subscriptionId} is not the current active subscription ${user.plan}, no action needed`);
                }
            } catch (dbError: any) {
                console.error('Database operation failed during payment failure handling:', dbError.message);
                throw dbError;
            }
        } else {
            console.log(`Subscription is in status ${subscription.status}, not removing access yet`);
        }
    } catch (error: any) {
        console.error('Error handling payment failure:', error.message);
        console.error('Error stack:', error.stack);
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
                    console.log(`Retrieving price details for ${item.price.id}...`);
                    // Get more detailed price information
                    const price = await stripe.prices.retrieve(item.price.id, {
                        expand: ['product']
                    });
                    
                    if (price.product && typeof price.product !== 'string') {
                        // Check if product is not deleted before accessing name
                        if (!price.product.deleted) {
                            planName = (price.product as Stripe.Product).name || planName;
                            console.log(`Found product name: ${planName}`);
                        } else {
                            console.log('Product is marked as deleted');
                        }
                    } else {
                        console.log(`Product is a string reference: ${price.product}`);
                    }
                } catch (priceError: any) {
                    console.error('Error retrieving price details:', priceError.message);
                }
            } else {
                console.log('Price information missing or incomplete in subscription item');
            }
        } else {
            console.log('No subscription items found');
        }
        
        return planName;
    } catch (error: any) {
        console.error('Error extracting plan name:', error.message);
        return 'Premium Subscription';
    }
}