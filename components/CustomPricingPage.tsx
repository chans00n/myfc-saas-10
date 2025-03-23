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
          interval: plan.interval || "month",
          popular: plan.popular || false,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map(plan => (
          <PricingCard 
            key={plan.id} 
            plan={plan} 
            onSelect={handleSelectPlan}
          />
        ))}
      </div>
    </div>
  )
} 