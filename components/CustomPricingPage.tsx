"use client"

import { useEffect, useState } from "react"
import PricingCard, { PricingFeature, PricingPlan } from "./PricingCard"
import { Card } from "./ui/card"
import { Check, Clock, ShieldCheck } from "lucide-react"
import { Button } from "./ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

interface CustomPricingPageProps {
  userId: string
  userEmail: string
}

export default function CustomPricingPage({ userId, userEmail }: CustomPricingPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [error, setError] = useState("")
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  
  // Calculate dates for timeline
  const today = new Date();
  const reminderDate = new Date(today);
  reminderDate.setDate(today.getDate() + 6); // 6 days from now for reminder (1 day before trial ends)
  
  const subscriptionDate = new Date(today);
  subscriptionDate.setDate(today.getDate() + 7); // 7 days from now for subscription start
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/pricing", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (!response.ok) {
          throw new Error("Failed to fetch pricing plans")
        }
        
        const data = await response.json()
        
        // Transform API data to our PricingPlan format
        const formattedPlans = data.map((plan: any) => ({
          id: plan.id,
          name: plan.name,
          description: plan.description || `${plan.name} subscription plan`,
          price: plan.price || 0,
          interval: plan.interval || (plan.name.toLowerCase().includes('annual') ? 'year' : 'month'),
          popular: plan.name.toLowerCase().includes('annual'), // Mark annual plan as popular
          features: transformFeatures(plan.features || [])
        }))
        
        setPlans(formattedPlans)
      } catch (error) {
        console.error("Error fetching plans:", error)
        setError("Failed to load pricing information. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPlans()
  }, [])
  
  // Transform features array to PricingFeature format
  const transformFeatures = (features: string[]): PricingFeature[] => {
    return features.map(feature => ({
      name: feature,
      included: true,
    }))
  }
  
  const handleSelectPlan = async (priceId: string) => {
    try {
      const response = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }
      
      const { url } = await response.json()
      
      if (url) {
        // Redirect to Stripe Checkout
        window.location.href = url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error)
      setError(error.message || "Failed to start checkout process. Please try again.")
    }
  }
  
  // Sort plans - monthly first, then annual
  const sortedPlans = [...plans].sort((a, b) => {
    if (a.name.toLowerCase().includes('monthly')) return -1;
    if (b.name.toLowerCase().includes('monthly')) return 1;
    return 0;
  });
  
  const monthlyPlan = sortedPlans.find(p => p.name.toLowerCase().includes('monthly'));
  const annualPlan = sortedPlans.find(p => p.name.toLowerCase().includes('annual'));
  
  // Set monthly as default selected plan when plans are loaded
  useEffect(() => {
    if (monthlyPlan && !selectedPlanId) {
      setSelectedPlanId(monthlyPlan.id);
    }
  }, [monthlyPlan, selectedPlanId]);
  
  // Calculate savings percentage for annual plan
  let savingsPercent = 0;
  let monthlyEquivalent = 0;
  
  if (monthlyPlan && annualPlan) {
    const annualMonthly = annualPlan.price / 12; // Annual price divided by 12 months
    const monthlyCost = monthlyPlan.price;
    savingsPercent = Math.round((1 - (annualMonthly / monthlyCost)) * 100);
    monthlyEquivalent = annualMonthly / 100; // Convert to dollars
  }
  
  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4">
        <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full h-[380px]"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container max-w-3xl mx-auto px-4 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <h3 className="text-red-800 dark:text-red-300 font-medium">Error Loading Pricing</h3>
          <p className="text-red-700 dark:text-red-400 mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 px-4 py-2 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }
  
  if (plans.length === 0) {
    return (
      <div className="container max-w-3xl mx-auto px-4 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <h3 className="text-yellow-800 dark:text-yellow-300 font-medium">No Plans Available</h3>
          <p className="text-yellow-700 dark:text-yellow-400 mt-2">
            We couldn't find any active subscription plans. Please check back later.
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container max-w-3xl mx-auto px-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-xl font-semibold mb-2">Start Your FREE 7-Day Trial</h3>
          <div className="text-neutral-500 dark:text-gray-400 mb-4 text-sm">
            Choose a plan:
          </div>
        </div>
        
        {/* Plan Selection Cards */}
        <div className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            {monthlyPlan && (
              <div 
                className={`relative border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors ${selectedPlanId === monthlyPlan.id ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setSelectedPlanId(monthlyPlan.id)}
              >
                <div className="flex items-start">
                  <div className="w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center border-blue-500 flex-shrink-0 mr-3">
                    {selectedPlanId === monthlyPlan.id && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">Monthly</div>
                    <div className="flex items-end">
                      <span className="text-2xl font-bold">${(monthlyPlan.price / 100).toFixed(2)}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1 mb-0.5">/month</span>
                    </div>
                    <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                      Includes 7-day free trial
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Annual Plan */}
            {annualPlan && (
              <div 
                className={`relative border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors ${selectedPlanId === annualPlan.id ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setSelectedPlanId(annualPlan.id)}
              >
                <div className="absolute -right-1 -top-1 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {savingsPercent}% OFF
                </div>
                <div className="flex items-start">
                  <div className="w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center border-blue-500 flex-shrink-0 mr-3">
                    {selectedPlanId === annualPlan.id && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">Yearly</div>
                    <div className="flex items-end">
                      <span className="text-2xl font-bold">${monthlyEquivalent.toFixed(2)}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1 mb-0.5">/month</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Billed ${(annualPlan.price / 100).toFixed(2)} annually
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Timeline */}
        <div className="p-6">
          <h4 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">How it works</h4>
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-neutral-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <div className="font-medium">Today</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  All Pro features immediately unlocked. Things just leveled up!
                </div>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-neutral-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <div className="font-medium">{formatDate(reminderDate)}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  You'll get a reminder 1 day before the trial is up.
                </div>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-neutral-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="ml-4">
                <div className="font-medium">{formatDate(subscriptionDate)}</div>
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Your Pro subscription starts! Unless you cancel before.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* CTA */}
        <div className="p-6 pt-2 flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full py-6"
            onClick={() => {
              const planId = selectedPlanId || (monthlyPlan ? monthlyPlan.id : null);
              if (planId) handleSelectPlan(planId);
            }}
          >
            Start your free trial
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>No strings attached, cancel anytime</span>
          </div>
        </div>
      </div>
      
      {/* Benefits section below the plans */}
      <div className="mt-16 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Transform Your Fitness Journey Today</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Join thousands of members who have already transformed their lives with our personalized fitness programs.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
          <div>
            <h3 className="font-semibold text-lg mb-4">Membership includes:</h3>
            <ul className="space-y-3">
              {plans[0]?.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                  <span>{feature.name}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Why members love us:</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="italic text-sm text-gray-600 dark:text-gray-300">"The personalized plans and support have transformed my fitness journey. Best investment I've made in myself!"</p>
                <div className="font-medium mt-2">- Sarah K.</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="italic text-sm text-gray-600 dark:text-gray-300">"I tried the free trial and was hooked. The annual plan is a great value, and I've seen amazing results."</p>
                <div className="font-medium mt-2">- Mike T.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="mt-16 mb-8">
        <h3 className="text-xl font-semibold text-center mb-8">Frequently Asked Questions</h3>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-b border-gray-200 dark:border-gray-800">
            <AccordionTrigger className="hover:no-underline py-4 text-left">
              Can I cancel my subscription anytime?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 dark:text-gray-300">
              Yes, you can cancel your subscription at any time. For monthly plans, you'll maintain access until the end of your current billing period.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2" className="border-b border-gray-200 dark:border-gray-800">
            <AccordionTrigger className="hover:no-underline py-4 text-left">
              How does the 7-day free trial work?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 dark:text-gray-300">
              The monthly plan includes a 7-day free trial. You won't be charged until the trial period ends, and you're free to cancel anytime during the trial.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3" className="border-b border-gray-200 dark:border-gray-800">
            <AccordionTrigger className="hover:no-underline py-4 text-left">
              What's included in my membership?
            </AccordionTrigger>
            <AccordionContent className="text-sm text-gray-600 dark:text-gray-300">
              Your membership includes access to personalized workout plans, nutritional guidance, progress tracking, and our community support. Annual members also receive priority support.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
} 