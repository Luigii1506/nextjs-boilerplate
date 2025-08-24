/**
 * ⚙️ SETTINGS QUERY HOOK - CONFIGURATION MODULE
 * ===============================================
 *
 * Hook simple para configuraciones - No necesita toda la complejidad enterprise
 * Solo CRUD básico para settings management
 *
 * Simple: 2025-01-18 - Appropriate complexity for config module
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { useNotifications } from "@/shared/hooks/useNotifications";
import {
  getSettingsByCategoryAction,
  getSettingsStatsAction,
  updateSettingAction,
} from "../actions";
import { SETTINGS_DEFAULTS } from "../constants";
import type {
  SettingCategory,
  SettingsGroup,
  SettingWithValue,
  SettingEnvironment,
  SettingsOperationResult,
} from "../types";

// 🎯 Query keys
const SETTINGS_QUERY_KEYS = {
  all: ["settings"] as const,
  category: (category: SettingCategory) =>
    ["settings", "category", category] as const,
  stats: () => ["settings", "stats"] as const,
  environment: (env: SettingEnvironment) => ["settings", "env", env] as const,
} as const;

// 🎯 Async functions using server actions
async function fetchSettings(
  category: SettingCategory
): Promise<SettingWithValue[]> {
  const result = await getSettingsByCategoryAction(category);

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch settings");
  }

  return result.data || [];
}

async function fetchSettingsStats(): Promise<{
  totalSettings: number;
  configuredSettings: number;
  healthScore: number;
  lastUpdated: Date;
}> {
  const result = await getSettingsStatsAction();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch stats");
  }

  return result.data!;
}

async function updateSetting(
  key: string,
  value: unknown
): Promise<SettingsOperationResult<SettingWithValue>> {
  const result = await updateSettingAction(key, value);

  if (!result.success) {
    throw new Error(result.error || "Failed to update setting");
  }

  return result.data!;
}

// 🎯 Settings categories configuration (moved from screen)
export const SETTINGS_CATEGORIES: SettingsGroup[] = [
  {
    category: "app",
    label: "Application",
    description: "General app configuration and branding",
    icon: "Settings",
    order: 1,
    permissions: ["settings.view", "settings.edit.app"],
    sections: [
      {
        id: "general",
        name: "general",
        label: "General Settings",
        description: "Basic application configuration",
        settings: ["app.name", "app.description", "app.version"],
        permissions: ["settings.edit.app"],
        order: 1,
      },
    ],
  },
  {
    category: "auth",
    label: "Authentication",
    description: "User authentication and security settings",
    icon: "Shield",
    order: 2,
    permissions: ["settings.view", "settings.edit.auth"],
    sections: [
      {
        id: "providers",
        name: "providers",
        label: "OAuth Providers",
        description: "Configure social login providers",
        settings: ["auth.google", "auth.github"],
        permissions: ["settings.edit.auth"],
        order: 1,
      },
    ],
  },
  {
    category: "database",
    label: "Database",
    description: "Database connections and optimization",
    icon: "Database",
    order: 3,
    permissions: ["settings.view", "settings.edit.database"],
    sections: [
      {
        id: "connection",
        name: "connection",
        label: "Database Connections",
        description: "Configure database connections and pooling",
        settings: ["db.primaryConnection"],
        permissions: ["settings.edit.database"],
        order: 1,
      },
    ],
  },
];

// 🎯 Hook return interface
interface UseSettingsQueryReturn {
  // Settings data
  settings: SettingWithValue[];
  settingsMap: Record<string, SettingWithValue>;

  // Categories and navigation
  categories: SettingsGroup[];

  // Stats
  stats: {
    totalSettings: number;
    configuredSettings: number;
    healthScore: number;
    lastUpdated?: Date;
  };

  // Loading states
  isLoading: boolean;
  isUpdating: boolean;

  // Actions
  updateSetting: (key: string, value: unknown) => Promise<void>;
  refreshSettings: () => void;

  // Utilities
  getSetting: (key: string) => SettingWithValue | undefined;
  getSettingValue: (key: string) => unknown;
  hasPermission: (permission: string) => boolean;
}

/**
 * ⚙️ USE SETTINGS QUERY HOOK
 *
 * Hook simple para manejo de configuraciones - Apropiado para módulo config
 * No necesita toda la complejidad de módulos core como Users/Audit
 */
export function useSettingsQuery(
  initialCategory: SettingCategory = "app",
  {
    userPermissions = [],
  }: {
    userPermissions?: string[];
  } = {}
): UseSettingsQueryReturn {
  const queryClient = useQueryClient();
  const { success: notifySuccess, error: notifyError } = useNotifications();

  // 🔍 Fetch settings for category
  const {
    data: settings = [],
    isLoading,
    refetch: refreshSettings,
  } = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.category(initialCategory),
    queryFn: () => fetchSettings(initialCategory),
    staleTime: SETTINGS_DEFAULTS.QUERY_STALE_TIME,
    gcTime: SETTINGS_DEFAULTS.QUERY_GC_TIME,
  });

  // 📊 Fetch stats
  const { data: statsData } = useQuery({
    queryKey: SETTINGS_QUERY_KEYS.stats(),
    queryFn: fetchSettingsStats,
    staleTime: SETTINGS_DEFAULTS.STATS_STALE_TIME,
  });

  // 🔧 Update setting mutation
  const updateMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      updateSetting(key, value),
    onSuccess: (result, variables) => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: SETTINGS_QUERY_KEYS.all,
      });

      notifySuccess(result.message || `Setting ${variables.key} updated`);
    },
    onError: (error) => {
      notifyError(
        error instanceof Error ? error.message : "Failed to update setting"
      );
    },
  });

  // 🎯 Memoized computed values
  const settingsMap = useMemo(
    () =>
      settings.reduce((acc, setting) => {
        acc[setting.key] = setting;
        return acc;
      }, {} as Record<string, SettingWithValue>),
    [settings]
  );

  const stats = useMemo(
    () =>
      statsData || {
        totalSettings: 0,
        configuredSettings: 0,
        healthScore: 0,
      },
    [statsData]
  );

  // 🔧 Action handlers
  const handleUpdateSetting = useCallback(
    async (key: string, value: unknown) => {
      try {
        await updateMutation.mutateAsync({ key, value });
      } catch (error) {
        // Error already handled in mutation
        console.error("Update setting failed:", error);
      }
    },
    [updateMutation]
  );

  // 🛠️ Utility functions
  const getSetting = useCallback(
    (key: string) => settingsMap[key],
    [settingsMap]
  );

  const getSettingValue = useCallback(
    (key: string) => settingsMap[key]?.value,
    [settingsMap]
  );

  const hasPermission = useCallback(
    (permission: string) => userPermissions.includes(permission),
    [userPermissions]
  );

  return {
    // Data
    settings,
    settingsMap,
    categories: SETTINGS_CATEGORIES,
    stats,

    // Loading states
    isLoading,
    isUpdating: updateMutation.isPending,

    // Actions
    updateSetting: handleUpdateSetting,
    refreshSettings,

    // Utilities
    getSetting,
    getSettingValue,
    hasPermission,
  };
}

// 🎯 Export query keys for external use
export { SETTINGS_QUERY_KEYS };
