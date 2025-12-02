import ReactGA from 'react-ga4';

/**
 * Inicializar Google Analytics
 * @param {boolean} consentGiven - Si el usuario ha dado consentimiento
 */
export const initGA = (consentGiven) => {
  if (!consentGiven) return;
  
  const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
  
  if (MEASUREMENT_ID) {
    ReactGA.initialize(MEASUREMENT_ID, {
      gaOptions: {
        anonymizeIp: true, // RGPD compliance
      }
    });
  } else {
    console.warn('Google Analytics Measurement ID not found');
  }
};

/**
 * Registrar vista de página
 */
export const logPageView = () => {
  // Solo loguear si GA está inicializado (verificado internamente por react-ga4)
  try {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  } catch (e) {
    // Ignorar errores si GA no está inicializado
  }
};

/**
 * Registrar evento personalizado
 * @param {string} category - Categoría del evento (ej. 'Routine')
 * @param {string} action - Acción realizada (ej. 'Generated')
 * @param {string} label - Etiqueta opcional (ej. 'Leg Day')
 */
export const logEvent = (category, action, label) => {
  try {
    ReactGA.event({
      category,
      action,
      label,
    });
  } catch (e) {
    // Ignorar errores
  }
};
