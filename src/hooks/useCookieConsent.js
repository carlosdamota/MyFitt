import { useState, useEffect } from 'react';

/**
 * Hook para gestionar el consentimiento de cookies
 * @returns {object} { consent, updateConsent, hasResponded }
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState({
    essential: true, // Siempre true (Firebase Auth)
    analytics: false
  });
  const [hasResponded, setHasResponded] = useState(false);

  useEffect(() => {
    // Leer preferencia guardada en localStorage
    const savedConsent = localStorage.getItem('cookie_consent');
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent);
        setConsent(parsed);
        setHasResponded(true);
      } catch (e) {
        console.error('Error parsing cookie consent:', e);
      }
    }
  }, []);

  const updateConsent = (newConsent) => {
    const updatedConsent = {
      essential: true, // Siempre true
      analytics: newConsent.analytics
    };
    setConsent(updatedConsent);
    setHasResponded(true);
    localStorage.setItem('cookie_consent', JSON.stringify(updatedConsent));
  };

  const acceptAll = () => {
    updateConsent({ analytics: true });
  };

  const rejectAll = () => {
    updateConsent({ analytics: false });
  };

  return {
    consent,
    updateConsent,
    acceptAll,
    rejectAll,
    hasResponded
  };
};
