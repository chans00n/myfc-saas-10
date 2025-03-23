"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { useState } from "react"

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
  
  const handleSelect = async () => {
    try {
      setIsLoading(true)
      await onSelect(plan.id)
    } catch (error) {
      console.error("Error selecting plan:", error)
    } finally {
      // No need to set loading to false as we'll redirect
    }
  }
  
  return (
    <Card className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
      {plan.popular && (
        <div className="py-1 px-4 bg-primary text-primary-foreground text-center text-sm font-medium -mt-px rounded-t-lg">
          Most Popular
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <div className="mb-6">
          <span className="text-3xl font-bold">${(plan.price / 100).toFixed(2)}</span>
          <span className="text-muted-foreground">/{plan.interval}</span>
        </div>
        
        <ul className="space-y-2 mb-6">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className={`h-5 w-5 flex-shrink-0 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
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
          ) : `Subscribe Now`}
        </Button>
      </CardFooter>
    </Card>
  )
} 