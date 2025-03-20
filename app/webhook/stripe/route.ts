import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    console.log('Webhook received');
    
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');
    
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
            
            // Update user record with subscription ID
            await db.update(usersTable)
                .set({ plan: subscriptionId })
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
            await db.update(usersTable)
                .set({ plan: subscriptionId })
                .where(eq(usersTable.stripe_id, customerId));
        }
    } catch (error) {
        console.error('Error handling subscription change:', error);
    }
}