/**
 * ⚡ TANSTACK QUERY CLIENT
 * ========================
 *
 * Configuración enterprise de TanStack Query para máxima performance.
 * Battle-tested en aplicaciones masivas como Netflix, GitHub.
 *
 * Enterprise: 2025-01-17 - Optimal caching architecture
 */

import { QueryClient } from "@tanstack/react-query";

// ⚡ Enterprise Query Client configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 🚀 Performance optimizations
      staleTime: 30 * 1000, // 30s - considerar datos frescos
      gcTime: 5 * 60 * 1000, // 5min - tiempo en cache (antes cacheTime)
      retry: 3, // 3 reintentos automáticos
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 🔄 Smart refetching
      refetchOnWindowFocus: true, // Revalidar al enfocar ventana
      refetchOnReconnect: true, // Revalidar al reconectar
      refetchOnMount: "always", // Siempre revalidar al montar

      // 📊 Error handling
      throwOnError: false, // Manejar errores en components

      // ⚡ Network optimizations
      networkMode: "online", // Solo ejecutar cuando hay conexión
    },
    mutations: {
      // 🔄 Optimistic updates configuration
      retry: 1,
      networkMode: "online",
      throwOnError: false,
    },
  },
});

// 🗑️ Cache utilities
export const invalidateUsers = () => {
  queryClient.invalidateQueries({ queryKey: ["users"] });
};

export const invalidateFeatureFlags = () => {
  queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
};

export const invalidateAudit = () => {
  queryClient.invalidateQueries({ queryKey: ["audit"] });
};

export const invalidateStats = () => {
  queryClient.invalidateQueries({ queryKey: ["stats"] });
};

// 🧹 Clear all cache
export const clearAllCache = () => {
  queryClient.clear();
};

// 📊 Cache inspection utilities (development)
export const getCacheData = (key: string[]) => {
  return queryClient.getQueryData(key);
};

export const getCacheStats = () => {
  const cache = queryClient.getQueryCache();
  return {
    queries: cache.getAll().length,
    size: cache.getAll().reduce((size, query) => {
      return size + JSON.stringify(query.state.data).length;
    }, 0),
  };
};

// 🔄 Prefetch utilities
export const prefetchUsers = async () => {
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { getAllUsersAction } = await import(
        "@/features/admin/users/server/actions"
      );
      const result = await getAllUsersAction(50, 0);
      if (result.success) return result.data.users;
      throw new Error(result.error);
    },
  });
};

export const prefetchFeatureFlags = async () => {
  await queryClient.prefetchQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const { getFeatureFlagsAction } = await import(
        "@/features/feature-flags/actions"
      );
      const result = await getFeatureFlagsAction();
      if (result.success) return result.data;
      throw new Error(result.error);
    },
  });
};
