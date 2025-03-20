import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { createClient } from '@/utils/supabase/server'
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";
import { stripe } from '@/utils/stripe/api'

export default async function SubscribeSuccess() {
    // Get current user
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    
    // If user is logged in, update their plan
    if (data?.user) {
        try {
            console.log('Checking for subscription updates in success page');
            // Find user's Stripe customer ID
            const userRecord = await db.select().from(usersTable).where(eq(usersTable.email, data.user.email!))
            
            if (userRecord.length > 0) {
                console.log(`Found user record for ${data.user.email}`, userRecord[0]);
                
                // Check if plan is still "none"
                if (userRecord[0].plan === 'none') {
                    console.log('User plan is still "none", checking Stripe for subscriptions');
                    
                    // Find latest subscription
                    const subscriptions = await stripe.subscriptions.list({
                        customer: userRecord[0].stripe_id,
                        limit: 1,
                        status: 'active',
                    });
                    
                    if (subscriptions.data.length > 0) {
                        console.log(`Found active subscription: ${subscriptions.data[0].id}`);
                        
                        // Update plan to subscription ID
                        await db.update(usersTable)
                            .set({ plan: subscriptions.data[0].id })
                            .where(eq(usersTable.id, userRecord[0].id));
                            
                        console.log('Successfully updated user plan');
                    } else {
                        console.log('No active subscriptions found for this customer');
                    }
                } else {
                    console.log(`User already has a plan: ${userRecord[0].plan}`);
                }
            } else {
                console.error('No user record found in database');
            }
        } catch (error) {
            console.error('Error updating subscription info:', error);
        }
    }

    return (
        <div className="flex items-center justify-center bg-muted min-h-screen">
            <Card className="w-[350px] mx-auto">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center py-4">
                        <Link href='/'>
                            <Image src="/logo.png" alt="logo" width={50} height={50} />
                        </Link>
                    </div>

                    <CardTitle className="text-2xl font-bold">Success</CardTitle>
                    <CardDescription>Thank you for subscribing!</CardDescription>
                </CardHeader>

                <CardFooter className="flex-col text-center">
                    <Button className="w-full text-sm " >
                        <Link href="/dashboard">
                            Go To Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div >
    )
}