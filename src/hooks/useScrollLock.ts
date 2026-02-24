import { useEffect } from "react";

/**
 * Hook para bloquear el scroll del body cuando un modal u overlay está abierto.
 *
 * @param isOpen - Estado boolean que indica si el modal está abierto
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function en caso de que el componente se desmonte mientras está abierto
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);
}
