import { useEffect, useState } from "react";
import { useToast } from "./../../hooks/useToast";
import posthog from "posthog-js";

// Extender la interfaz window para soportar beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PwaInstallPrompt() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Verificar si ya estamos en standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      return; // Ya está instalada, no hacemos nada
    }

    // 2. Verificar si ya se le ha mostrado recientemente (últimos 14 días)
    const lastPrompted = localStorage.getItem("pwa_install_prompt_date");
    if (lastPrompted) {
      const daysSincePrompt = (Date.now() - parseInt(lastPrompted)) / (1000 * 60 * 60 * 24);
      if (daysSincePrompt < 14) {
        return; // Esperamos más tiempo antes de volver a preguntar
      }
    }

    // 3. Manejar iOS Safari específicamente
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIos) {
      // Retrasar el prompt en iOS para no agobiar en la carga inicial
      const iosTimer = setTimeout(() => {
        posthog.capture("pwa_install_prompt_shown", { platform: "ios" });
        toast(
          "Instala Fittwiz: Toca el botón de Compartir y luego 'Añadir a pantalla de inicio'.",
          "info",
          {
            label: "Entendido",
            onClick: () => {
              posthog.capture("pwa_install_dismissed", { platform: "ios" });
              localStorage.setItem("pwa_install_prompt_date", Date.now().toString());
            },
          }
        );
      }, 10000); // 10 segundos de retraso
      return () => clearTimeout(iosTimer);
    }

    // 4. Manejar navegadores que soportan BeforeInstallPromptEvent (Android/Chrome/Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Guardar el evento para dispararlo más tarde
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Mostrar el toast
      posthog.capture("pwa_install_prompt_shown", { platform: "supported_browser" });
      
      const timeoutId = setTimeout(() => {
        toast("Instala Fittwiz para una mejor experiencia y acceso offline.", "info", {
          label: "Instalar",
          onClick: async () => {
             // Limpiar el estado almacenado
             setDeferredPrompt(null);
             localStorage.setItem("pwa_install_prompt_date", Date.now().toString());
             
             if (!promptEvent) return;
             
             // Mostrar el diálogo nativo
             await promptEvent.prompt();
             
             // Esperar a que el usuario responda
             const { outcome } = await promptEvent.userChoice;
             if (outcome === "accepted") {
               posthog.capture("pwa_install_accepted", { platform: "supported_browser" });
             } else {
               posthog.capture("pwa_install_dismissed", { platform: "supported_browser" });
             }
          },
        });
      }, 5000); // 5 segundos de retraso para no interferir con la carga 
      
      return () => clearTimeout(timeoutId);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [toast]);

  return null; // Este componente no renderiza nada en el DOM directamente
}
