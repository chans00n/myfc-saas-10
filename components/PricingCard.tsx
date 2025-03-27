"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { subscriptionEvents } from "@/lib/analytics/events"

export interface PricingFeature {
  name: string
  included: boolean
}

export interface PricingPlan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  features: PricingFeature[]
  popular?: boolean
}

interface PricingCardProps {
  plan: PricingPlan
  onSelect: (planId: string) => Promise<void>
}

export default function PricingCard({ plan, onSelect }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Track when user views pricing
  useEffect(() => {
    subscriptionEvents.viewPricing()
  }, [])
  
  const handleSelect = async () => {
    try {
      setIsLoading(true)
      
      // Track trial start or subscription
      if (plan.interval === 'month') {
        subscriptionEvents.startTrial(plan.name)
      } else {
        subscriptionEvents.subscribe(plan.name, plan.price)
      }
      
      await onSelect(plan.id)
    } catch (error) {
      console.error("Error selecting plan:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const isAnnual = plan.name.toLowerCase().includes('annual')
  const isMonthly = plan.name.toLowerCase().includes('monthly')
  
  // Calculate monthly equivalent price for annual plan to show savings
  const monthlyEquivalentPrice = isAnnual ? (plan.price / 12 / 100).toFixed(2) : null
  
  return (
    <Card className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10 relative overflow-hidden' : 'border-border'}`}>
      {plan.popular && (
        <div className="py-1 px-4 bg-primary text-primary-foreground text-center text-sm font-medium -mt-px rounded-t-lg flex items-center justify-center gap-1">
          <Star className="h-3.5 w-3.5" /> 
          Best Value
          <Star className="h-3.5 w-3.5" />
        </div>
      )}
      
      {/* Price tag for annual plan */}
      {isAnnual && (
        <div className="absolute -right-8 top-10 bg-green-500 text-white text-xs font-bold px-10 py-1 rotate-45 shadow-md">
          SAVE 25%
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name.replace('Basic ', '')}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-3xl font-bold">${(plan.price / 100).toFixed(2)}</span>
          <span className="text-muted-foreground">/{plan.interval}</span>
          
          {/* Show monthly equivalent for annual plan */}
          {isAnnual && (
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              Just ${monthlyEquivalentPrice}/month
            </div>
          )}
          
          {/* Show trial info for monthly plan */}
          {isMonthly && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Includes 7-day free trial
            </div>
          )}
        </div>
        
        <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="font-medium mb-2">What's included:</div>
          <ul className="space-y-2">
            {plan.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Show additional plan-specific info */}
        {isAnnual ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md p-3 mb-4">
            <div className="text-sm text-green-700 dark:text-green-300 font-medium">Pay once, save more</div>
            <div className="text-xs text-green-600 dark:text-green-400">Annual payment offers the best value with 25% savings</div>
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3 mb-4">
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">Try risk-free for 7 days</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">Cancel anytime during trial - no charges</div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full"
          variant={plan.popular ? "default" : "outline"}
          size="lg"
          onClick={handleSelect}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : isAnnual ? 'Get Annual Plan' : 'Start 7-Day Free Trial'}
        </Button>
      </CardFooter>
    </Card>
  )
} 