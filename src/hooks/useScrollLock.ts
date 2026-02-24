import { useEffect } from "react";

/**
 * Hook para bloquear el scroll del body cuando un modal u overlay está abierto.
 *
 * @param isOpen - Estado boolean que indica si el modal está abierto
 */
export function useScrollLock(isOpen: boolean) {
  useEffect(() => {
    // Restaurado: No bloqueamos el scroll del body por petición del usuario
    // ya que el scroll interno del modal no funcionaba correctamente en móvil.
  }, [isOpen]);
}
