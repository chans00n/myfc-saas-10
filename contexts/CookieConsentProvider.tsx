"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CookieConsent, CookieConsentContextType, CookieCategory, DEFAULT_CONSENT } from '@/types/cookies';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_STORAGE_KEY = 'myfc-cookie-consent';

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent>(DEFAULT_CONSENT);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Load saved consent from localStorage
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (savedConsent) {
      setConsent(JSON.parse(savedConsent));
    }
  }, []);

  const updateConsent = (category: CookieCategory, value: boolean) => {
    const newConsent = {
      ...consent,
      [category]: value,
      timestamp: new Date().toISOString(),
    };
    setConsent(newConsent);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
  };

  const acceptAll = () => {
    const newConsent = {
      ...consent,
      analytics: true,
      marketing: true,
      preferences: true,
      timestamp: new Date().toISOString(),
    };
    setConsent(newConsent);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
  };

  const rejectAll = () => {
    const newConsent = {
      ...DEFAULT_CONSENT,
      timestamp: new Date().toISOString(),
    };
    setConsent(newConsent);
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(newConsent));
  };

  const showSettings = () => {
    setShowModal(true);
  };

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        updateConsent,
        acceptAll,
        rejectAll,
        showSettings,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
} 