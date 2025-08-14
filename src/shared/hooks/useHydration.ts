"use client";

import { useEffect, useState } from "react";

/**
 * Hook que detecta cuando la aplicación ha completado la hidratación
 *
 * @returns {boolean} true cuando la aplicación está completamente hidratada
 */
export function useHydration(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Este effect solo se ejecuta en el cliente después de la hidratación
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * Hook más avanzado que también detecta el estado de carga
 * de recursos específicos como feature flags
 *
 * @param dependencies - Array de booleanos que indican si las dependencias están listas
 * @returns {object} Estado detallado de hidratación
 */
export function useHydrationWithDependencies(dependencies: boolean[] = []): {
  isHydrated: boolean;
  isReady: boolean;
  isLoading: boolean;
} {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const allDependenciesReady =
    dependencies.length === 0 || dependencies.every(Boolean);
  const isReady = isHydrated && allDependenciesReady;
  const isLoading = !isReady;

  return {
    isHydrated,
    isReady,
    isLoading,
  };
}

/**
 * Componente wrapper que solo renderiza children después de la hidratación
 *
 * @example
 * ```tsx
 * <HydrationBoundary fallback={<Skeleton />}>
 *   <ClientDependentComponent />
 * </HydrationBoundary>
 * ```
 */
interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationBoundary({
  children,
  fallback = null,
}: HydrationBoundaryProps) {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return fallback;
  }

  return children;
}
