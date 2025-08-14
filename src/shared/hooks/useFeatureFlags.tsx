// 🎛️ FEATURE FLAGS HOOK & CONTEXT
// ================================
// Hook React real para controlar feature flags dinámicamente

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { FEATURE_FLAGS, type FeatureFlag } from "@/core/config/feature-flags";

// 📊 Tipos para feature flags de BD
interface FeatureFlagData {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  category: string;
  version: string;
  hasPrismaModels: boolean;
  dependencies: string[];
  conflicts: string[];
  rolloutPercentage: number;
  createdAt?: string;
  updatedAt?: string;
}

type FeatureFlagOverrides = Partial<Record<string, boolean>>;

interface FeatureFlagsContextType {
  // Verificar si una feature está habilitada
  isEnabled: (flag: string) => boolean;

  // Alternar una feature (solo admin)
  toggle: (flag: string) => Promise<void>;

  // Actualizar una feature flag
  updateFlag: (
    flagKey: string,
    data: { enabled?: boolean; name?: string; description?: string }
  ) => Promise<void>;

  // Obtener todas las flags y su estado
  getAllFlags: () => Record<string, boolean>;

  // Obtener datos completos de flags
  getAllFlagsData: () => FeatureFlagData[];

  // Recargar flags desde el servidor
  refresh: () => Promise<void>;

  // Estado de carga
  isLoading: boolean;

  // Error state
  error: string | null;
}

// 🧠 Contexto
// 📝 NOTA: Este provider funciona en modo híbrido:
// - En rutas autenticadas (admin): usa flags dinámicas de la API
// - En rutas públicas: usa flags estáticas como fallback (sin errores)
const FeatureFlagsContext = createContext<FeatureFlagsContextType | null>(null);

// 🎯 Hook principal
export function useFeatureFlags(): FeatureFlagsContextType {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error(
      "useFeatureFlags debe usarse dentro de FeatureFlagsProvider"
    );
  }
  return context;
}

// 🔧 Hook simplificado para una sola flag
export function useFeatureFlag(flag: string): boolean {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flag);
}

// 📦 Provider Component
interface FeatureFlagsProviderProps {
  children: ReactNode;
}

export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [flagsData, setFlagsData] = useState<FeatureFlagData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌐 Cargar flags desde la API
  const loadFlags = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/feature-flags");
      if (!response.ok) {
        // Si es 401 (no autorizado), fallar silenciosamente en rutas públicas
        if (response.status === 401) {
          // No mostrar error en consola para 401, es normal en rutas públicas
          setError(null);
        } else {
          // Para otros errores (403, 500, etc.), sí mostrar el error
          const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
          console.error("Error loading feature flags:", errorMsg);
          setError(errorMsg);
        }

        // En cualquier caso, usar flags por defecto
        const defaultFlags = Object.entries(FEATURE_FLAGS).map(
          ([key, enabled]) => ({
            key,
            name: key,
            enabled,
            category: "core",
            version: "1.0.0",
            hasPrismaModels: false,
            dependencies: [],
            conflicts: [],
            rolloutPercentage: 100,
          })
        );
        setFlagsData(defaultFlags);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setFlagsData(data.flags);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      // Solo logear errores que no sean de autenticación
      if (err instanceof Error && !err.message.includes("401")) {
        console.error("Error loading feature flags:", err);
        setError(err.message);
      } else {
        setError(null);
      }

      // Fallback a flags por defecto si falla la API
      const defaultFlags = Object.entries(FEATURE_FLAGS).map(
        ([key, enabled]) => ({
          key,
          name: key,
          enabled,
          category: "core",
          version: "1.0.0",
          hasPrismaModels: false,
          dependencies: [],
          conflicts: [],
          rolloutPercentage: 100,
        })
      );
      setFlagsData(defaultFlags);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚀 Cargar al inicio
  useEffect(() => {
    loadFlags();
  }, []);

  // 🔍 Verificar si una feature está habilitada
  const isEnabled = (flagKey: string): boolean => {
    const flag = flagsData.find((f) => f.key === flagKey);
    if (flag) {
      return flag.enabled;
    }

    // Fallback a configuración estática
    return FEATURE_FLAGS[flagKey as FeatureFlag] || false;
  };

  // 🔄 Alternar una feature
  const toggle = async (flagKey: string): Promise<void> => {
    try {
      const currentFlag = flagsData.find((f) => f.key === flagKey);
      if (!currentFlag) return;

      const response = await fetch("/api/feature-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagKey: flagKey,
          enabled: !currentFlag.enabled,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        // Actualizar estado local
        setFlagsData((prev) =>
          prev.map((flag) =>
            flag.key === flagKey
              ? { ...flag, enabled: data.flag.enabled }
              : flag
          )
        );
      }
    } catch (err) {
      console.error("Error toggling feature flag:", err);
      setError(
        err instanceof Error ? err.message : "Error al cambiar feature flag"
      );
    }
  };

  // 🔧 Actualizar feature flag
  const updateFlag = async (
    flagKey: string,
    data: { enabled?: boolean; name?: string; description?: string }
  ): Promise<void> => {
    try {
      const response = await fetch("/api/feature-flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagKey, ...data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        // Actualizar estado local
        setFlagsData((prev) =>
          prev.map((flag) =>
            flag.key === flagKey ? { ...flag, ...result.flag } : flag
          )
        );
      }
    } catch (err) {
      console.error("Error updating feature flag:", err);
      setError(
        err instanceof Error ? err.message : "Error al actualizar feature flag"
      );
    }
  };

  // 📋 Obtener todas las flags como boolean map
  const getAllFlags = (): Record<string, boolean> => {
    const result: Record<string, boolean> = {};
    flagsData.forEach((flag) => {
      result[flag.key] = flag.enabled;
    });
    return result;
  };

  // 📊 Obtener datos completos de flags
  const getAllFlagsData = (): FeatureFlagData[] => {
    return flagsData;
  };

  // 🔄 Recargar flags
  const refresh = async (): Promise<void> => {
    await loadFlags();
  };

  const value: FeatureFlagsContextType = {
    isEnabled,
    toggle,
    updateFlag,
    getAllFlags,
    getAllFlagsData,
    refresh,
    isLoading,
    error,
  };

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// 🛡️ HOC para proteger componentes con feature flags
export function withFeatureFlag<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredFlag: FeatureFlag,
  fallback?: React.ComponentType<P> | React.ReactNode
) {
  return function FeatureFlagWrapper(props: P) {
    const isEnabled = useFeatureFlag(requiredFlag);

    if (!isEnabled) {
      if (fallback) {
        if (React.isValidElement(fallback)) {
          return fallback as React.ReactElement;
        }
        const FallbackComponent = fallback as React.ComponentType<P>;
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// 🧩 Componente para renderizado condicional
interface FeatureGateProps {
  flag: FeatureFlag;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({
  flag,
  children,
  fallback = null,
}: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);

  return isEnabled ? <>{children}</> : <>{fallback}</>;
}
