import { logEvent as firebaseLogEvent, setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Inicializar/Configurar Analytics
 * @param {boolean} consentGiven - Si el usuario ha dado consentimiento
 */
export const initGA = (consentGiven) => {
  if (analytics) {
    setAnalyticsCollectionEnabled(analytics, consentGiven);
    if (consentGiven) {
      console.log('Firebase Analytics enabled');
    }
  }
};

/**
 * Registrar vista de página
 */
export const logPageView = () => {
  if (analytics) {
    try {
      firebaseLogEvent(analytics, 'page_view', {
        page_path: window.location.pathname
      });
    } catch (e) {
      console.warn('Error logging page view:', e);
    }
  }
};

/**
 * Registrar evento personalizado
 * @param {string} category - Categoría del evento (ej. 'Routine')
 * @param {string} action - Acción realizada (ej. 'Generated')
 * @param {string} label - Etiqueta opcional (ej. 'Leg Day')
 */
export const logEvent = (category, action, label) => {
  if (analytics) {
    try {
      firebaseLogEvent(analytics, action, {
        event_category: category,
        event_label: label
      });
    } catch (e) {
      console.warn('Error logging event:', e);
    }
  }
};
