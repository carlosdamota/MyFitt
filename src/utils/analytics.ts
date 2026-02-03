import { logEvent as firebaseLogEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { analytics } from "../config/firebase";

/**
 * Inicializar/Configurar Analytics
 */
export const initGA = (consentGiven: boolean): void => {
  if (analytics) {
    setAnalyticsCollectionEnabled(analytics, consentGiven);
    if (consentGiven) {
      console.log("Firebase Analytics enabled");
    }
  }
};

/**
 * Registrar vista de página
 */
export const logPageView = (): void => {
  if (analytics) {
    try {
      firebaseLogEvent(analytics, "page_view", {
        page_path: window.location.pathname,
      });
    } catch (e) {
      console.warn("Error logging page view:", e);
    }
  }
};

/**
 * Registrar evento personalizado
 */
export const logEvent = (category: string, action: string, label?: string): void => {
  if (analytics) {
    try {
      firebaseLogEvent(analytics, action, {
        event_category: category,
        event_label: label,
      });
    } catch (e) {
      console.warn("Error logging event:", e);
    }
  }
};
