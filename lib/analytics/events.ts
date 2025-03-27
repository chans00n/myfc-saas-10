import { trackEvent } from '@/lib/analytics'

// Authentication Events
export const authEvents = {
  signUp: (method: 'email' | 'google' | 'github') =>
    trackEvent('sign_up', {
      category: 'authentication',
      label: method,
    }),
  
  login: (method: 'email' | 'google' | 'github') =>
    trackEvent('login', {
      category: 'authentication',
      label: method,
    }),
    
  logout: () =>
    trackEvent('logout', {
      category: 'authentication',
    }),
}

// Subscription Events
export const subscriptionEvents = {
  viewPricing: () =>
    trackEvent('view_pricing', {
      category: 'subscription',
    }),
    
  startTrial: (plan: string) =>
    trackEvent('start_trial', {
      category: 'subscription',
      label: plan,
    }),
    
  subscribe: (plan: string, value: number) =>
    trackEvent('subscribe', {
      category: 'subscription',
      label: plan,
      value: value,
    }),
    
  cancelSubscription: (plan: string, reason?: string) =>
    trackEvent('cancel_subscription', {
      category: 'subscription',
      label: plan,
      reason: reason,
    }),
}

// Feature Usage Events
export const featureEvents = {
  startWorkout: (type: string) =>
    trackEvent('start_workout', {
      category: 'feature_usage',
      label: type,
    }),
    
  completeWorkout: (type: string, duration: number) =>
    trackEvent('complete_workout', {
      category: 'feature_usage',
      label: type,
      value: duration, // duration in seconds
    }),
    
  trackProgress: (metric: string) =>
    trackEvent('track_progress', {
      category: 'feature_usage',
      label: metric,
    }),
    
  achieveMilestone: (milestone: string) =>
    trackEvent('achieve_milestone', {
      category: 'feature_usage',
      label: milestone,
    }),
}

// Engagement Events
export const engagementEvents = {
  viewKnowledgeBase: (article?: string) =>
    trackEvent('view_knowledge_base', {
      category: 'engagement',
      label: article,
    }),
    
  shareProgress: (platform: string) =>
    trackEvent('share_progress', {
      category: 'engagement',
      label: platform,
    }),
    
  updateProfile: (fields: string[]) =>
    trackEvent('update_profile', {
      category: 'engagement',
      label: fields.join(','),
    }),
    
  provideFeedback: (type: 'rating' | 'comment', value?: number) =>
    trackEvent('provide_feedback', {
      category: 'engagement',
      label: type,
      value: value,
    }),
}

// Error Events
export const errorEvents = {
  apiError: (endpoint: string, error: string) =>
    trackEvent('api_error', {
      category: 'error',
      label: endpoint,
      error: error,
      nonInteraction: true,
    }),
    
  paymentError: (step: string, error: string) =>
    trackEvent('payment_error', {
      category: 'error',
      label: step,
      error: error,
      nonInteraction: true,
    }),
} 