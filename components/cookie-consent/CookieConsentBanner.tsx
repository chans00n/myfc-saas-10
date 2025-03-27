"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/contexts/CookieConsentProvider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { COOKIE_CATEGORIES, CookieCategory } from '@/types/cookies';

export function CookieConsentBanner() {
  const { consent, updateConsent, acceptAll, rejectAll } = useCookieConsent();
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show banner if no consent is stored
    const hasConsent = localStorage.getItem('myfc-cookie-consent');
    if (!hasConsent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    setShowBanner(false);
    setShowModal(false);
    localStorage.setItem('myfc-cookie-consent', JSON.stringify(consent));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Desktop version */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl mx-auto px-4 hidden md:block">
        <div className="bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-100/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 border rounded-lg shadow-lg p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1 text-sm text-neutral-900 dark:text-neutral-200">
              <p>
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                <Link href="/legal/cookie-policy" className="underline underline-offset-4 hover:text-primary">
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowModal(true)}>
                Cookie Settings
              </Button>
              <Button variant="secondary" size="sm" onClick={handleRejectAll}>
                Reject All
              </Button>
              <Button size="sm" onClick={handleAcceptAll}>
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile version */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-100/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 border-t shadow-lg p-4">
          <div className="flex flex-col gap-4 max-w-lg mx-auto">
            <div className="flex-1 text-sm text-center text-neutral-900 dark:text-neutral-200">
              <p>
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.{' '}
                <Link href="/legal/cookie-policy" className="underline underline-offset-4 hover:text-primary">
                  Learn more
                </Link>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowModal(true)} className="w-full">
                Cookie Settings
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleRejectAll} className="flex-1">
                  Reject All
                </Button>
                <Button size="sm" onClick={handleAcceptAll} className="flex-1">
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[425px] bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur supports-[backdrop-filter]:bg-neutral-100/80 dark:supports-[backdrop-filter]:bg-neutral-900/80 border shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-200">Cookie Settings</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground text-neutral-900 dark:text-neutral-200">
              Customize your cookie preferences. Some cookies are necessary for the website to function properly.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            {(Object.entries(COOKIE_CATEGORIES) as [CookieCategory, typeof COOKIE_CATEGORIES[CookieCategory]][]).map(([key, category]) => (
              <div key={key} className="flex items-start gap-4 rounded-lg p-4 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={key} className="text-base font-medium leading-none text-neutral-900 dark:text-neutral-200">
                    {category.name}
                  </Label>
                  <p className="text-sm text-muted-foreground leading-relaxed text-neutral-900 dark:text-neutral-200">{category.description}</p>
                </div>
                <Switch
                  id={key}
                  checked={consent[key]}
                  onCheckedChange={(checked) => updateConsent(key, checked)}
                  disabled={category.required}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="default" onClick={handleSavePreferences} className="w-full sm:w-auto">
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 