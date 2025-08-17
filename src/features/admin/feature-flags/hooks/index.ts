// 🪝 FEATURE FLAGS HOOKS
// ======================
// Hooks personalizados para el manejo de feature flags (React Compiler optimized)

import { useState, useEffect, useCallback, useRef } from "react";
import { useFeatureFlagsServer } from "@/shared/hooks/useFeatureFlagsServerActions";
import type { FeatureFlagCardData, FeatureFlagStats } from "../types";
import type { NotificationState } from "../utils";
import type { FeatureFlag, FeatureGroup } from "@/core/config/feature-flags";
import { filterFeatureFlags, groupByCategory } from "../utils";

// 🔧 Funciones auxiliares
const mapCategoryToGroup = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    module: "modules",
    ui: "ui",
    experimental: "experimental",
    core: "core",
    admin: "admin",
  };
  return categoryMap[category] || "core";
};

const calculateStats = (flags: FeatureFlagCardData[]): FeatureFlagStats => {
  return {
    totalFlags: flags.length,
    enabledFlags: flags.filter((f) => f.enabled).length,
    coreFlags: flags.filter((f) => f.category === "core").length,
    moduleFlags: flags.filter((f) => f.category === "modules").length,
    experimentalFlags: flags.filter((f) => f.category === "experimental")
      .length,
    uiFlags: flags.filter((f) => f.category === "ui").length,
    adminFlags: flags.filter((f) => f.category === "admin").length,
  };
};

// 🎯 Tipos para el hook principal
export interface FeatureFlagFilters {
  search: string;
  category: string;
  status: string;
}

export interface FeatureFlagAdminState {
  flags: FeatureFlagCardData[];
  filteredFlags: FeatureFlagCardData[];
  stats: FeatureFlagStats;
  groupedFlags: Record<string, FeatureFlagCardData[]>;
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  filters: FeatureFlagFilters;
  notification: NotificationState | null;
}

// 🪝 Hook principal para administración de feature flags
export const useFeatureFlagAdmin = () => {
  const {
    flags: optimisticFlags,
    toggleFlag,
    isLoading: hookLoading,
    error: hookError,
  } = useFeatureFlagsServer();

  // updateFlag is handled by useFeatureFlagsServer directly
  // const updateFlag = useCallback(async () => {}, []);
  const refresh = useCallback(async () => {
    // Refresh is handled internally by the Server Actions hook
  }, []);

  const [state, setState] = useState<FeatureFlagAdminState>({
    flags: [],
    filteredFlags: [],
    stats: {
      totalFlags: 0,
      enabledFlags: 0,
      coreFlags: 0,
      moduleFlags: 0,
      experimentalFlags: 0,
      uiFlags: 0,
      adminFlags: 0,
    },
    groupedFlags: {},
    isLoading: true,
    error: null,
    hasChanges: false,
    filters: {
      search: "",
      category: "all",
      status: "all",
    },
    notification: null,
  });

  // ⚡ Cargar datos iniciales (React Compiler will memoize)
  const loadData = useCallback(() => {
    try {
      // ✅ Usar datos del hook optimista - fuente única de verdad
      const flagsData = optimisticFlags;

      // Mapear a formato UI (ya está hecho en el hook base)
      const flags: FeatureFlagCardData[] = flagsData.map((flag) => ({
        id: flag.key as FeatureFlag,
        name: flag.name,
        description: flag.description || "",
        category: mapCategoryToGroup(flag.category) as FeatureGroup,
        enabled: flag.enabled,
        icon: "Package", // Se puede mejorar con metadata
        isPremium: false,
        dependencies: (flag.dependencies || []) as FeatureFlag[],
        lastModified: flag.updatedAt
          ? flag.updatedAt.toISOString()
          : new Date().toISOString(),
        modifiedBy: "Admin",
      }));

      // Aplicar filtros
      const filteredFlags = filterFeatureFlags(flags, state.filters);

      // Calcular estadísticas
      const stats = calculateStats(flags);

      // Agrupar por categoría
      const groupedFlags = groupByCategory(filteredFlags);

      setState((prev) => ({
        ...prev,
        flags,
        filteredFlags,
        stats,
        groupedFlags,
        isLoading: hookLoading,
        error: hookError,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Error cargando datos",
        isLoading: false,
      }));
    }
  }, [optimisticFlags, hookLoading, hookError, state.filters]);

  // ⚡ Efecto para cargar datos (optimized for React Compiler)
  useEffect(() => {
    loadData();
  }, [loadData]); // React Compiler will optimize these

  // ⚡ Actualizar filtros (React Compiler will memoize)
  const updateFilters = (newFilters: Partial<FeatureFlagFilters>) => {
    setState((prev) => {
      const filters = { ...prev.filters, ...newFilters };
      const filteredFlags = filterFeatureFlags(prev.flags, filters);
      const groupedFlags = groupByCategory(filteredFlags);

      return {
        ...prev,
        filters,
        filteredFlags,
        groupedFlags,
      };
    });
  };

  // ⚡ Mostrar notificación (React Compiler will memoize)
  const showNotification = useCallback(
    (type: NotificationState["type"], message: string) => {
      setState((prev) => ({ ...prev, notification: { type, message } }));
    },
    []
  );

  // ⚡ Toggle individual usando hook optimista (React Compiler will memoize)
  const handleToggle = useCallback(
    async (flagKey: string) => {
      try {
        // ✅ PURE OPTIMISTIC UI: Usar la función optimista directamente
        // Esto maneja optimistic state + server action automáticamente
        await toggleFlag(flagKey as FeatureFlag);
        showNotification("success", `Feature flag '${flagKey}' actualizado`);
      } catch (error) {
        showNotification("error", `Error al actualizar '${flagKey}'`);
        console.error("Error toggling flag:", error);
      }
    },
    [toggleFlag, showNotification]
  );

  // ⚡ Actualizar flag (React Compiler will memoize)
  const handleUpdate = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      // updateFlag is handled by useFeatureFlagsServer now
      loadData(); // Recargar datos
      showNotification("success", "Feature flag actualizado correctamente");
    } catch (error) {
      showNotification("error", "Error al actualizar feature flag");
      console.error("Error updating flag:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // ⚡ Recargar datos (React Compiler will memoize)
  const handleRefresh = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await refresh();
      loadData();
      showNotification("success", "Datos recargados correctamente");
    } catch (error) {
      showNotification("error", "Error al recargar datos");
      console.error("Error refreshing:", error);
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // ⚡ Limpiar filtros (React Compiler will memoize)
  const clearFilters = () => {
    updateFilters({
      search: "",
      category: "all",
      status: "all",
    });
  };

  return {
    ...state,
    actions: {
      updateFilters,
      showNotification,
      handleToggle,
      handleUpdate,
      handleRefresh,
      clearFilters,
      loadData,
    },
  };
};

// 🪝 Hook para estadísticas
export const useFeatureFlagStats = () => {
  const { flags: flagsData } = useFeatureFlagsServer();
  const getAllFlagsData = useCallback(() => flagsData, [flagsData]);
  const [stats, setStats] = useState<FeatureFlagStats>({
    totalFlags: 0,
    enabledFlags: 0,
    coreFlags: 0,
    moduleFlags: 0,
    experimentalFlags: 0,
    uiFlags: 0,
    adminFlags: 0,
  });

  const updateStats = useCallback(() => {
    const flagsData = getAllFlagsData();
    const flags: FeatureFlagCardData[] = flagsData.map((flag) => ({
      id: flag.key as FeatureFlag,
      name: flag.name,
      description: flag.description || "",
      category: mapCategoryToGroup(flag.category) as FeatureGroup,
      enabled: flag.enabled,
      icon: "Package",
      isPremium: false,
      dependencies: (flag.dependencies || []) as FeatureFlag[],
      lastModified: flag.updatedAt
        ? flag.updatedAt.toISOString()
        : new Date().toISOString(),
      modifiedBy: "Admin",
    }));

    setStats(calculateStats(flags));
  }, [getAllFlagsData]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  return stats;
};

// 🔔 Usar el sistema de notificaciones principal
// El sistema Sonner ya maneja todo esto automáticamente
// Si necesitas notificaciones aquí, importa: import { useNotifications } from "@/shared/hooks/useNotifications";
