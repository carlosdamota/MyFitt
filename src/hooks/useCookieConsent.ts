import { useState, useEffect } from "react";
import type { CookieConsent } from "../types";

export interface UseCookieConsentReturn {
  consent: CookieConsent;
  updateConsent: (newConsent: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  hasResponded: boolean;
}

/**
 * Hook para gestionar el consentimiento de cookies
 */
export const useCookieConsent = (): UseCookieConsentReturn => {
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true, // Siempre true (Firebase Auth)
    analytics: false,
  });
  const [hasResponded, setHasResponded] = useState<boolean>(false);

  useEffect(() => {
    // Leer preferencia guardada en localStorage
    const savedConsent = localStorage.getItem("cookie_consent");
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsent;
        setConsent(parsed);
        setHasResponded(true);
      } catch (e) {
        console.error("Error parsing cookie consent:", e);
      }
    }
  }, []);

  const updateConsent = (newConsent: Partial<CookieConsent>): void => {
    const updatedConsent: CookieConsent = {
      essential: true, // Siempre true
      analytics: newConsent.analytics ?? consent.analytics,
    };
    setConsent(updatedConsent);
    setHasResponded(true);
    localStorage.setItem("cookie_consent", JSON.stringify(updatedConsent));
  };

  const acceptAll = (): void => {
    updateConsent({ analytics: true });
  };

  const rejectAll = (): void => {
    updateConsent({ analytics: false });
  };

  return {
    consent,
    updateConsent,
    acceptAll,
    rejectAll,
    hasResponded,
  };
};
