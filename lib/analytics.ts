export type EventOptions = {
  category?: string
  label?: string
  value?: number
  nonInteraction?: boolean
  [key: string]: any
}

// Basic page view tracking
export function trackPageview(url: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Enhanced event tracking
export function trackEvent(action: string, options: EventOptions = {}) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', action, {
      event_category: options.category || 'general',
      event_label: options.label,
      value: options.value,
      non_interaction: options.nonInteraction,
      ...options,
    })
  }
}

// User property tracking
export function setUserProperties(properties: { [key: string]: any }) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('set', 'user_properties', properties)
  }
}

// Ecommerce tracking
export function trackPurchase(transaction: {
  id: string
  value: number
  currency?: string
  items?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'purchase', {
      transaction_id: transaction.id,
      value: transaction.value,
      currency: transaction.currency || 'USD',
      items: transaction.items || [],
    })
  }
}

// Marketing conversion tracking
export function trackConversion(conversionId: string, label: string, value?: number) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', 'conversion', {
      send_to: `${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}/${conversionId}`,
      value: value,
      currency: 'USD',
      label: label,
    })
  }
} 