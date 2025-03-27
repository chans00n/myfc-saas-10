import { trackEvent } from '@/lib/analytics'

// Authentication Events
export const authEvents = {
  signUp: (method: 'email' | 'google' | 'github', userType: string = 'free') =>
    trackEvent('sign_up', {
      category: 'authentication',
      label: method,
      user_type: userType
    }),
  
  login: (method: 'email' | 'google' | 'github', userType: string) =>
    trackEvent('login', {
      category: 'authentication',
      label: method,
      user_type: userType
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
      category: 'subscription'
    }),
    
  startTrial: (plan: string) =>
    trackEvent('start_trial', {
      category: 'subscription',
      label: plan,
      plan_name: plan,
      user_type: 'trial'
    }),
    
  subscribe: (plan: string, value: number) =>
    trackEvent('subscribe', {
      category: 'subscription',
      label: plan,
      value: value,
      plan_name: plan,
      user_type: 'premium'
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
  startWorkout: (workoutType: string, workoutTitle: string, userType: string = 'free') =>
    trackEvent('start_workout', {
      category: 'feature_usage',
      label: workoutTitle,
      workout_type: workoutType,
      workout_title: workoutTitle,
      user_type: userType
    }),
    
  completeWorkout: (workoutType: string, duration: number, workoutTitle: string, userType: string = 'free') =>
    trackEvent('complete_workout', {
      category: 'feature_usage',
      label: workoutTitle,
      value: duration,
      workout_type: workoutType,
      workout_title: workoutTitle,
      duration: duration,
      user_type: userType
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
  viewKnowledgeBase: (article?: string, userType?: string) =>
    trackEvent('view_knowledge_base', {
      category: 'engagement',
      label: article,
      user_type: userType
    }),
    
  shareProgress: (platform: string, workoutType?: string) =>
    trackEvent('share_progress', {
      category: 'engagement',
      label: platform,
      workout_type: workoutType
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