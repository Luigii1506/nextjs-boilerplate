/**
 * 🔄 AUTH CACHE INVALIDATION - TANSTACK QUERY UTILS
 * =================================================
 *
 * Utilidades para invalidar cache de autenticación cuando cambian roles.
 * Permisos reactivos instantáneos para mejor UX.
 *
 * Enterprise: 2025-01-17 - Reactive permissions system
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { AUTH_QUERY_KEYS } from "./useAuthQuery";

/**
 * 🔄 USE AUTH INVALIDATION
 *
 * Hook para invalidar cache de autenticación desde cualquier parte de la app.
 * Útil cuando se cambian roles desde admin panel.
 */
export function useAuthInvalidation() {
  const queryClient = useQueryClient();

  // 🔄 Invalidar toda la cache de auth (forzar re-fetch)
  const invalidateAuthCache = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: AUTH_QUERY_KEYS.all,
    });
  }, [queryClient]);

  // 👤 Invalidar sesión específica (más targeted)
  const invalidateSession = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: AUTH_QUERY_KEYS.session(),
    });
  }, [queryClient]);

  // 🗑️ Limpiar toda la cache de auth (logout, errores críticos)
  const clearAuthCache = useCallback(() => {
    queryClient.removeQueries({
      queryKey: AUTH_QUERY_KEYS.all,
    });
  }, [queryClient]);

  // ⚡ Refresh inmediato de auth (refetch + notify)
  const forceAuthRefresh = useCallback(async () => {
    await queryClient.refetchQueries({
      queryKey: AUTH_QUERY_KEYS.session(),
    });
  }, [queryClient]);

  return {
    invalidateAuthCache,
    invalidateSession,
    clearAuthCache,
    forceAuthRefresh,
  };
}

/**
 * 🎯 Server-side helper para usar en Server Actions
 *
 * Función que se puede llamar desde Server Actions para invalidar cache.
 * Requiere que el cliente implemente la invalidación.
 */
export const createAuthInvalidationTrigger = () => {
  return {
    // 🔔 Trigger para invalidación de auth después de cambio de rol
    triggerAuthInvalidation: () => {
      // En una implementación real, esto podría:
      // 1. Usar WebSockets/SSE para notify al cliente
      // 2. Usar localStorage flags que el cliente detecte
      // 3. Usar broadcasting API

      // Por ahora, confiamos en el background refresh (30s)
      // Pero podríamos mejorarlo con:
      if (typeof window !== "undefined") {
        // Usar localStorage como señal
        localStorage.setItem("auth_invalidate_trigger", Date.now().toString());
      }
    },
  };
};

/**
 * 🎧 USE AUTH INVALIDATION LISTENER
 *
 * Hook que escucha triggers de invalidación de auth en TIEMPO REAL.
 * Soporta BroadcastChannel, localStorage y custom events.
 */
export function useAuthInvalidationListener() {
  const { invalidateAuthCache } = useAuthInvalidation();

  // 🎯 Auto-start listening on mount
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    // 🌐 1. BroadcastChannel listener (múltiples pestañas)
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("auth_cache_invalidation");

      const handleBroadcast = (event: MessageEvent) => {
        if (event.data?.type === "INVALIDATE_AUTH") {
          console.log("🔔 Received auth invalidation via BroadcastChannel");
          invalidateAuthCache();
        }
      };

      channel.addEventListener("message", handleBroadcast);

      cleanupFunctions.push(() => {
        channel.removeEventListener("message", handleBroadcast);
        channel.close();
      });
    }

    // 🔔 2. localStorage listener (fallback)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth_invalidate_trigger" && e.newValue) {
        console.log("🔔 Received auth invalidation via localStorage");
        invalidateAuthCache();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    cleanupFunctions.push(() => {
      window.removeEventListener("storage", handleStorageChange);
    });

    // 📊 3. Custom event listener (misma pestaña)
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log(
        "🔔 Received auth invalidation via CustomEvent",
        customEvent.detail
      );
      invalidateAuthCache();
    };

    window.addEventListener("auth:invalidate", handleCustomEvent);
    cleanupFunctions.push(() => {
      window.removeEventListener("auth:invalidate", handleCustomEvent);
    });

    // 🧹 Cleanup function
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [invalidateAuthCache]);

  // 🎯 Manual trigger for testing
  const triggerTestInvalidation = useCallback(() => {
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("auth_cache_invalidation");
      channel.postMessage({
        type: "INVALIDATE_AUTH",
        timestamp: Date.now(),
        source: "manual_test",
      });
      channel.close();
    }
  }, []);

  return {
    triggerTestInvalidation, // Para testing
  };
}
