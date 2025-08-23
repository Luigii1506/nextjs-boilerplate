/**
 * 🔄 FILE UPLOAD HYDRATION-SAFE UTILITIES
 * =======================================
 *
 * Utilities específicas para evitar errores de hidratación en file uploads.
 * Wrappers seguros para valores dinámicos.
 */

"use client";

import {
  useIsomorphicId,
  useHydrationSafe,
} from "@/shared/hooks/useHydrationSafe";

/**
 * Hook para generar IDs de archivos temporales seguros
 */
export function useTempFileId(): string {
  return useIsomorphicId("temp-file");
}

/**
 * Hook para timestamps de archivos seguros
 */
export function useFileTimestamp(): string {
  const timestamp = useHydrationSafe(
    new Date().toISOString(),
    new Date(0).toISOString() // Epoch como fallback para SSR
  );
  return timestamp ?? new Date(0).toISOString();
}

/**
 * Hook para URLs de objeto seguros (solo en cliente)
 */
export function useObjectURL(file: File | null): string | null {
  const objectURL = useHydrationSafe(
    file ? URL.createObjectURL(file) : null,
    null // No URL en servidor
  );
  return objectURL;
}
