"use client"

import { useEffect, useState } from "react"
import PricingCard, { PricingFeature, PricingPlan } from "./PricingCard"
import { Card } from "./ui/card"

interface CustomPricingPageProps {
  userId: string
  userEmail: string
}

export default function CustomPricingPage({ userId, userEmail }: CustomPricingPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [error, setError] = useState("")
  
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
  
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <Card key={i} className="opacity-40 animate-pulse h-[450px]"></Card>
          ))}
        </div>
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
    <div className="container max-w-6xl mx-auto px-4">
      {/* Benefits section */}
      <div className="mb-12 text-center max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Transform Your Fitness Journey Today</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Join thousands of members who have already transformed their lives with our personalized fitness programs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-300 font-medium mb-2">Personalized Plans</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Custom workouts designed for your goals and fitness level</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
            <div className="text-green-600 dark:text-green-300 font-medium mb-2">Expert Support</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Guidance from certified fitness professionals</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
            <div className="text-purple-600 dark:text-purple-300 font-medium mb-2">Progress Tracking</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your improvements with detailed analytics</p>
          </div>
        </div>
      </div>
      
      {/* Plan selection section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map(plan => (
          <PricingCard 
            key={plan.id} 
            plan={plan} 
            onSelect={handleSelectPlan}
          />
        ))}
      </div>
      
      {/* Testimonials section */}
      <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-semibold text-center mb-8">What Our Members Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="italic text-gray-600 dark:text-gray-300 mb-4">"I've tried many fitness programs, but this one actually works. The personalized plans make all the difference!"</p>
            <div className="font-medium">Sarah K.</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Member since 2022</div>
          </div>
          <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="italic text-gray-600 dark:text-gray-300 mb-4">"The annual plan was a no-brainer for me. Great value and the results speak for themselves."</p>
            <div className="font-medium">Mike T.</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Lost 30lbs in 6 months</div>
          </div>
        </div>
      </div>
      
      {/* FAQ section */}
      <div className="mt-16 mb-8">
        <h3 className="text-xl font-semibold text-center mb-8">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">Can I cancel my subscription anytime?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Yes, you can cancel your subscription at any time. For monthly plans, you'll maintain access until the end of your current billing period. Annual plans can also be canceled, but are non-refundable.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">How does the 7-day free trial work?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">The monthly plan includes a 7-day free trial. You won't be charged until the trial period ends, and you're free to cancel anytime during the trial.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-medium mb-2">What's included in my membership?</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your membership includes access to personalized workout plans, nutritional guidance, progress tracking, and our community support. Annual members also receive premium features and priority support.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 