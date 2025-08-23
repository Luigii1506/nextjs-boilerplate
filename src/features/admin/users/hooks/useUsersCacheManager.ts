/**
 * 🗄️ USERS CACHE MANAGER - TANSTACK OPTIMIZED
 * ===========================================
 *
 * Sistema avanzado de cache management para usuarios.
 * Background updates, prefetching inteligente y cache warming.
 *
 * Enterprise: 2025-01-17 - Advanced cache management
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { getAllUsersAction, getUserDetailsAction } from "../server/actions";
import type { User } from "../types";
import { useUserDetails, USER_DETAILS_QUERY_KEYS } from "./useUserDetails";

// 🎯 Cache strategy types
export type CacheStrategy =
  | "aggressive" // Prefetch everything possible
  | "balanced" // Smart prefetching based on usage patterns
  | "conservative" // Minimal prefetching
  | "custom"; // User-defined strategy

// 🎯 Cache configuration
interface CacheManagerConfig {
  strategy: CacheStrategy;
  backgroundUpdateInterval: number; // ms
  prefetchWindowSize: number; // number of items to prefetch
  staleTimeMultiplier: number; // multiplier for stale time
  maxCacheEntries: number;
  enableBackgroundUpdates: boolean;
  enablePredictivePrefetch: boolean;
  enableCacheWarming: boolean;
}

const CACHE_STRATEGIES: Record<CacheStrategy, Partial<CacheManagerConfig>> = {
  aggressive: {
    backgroundUpdateInterval: 30 * 1000, // 30s
    prefetchWindowSize: 20,
    staleTimeMultiplier: 2,
    maxCacheEntries: 1000,
    enableBackgroundUpdates: true,
    enablePredictivePrefetch: true,
    enableCacheWarming: true,
  },
  balanced: {
    backgroundUpdateInterval: 60 * 1000, // 1min
    prefetchWindowSize: 10,
    staleTimeMultiplier: 1.5,
    maxCacheEntries: 500,
    enableBackgroundUpdates: true,
    enablePredictivePrefetch: true,
    enableCacheWarming: false,
  },
  conservative: {
    backgroundUpdateInterval: 5 * 60 * 1000, // 5min
    prefetchWindowSize: 5,
    staleTimeMultiplier: 1,
    maxCacheEntries: 100,
    enableBackgroundUpdates: false,
    enablePredictivePrefetch: false,
    enableCacheWarming: false,
  },
  custom: {},
};

const DEFAULT_CONFIG: CacheManagerConfig = {
  strategy: "balanced",
  backgroundUpdateInterval: 60 * 1000,
  prefetchWindowSize: 10,
  staleTimeMultiplier: 1.5,
  maxCacheEntries: 500,
  enableBackgroundUpdates: true,
  enablePredictivePrefetch: true,
  enableCacheWarming: false,
};

// 📊 Cache analytics
interface CacheAnalytics {
  hitRate: number;
  missRate: number;
  totalQueries: number;
  cacheSize: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
  memoryUsageEstimate: number; // bytes
}

// 🎯 Usage pattern tracking
interface UsagePattern {
  userId: string;
  accessCount: number;
  lastAccessed: Date;
  averageAccessInterval: number;
  predictedNextAccess: Date | null;
}

/**
 * 🗄️ USE USERS CACHE MANAGER
 *
 * Hook avanzado para gestión inteligente de cache de usuarios.
 */
export function useUsersCacheManager(config: Partial<CacheManagerConfig> = {}) {
  const queryClient = useQueryClient();

  // 🎛️ Configuration
  const fullConfig = useMemo(() => {
    const strategyConfig = CACHE_STRATEGIES[config.strategy || "balanced"];
    return { ...DEFAULT_CONFIG, ...strategyConfig, ...config };
  }, [config]);

  // 📊 Usage patterns tracking
  const usagePatterns = useRef<Map<string, UsagePattern>>(new Map());
  const backgroundUpdateTimer = useRef<NodeJS.Timeout>();
  const cacheAnalytics = useRef<CacheAnalytics>({
    hitRate: 0,
    missRate: 0,
    totalQueries: 0,
    cacheSize: 0,
    oldestEntry: null,
    newestEntry: null,
    memoryUsageEstimate: 0,
  });

  // 🔍 Get all cached user data
  const getCachedUsers = useCallback(() => {
    return queryClient.getQueriesData<User[]>({
      queryKey: ["users"],
    });
  }, [queryClient]);

  // 📊 Calculate cache analytics
  const updateCacheAnalytics = useCallback(() => {
    const allQueries = queryClient.getQueryCache().getAll();
    const userQueries = allQueries.filter(
      (query) => query.queryKey[0] === "users" && query.state.data
    );

    const now = new Date();
    let oldestEntry: Date | null = null;
    let newestEntry: Date | null = null;
    let totalMemory = 0;

    userQueries.forEach((query) => {
      if (query.state.dataUpdatedAt) {
        const entryDate = new Date(query.state.dataUpdatedAt);
        if (!oldestEntry || entryDate < oldestEntry) oldestEntry = entryDate;
        if (!newestEntry || entryDate > newestEntry) newestEntry = entryDate;
      }

      // Rough memory estimation (JSON.stringify size)
      if (query.state.data) {
        try {
          totalMemory += JSON.stringify(query.state.data).length * 2; // UTF-16 approximation
        } catch {
          totalMemory += 1000; // fallback estimate
        }
      }
    });

    cacheAnalytics.current = {
      hitRate: 0, // Would need query cache instrumentation
      missRate: 0,
      totalQueries: userQueries.length,
      cacheSize: userQueries.length,
      oldestEntry,
      newestEntry,
      memoryUsageEstimate: totalMemory,
    };
  }, [queryClient]);

  // 🎯 Track user access patterns
  const trackUserAccess = useCallback((userId: string) => {
    const now = new Date();
    const existing = usagePatterns.current.get(userId);

    if (existing) {
      const timeSinceLastAccess =
        now.getTime() - existing.lastAccessed.getTime();
      const newAverageInterval =
        (existing.averageAccessInterval + timeSinceLastAccess) / 2;

      usagePatterns.current.set(userId, {
        ...existing,
        accessCount: existing.accessCount + 1,
        lastAccessed: now,
        averageAccessInterval: newAverageInterval,
        predictedNextAccess: new Date(now.getTime() + newAverageInterval),
      });
    } else {
      usagePatterns.current.set(userId, {
        userId,
        accessCount: 1,
        lastAccessed: now,
        averageAccessInterval: 0,
        predictedNextAccess: null,
      });
    }
  }, []);

  // 🚀 Prefetch user details
  const prefetchUserDetails = useCallback(
    async (userId: string, priority: "high" | "low" = "low") => {
      trackUserAccess(userId);

      const cacheKey = USER_DETAILS_QUERY_KEYS.detail(userId);
      const existingData = queryClient.getQueryData(cacheKey);

      if (!existingData) {
        try {
          await queryClient.prefetchQuery({
            queryKey: cacheKey,
            queryFn: () =>
              getUserDetailsAction(userId).then((result) => {
                if (!result.success || !result.data) {
                  throw new Error(result.error || "Failed to fetch user");
                }
                return result.data;
              }),
            staleTime: 30 * 1000 * fullConfig.staleTimeMultiplier,
            gcTime: priority === "high" ? 10 * 60 * 1000 : 5 * 60 * 1000,
          });
        } catch (error) {
          console.warn(`Failed to prefetch user ${userId}:`, error);
        }
      }
    },
    [queryClient, trackUserAccess, fullConfig.staleTimeMultiplier]
  );

  // 📦 Batch prefetch users
  const batchPrefetchUsers = useCallback(
    async (
      userIds: string[],
      options: { maxConcurrent?: number; priority?: "high" | "low" } = {}
    ) => {
      const { maxConcurrent = 5, priority = "low" } = options;

      // Filter out already cached users
      const uncachedIds = userIds.filter(
        (id) => !queryClient.getQueryData(USER_DETAILS_QUERY_KEYS.detail(id))
      );

      if (uncachedIds.length === 0) return;

      // Process in batches to avoid overwhelming the server
      const batches = [];
      for (let i = 0; i < uncachedIds.length; i += maxConcurrent) {
        batches.push(uncachedIds.slice(i, i + maxConcurrent));
      }

      for (const batch of batches) {
        await Promise.allSettled(
          batch.map((userId) => prefetchUserDetails(userId, priority))
        );

        // Small delay between batches to prevent rate limiting
        if (batches.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
    },
    [queryClient, prefetchUserDetails]
  );

  // 🧠 Predictive prefetching based on usage patterns
  const predictivePrefetch = useCallback(async () => {
    if (!fullConfig.enablePredictivePrefetch) return;

    const now = new Date();
    const predictions: Array<{ userId: string; confidence: number }> = [];

    usagePatterns.current.forEach((pattern) => {
      if (pattern.predictedNextAccess && pattern.predictedNextAccess <= now) {
        const confidence = Math.min(pattern.accessCount / 10, 1); // More accesses = higher confidence
        predictions.push({ userId: pattern.userId, confidence });
      }
    });

    // Sort by confidence and prefetch top candidates
    predictions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, fullConfig.prefetchWindowSize)
      .forEach(({ userId }) => prefetchUserDetails(userId, "low"));
  }, [
    fullConfig.enablePredictivePrefetch,
    fullConfig.prefetchWindowSize,
    prefetchUserDetails,
  ]);

  // 🔄 Background update users list
  const backgroundUpdateUsersList = useCallback(async () => {
    if (!fullConfig.enableBackgroundUpdates) return;

    try {
      // Get fresh data silently
      const result = await getAllUsersAction(100, 0);
      if (result.success && result.data) {
        // Update cache with fresh data
        queryClient.setQueryData(["users", "list"], result.data.users, {
          updatedAt: Date.now(),
        });
      }
    } catch (error) {
      console.warn("Background users update failed:", error);
    }
  }, [queryClient, fullConfig.enableBackgroundUpdates]);

  // ♨️ Cache warming - preload frequently accessed data
  const warmCache = useCallback(async () => {
    if (!fullConfig.enableCacheWarming) return;

    // Get current users list
    const usersList = queryClient.getQueryData<User[]>(["users", "list"]);
    if (!usersList || usersList.length === 0) return;

    // Warm cache with most recently active users (first 10)
    const recentUsers = usersList
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 10);

    await batchPrefetchUsers(
      recentUsers.map((u) => u.id),
      { priority: "high" }
    );
  }, [queryClient, fullConfig.enableCacheWarming, batchPrefetchUsers]);

  // 🧹 Cache cleanup - remove old entries
  const cleanupCache = useCallback(() => {
    const allQueries = queryClient.getQueryCache().getAll();
    const userDetailQueries = allQueries.filter(
      (query) =>
        query.queryKey[0] === "users" &&
        query.queryKey[1] === "detail" &&
        query.queryKey.length === 3
    );

    if (userDetailQueries.length <= fullConfig.maxCacheEntries) return;

    // Remove oldest entries
    const sortedQueries = userDetailQueries.sort(
      (a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0)
    );

    const toRemove = sortedQueries.slice(
      0,
      sortedQueries.length - fullConfig.maxCacheEntries
    );
    toRemove.forEach((query) => {
      queryClient.removeQueries({ queryKey: query.queryKey });
    });
  }, [queryClient, fullConfig.maxCacheEntries]);

  // 🕐 Background process management
  useEffect(() => {
    if (
      fullConfig.enableBackgroundUpdates &&
      fullConfig.backgroundUpdateInterval > 0
    ) {
      backgroundUpdateTimer.current = setInterval(() => {
        backgroundUpdateUsersList();
        predictivePrefetch();
        updateCacheAnalytics();
        cleanupCache();
      }, fullConfig.backgroundUpdateInterval);

      return () => {
        if (backgroundUpdateTimer.current) {
          clearInterval(backgroundUpdateTimer.current);
        }
      };
    }
  }, [
    fullConfig.enableBackgroundUpdates,
    fullConfig.backgroundUpdateInterval,
    backgroundUpdateUsersList,
    predictivePrefetch,
    updateCacheAnalytics,
    cleanupCache,
  ]);

  // 🎯 Cache operations
  const invalidateAllUsers = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  }, [queryClient]);

  const clearAllUsersCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: ["users"] });
    usagePatterns.current.clear();
  }, [queryClient]);

  const getUsagePatterns = useCallback(() => {
    return Array.from(usagePatterns.current.values());
  }, []);

  // 📊 Cache status
  const cacheStatus = useMemo(() => {
    updateCacheAnalytics();
    return {
      ...cacheAnalytics.current,
      usagePatternsCount: usagePatterns.current.size,
      backgroundUpdatesEnabled: fullConfig.enableBackgroundUpdates,
      predictivePrefetchEnabled: fullConfig.enablePredictivePrefetch,
      cacheWarmingEnabled: fullConfig.enableCacheWarming,
      strategy: fullConfig.strategy,
    };
  }, [fullConfig, updateCacheAnalytics]);

  return {
    // 🎯 Prefetching
    prefetchUserDetails,
    batchPrefetchUsers,
    predictivePrefetch,

    // 🔄 Background operations
    backgroundUpdateUsersList,
    warmCache,

    // 🧹 Cache management
    cleanupCache,
    invalidateAllUsers,
    clearAllUsersCache,

    // 📊 Analytics and monitoring
    cacheStatus,
    getUsagePatterns,
    getCachedUsers,

    // 🎛️ Configuration
    config: fullConfig,

    // 🛠️ Utilities
    trackUserAccess,
  };
}

/**
 * 🎯 USE SMART PREFETCH
 *
 * Hook simplificado para prefetching inteligente basado en interacciones del usuario.
 */
export function useSmartPrefetch() {
  const cacheManager = useUsersCacheManager({ strategy: "balanced" });

  const prefetchOnHover = useCallback(
    async (userId: string) => {
      // Debounce to avoid excessive prefetching
      await new Promise((resolve) => setTimeout(resolve, 200));
      await cacheManager.prefetchUserDetails(userId, "low");
    },
    [cacheManager]
  );

  const prefetchOnFocus = useCallback(
    async (userId: string) => {
      await cacheManager.prefetchUserDetails(userId, "high");
    },
    [cacheManager]
  );

  const prefetchBatch = useCallback(
    async (userIds: string[]) => {
      await cacheManager.batchPrefetchUsers(userIds, { maxConcurrent: 3 });
    },
    [cacheManager]
  );

  return {
    prefetchOnHover,
    prefetchOnFocus,
    prefetchBatch,
    cacheStatus: cacheManager.cacheStatus,
  };
}
