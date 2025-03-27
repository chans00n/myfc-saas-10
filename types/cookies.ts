export type CookieCategory = 'essential' | 'analytics' | 'marketing' | 'preferences';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: string;
}

export interface CookieConsentContextType {
  consent: CookieConsent;
  updateConsent: (category: CookieCategory, value: boolean) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  showSettings: () => void;
}

export const DEFAULT_CONSENT: CookieConsent = {
  essential: true, // Always true
  analytics: false,
  marketing: false,
  preferences: true,
  timestamp: new Date().toISOString(),
};

export const COOKIE_CATEGORIES = {
  essential: {
    name: 'Essential',
    description: 'Required for the website to function properly',
    required: true,
    cookies: ['session', 'csrf', 'supabase-auth'],
  },
  analytics: {
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website',
    required: false,
    cookies: ['_ga', '_gid', '_ga_*'],
  },
  marketing: {
    name: 'Marketing',
    description: 'Used for marketing and personalization',
    required: false,
    cookies: ['_fbp', '_pin_unauth'],
  },
  preferences: {
    name: 'Preferences',
    description: 'Remember your settings and preferences',
    required: false,
    cookies: ['theme', 'language'],
  },
} as const; 