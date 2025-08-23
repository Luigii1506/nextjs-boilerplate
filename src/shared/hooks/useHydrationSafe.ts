/**
 * 🔄 HYDRATION SAFE HOOKS
 * =======================
 *
 * Hooks para evitar errores de hidratación entre servidor y cliente.
 * Garantiza valores consistentes durante SSR y CSR.
 *
 * Enterprise: 2025-01-17 - SSR/CSR compatibility
 */

"use client";

import { useState, useEffect, useId } from "react";

/**
 * Hook para evitar errores de hidratación con valores que cambian
 * @param clientValue - Valor a usar en el cliente
 * @param serverValue - Valor a usar en el servidor (default: null)
 */
export function useHydrationSafe<T>(
  clientValue: T,
  serverValue: T | null = null
): T | null {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? clientValue : serverValue;
}

/**
 * Hook para generar IDs únicos compatibles con SSR
 * @param prefix - Prefijo para el ID
 */
export function useIsomorphicId(prefix: string = "id"): string {
  const reactId = useId();
  return `${prefix}-${reactId}`;
}

/**
 * Hook que devuelve true solo después de la hidratación
 * Útil para componentes que solo deben renderizarse en el cliente
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook para timestamps seguros durante SSR
 * @param fallback - Valor por defecto para el servidor
 */
export function useHydrationSafeTimestamp(fallback: number = 0): number {
  const timestamp = useHydrationSafe(Date.now(), fallback);
  return timestamp ?? fallback;
}

/**
 * Hook para valores aleatorios seguros durante SSR
 * @param fallback - Valor por defecto para el servidor
 */
export function useHydrationSafeRandom(fallback: string = "server"): string {
  const randomValue = useHydrationSafe(
    Math.random().toString(36).substr(2, 9),
    fallback
  );
  return randomValue ?? fallback;
}
