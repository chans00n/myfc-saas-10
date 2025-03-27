"use client"

import { CookieConsentProvider } from '@/contexts/CookieConsentProvider'
import { CookieConsentBanner } from '@/components/cookie-consent/CookieConsentBanner'
import { Analytics } from '@/components/Analytics'
import { CrispWrapper } from '@/components/CrispWrapper'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <CrispWrapper>
        {children}
        <Analytics />
        <CookieConsentBanner />
      </CrispWrapper>
    </CookieConsentProvider>
  )
} 