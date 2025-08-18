// 🚀 USE FEATURE FLAGS - SERVER ACTIONS PURE
// ==========================================
// Hook optimizado que usa Server Actions directamente (Next.js 15 best practice)

"use client";

import React, {
  useState,
  useEffect,
  useActionState,
  useOptimistic,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useTransition,
} from "react";
import {
  getAllFeatureFlagsAction,
  toggleFeatureFlagActionState,
} from "@/features/admin/feature-flags/server/actions";
import { FEATURE_FLAGS, type FeatureFlag } from "@/core/config/feature-flags";
import type { FeatureFlagDomain } from "@/features/admin/feature-flags/types";

// 🎯 Context para compartir estado entre componentes
interface FeatureFlagsContextType {
  flags: FeatureFlagDomain[];
  isEnabled: (flagKey: FeatureFlag) => boolean;
  toggleFlag: (flagKey: string) => void;
  isPending: boolean;
  isLoading: boolean;
  error: string | null;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

// 🌐 Provider con Server Actions
export function FeatureFlagsServerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [flags, setFlags] = useState<FeatureFlagDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⚡ useTransition for optimistic updates (React 19)
  const [isPendingTransition, startTransition] = useTransition();

  // ⚡ useActionState para toggle (React 19)
  const [actionState, formAction, isPending] = useActionState(
    toggleFeatureFlagActionState,
    null
  );

  // 🔄 useOptimistic para UI instantánea (React 19)
  const [optimisticFlags, setOptimisticFlags] = useOptimistic(
    flags,
    (currentFlags, optimisticUpdate: { flagKey: string; enabled: boolean }) => {
      return currentFlags.map((flag) =>
        flag.key === optimisticUpdate.flagKey
          ? { ...flag, enabled: optimisticUpdate.enabled }
          : flag
      );
    }
  );

  // 🌐 Cargar flags desde Server Action
  const loadFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ Server Action directo - sin fetch!
      const result = await getAllFeatureFlagsAction();

      if (result.success && result.data) {
        setFlags(result.data as FeatureFlagDomain[]);
      } else {
        // Fallback a configuración estática
        const defaultFlags = Object.entries(FEATURE_FLAGS).map(
          ([key, enabled]) => ({
            id: key,
            key,
            name: key,
            enabled,
            category: "core",
            version: "1.0.0",
            hasPrismaModels: false,
            dependencies: [],
            conflicts: [],
            rolloutPercentage: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        ) as FeatureFlagDomain[];

        setFlags(defaultFlags);
      }
    } catch (err) {
      console.error("Error loading feature flags:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar feature flags"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Verificar si una feature está habilitada
  const isEnabled = useCallback(
    (flagKey: FeatureFlag): boolean => {
      const flag = optimisticFlags.find((f) => f.key === flagKey);
      return flag?.enabled ?? FEATURE_FLAGS[flagKey] ?? false;
    },
    [optimisticFlags]
  );

  // 🔄 Toggle con optimistic UI (React 19)
  const toggleFlag = useCallback(
    (flagKey: string) => {
      const currentFlag = flags.find((f) => f.key === flagKey);
      if (!currentFlag) return;

      // ⚡ Actualización optimista instantánea - WRAPPED IN TRANSITION
      startTransition(() => {
        setOptimisticFlags({
          flagKey,
          enabled: !currentFlag.enabled,
        });
      });

      // 🚀 Server Action en background
      const formData = new FormData();
      formData.append("flagKey", flagKey);
      formAction(formData);

      // 📡 Notificar otras pestañas inmediatamente
      try {
        const broadcastChannel = new BroadcastChannel("feature-flags-sync");
        broadcastChannel.postMessage({
          type: "FEATURE_FLAGS_CHANGED",
          flagKey,
          timestamp: Date.now(),
        });
        broadcastChannel.close();
      } catch (error) {
        // BroadcastChannel no disponible en algunos entornos
        console.debug("BroadcastChannel not available:", error);
      }
    },
    [flags, formAction, setOptimisticFlags, startTransition]
  );

  // 🔄 Cargar flags al montar
  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  // 🔄 Recargar cuando la acción se complete
  useEffect(() => {
    if (actionState?.success) {
      loadFlags(); // Sincronizar estado real
    }
  }, [actionState, loadFlags]);

  // 🔄 Auto-refresh cuando regresa el foco (detecta cambios externos)
  useEffect(() => {
    const handleFocus = () => {
      loadFlags();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadFlags();
      }
    };

    // Escuchar focus de ventana y visibility change
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadFlags]);

  // 📡 Broadcasting entre pestañas para sincronización instantánea
  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("feature-flags-sync");

    // Escuchar cambios de otras pestañas
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === "FEATURE_FLAGS_CHANGED") {
        loadFlags(); // Recargar inmediatamente
      }
    };

    broadcastChannel.addEventListener("message", handleBroadcast);

    return () => {
      broadcastChannel.removeEventListener("message", handleBroadcast);
      broadcastChannel.close();
    };
  }, [loadFlags]);

  const value: FeatureFlagsContextType = {
    flags: optimisticFlags,
    isEnabled,
    toggleFlag,
    isPending: isPending || isPendingTransition,
    isLoading,
    error,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// 🪝 Hook para usar feature flags
export function useFeatureFlagsServer(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlagsServer must be used within FeatureFlagsServerProvider"
    );
  }
  return context;
}

// 🎯 Hook simple para solo verificar flags
export function useIsEnabled(): (flagKey: FeatureFlag) => boolean {
  const { isEnabled } = useFeatureFlagsServer();
  return isEnabled;
}

// 🔄 Hook para toggle flags
export function useToggleFlag(): (flagKey: string) => void {
  const { toggleFlag } = useFeatureFlagsServer();
  return toggleFlag;
}
