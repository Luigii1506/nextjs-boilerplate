# ⚡ **TANSTACK QUERY ADVANCED PATTERNS**

## Patrones Avanzados y Configuraciones Enterprise

---

## 📚 **TABLA DE CONTENIDO AVANZADO**

1. [🚀 Performance Patterns](#performance-patterns)
2. [🎯 Cache Strategies Avanzadas](#cache-strategies)
3. [🔄 Background Sync Patterns](#background-sync)
4. [⚡ Optimistic Updates Complejas](#optimistic-updates)
5. [🔍 Prefetching Inteligente](#prefetching-patterns)
6. [📊 Real-time Data Patterns](#realtime-patterns)
7. [🔐 Authentication Integration](#auth-integration)
8. [📱 Offline Support](#offline-support)
9. [🧪 Testing Patterns](#testing-patterns)
10. [📈 Monitoring y Analytics](#monitoring)

---

## 🚀 **PERFORMANCE PATTERNS**

### Pattern 1: Virtual Scrolling con TanStack Query

```typescript
// 🎯 useVirtualizedList.ts - For Large Lists
import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";

interface VirtualListConfig {
  pageSize: number;
  estimateSize: number;
  overscan: number;
}

export const useVirtualizedUsersList = (
  config: VirtualListConfig = {
    pageSize: 50,
    estimateSize: 80,
    overscan: 5,
  }
) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Infinite query for data
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["users", "infinite"],
    queryFn: ({ pageParam = 0 }) =>
      fetchUsers({ page: pageParam, limit: config.pageSize }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    // Performance optimizations
    keepPreviousData: true,
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
  });

  // Flatten pages into single array
  const flatData = useMemo(
    () => data?.pages?.flatMap((page) => page.users) ?? [],
    [data]
  );

  // Virtual scrolling
  const virtualizer = useVirtualizer({
    count: hasNextPage ? flatData.length + 1 : flatData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => config.estimateSize,
    overscan: config.overscan,
  });

  // Auto fetch more when approaching end
  useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();

    if (!lastItem) return;

    if (
      lastItem.index >= flatData.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    flatData.length,
    isFetchingNextPage,
    virtualizer.getVirtualItems(),
  ]);

  return {
    parentRef,
    virtualizer,
    data: flatData,
    isLoading,
    isFetchingNextPage,
    error,
    totalSize: virtualizer.getTotalSize(),
    virtualItems: virtualizer.getVirtualItems(),
  };
};

// Usage in component
const VirtualizedUsersList = () => {
  const {
    parentRef,
    virtualItems,
    data,
    totalSize,
    isLoading,
    isFetchingNextPage,
  } = useVirtualizedUsersList();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div
        style={{
          height: `${totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualItem) => {
          const isLoaderRow = virtualItem.index > data.length - 1;
          const user = data[virtualItem.index];

          return (
            <div
              key={virtualItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoaderRow ? (
                isFetchingNextPage ? (
                  <div>Loading more...</div>
                ) : (
                  <div>Nothing more to load</div>
                )
              ) : (
                <UserCard user={user} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

### Pattern 2: Parallel Queries with Suspense

```typescript
// 🎯 useParallelDashboardData.ts - Load Multiple Datasets Simultaneously
export const useParallelDashboardData = () => {
  // Execute multiple queries in parallel
  const [usersQuery, ordersQuery, revenueQuery, analyticsQuery] = useQueries({
    queries: [
      {
        queryKey: ["users", "stats"],
        queryFn: fetchUserStats,
        staleTime: 60 * 1000,
      },
      {
        queryKey: ["orders", "stats"],
        queryFn: fetchOrderStats,
        staleTime: 60 * 1000,
      },
      {
        queryKey: ["revenue", "stats"],
        queryFn: fetchRevenueStats,
        staleTime: 60 * 1000,
      },
      {
        queryKey: ["analytics", "overview"],
        queryFn: fetchAnalyticsOverview,
        staleTime: 2 * 60 * 1000,
      },
    ],
  });

  // Combine loading states
  const isLoading =
    usersQuery.isLoading ||
    ordersQuery.isLoading ||
    revenueQuery.isLoading ||
    analyticsQuery.isLoading;

  // Combine error states
  const error =
    usersQuery.error ||
    ordersQuery.error ||
    revenueQuery.error ||
    analyticsQuery.error;

  // All data ready check
  const isReady =
    usersQuery.data &&
    ordersQuery.data &&
    revenueQuery.data &&
    analyticsQuery.data;

  return {
    data: {
      users: usersQuery.data,
      orders: ordersQuery.data,
      revenue: revenueQuery.data,
      analytics: analyticsQuery.data,
    },
    isLoading,
    isReady,
    error,
    refetchAll: () => {
      usersQuery.refetch();
      ordersQuery.refetch();
      revenueQuery.refetch();
      analyticsQuery.refetch();
    },
  };
};

// Suspense-enabled component
const DashboardWithSuspense = () => {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
};

const DashboardContent = () => {
  const { data, isReady } = useParallelDashboardData();

  if (!isReady) {
    throw new Promise((resolve) => setTimeout(resolve, 0)); // Suspend
  }

  return (
    <div>
      <UserStats data={data.users} />
      <OrderStats data={data.orders} />
      <RevenueChart data={data.revenue} />
      <AnalyticsDashboard data={data.analytics} />
    </div>
  );
};
```

### Pattern 3: Dependent Queries Chain

```typescript
// 🎯 useDependentQueries.ts - Sequential Data Loading
export const useUserDetailsWithRelatedData = (userId: string) => {
  // Step 1: Get user details
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  // Step 2: Get user's orders (depends on user)
  const ordersQuery = useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => fetchUserOrders(userId),
    enabled: !!userQuery.data?.id,
  });

  // Step 3: Get order analytics (depends on orders)
  const analyticsQuery = useQuery({
    queryKey: ["analytics", "user", userId],
    queryFn: () =>
      fetchUserAnalytics(
        userId,
        ordersQuery.data?.map((o) => o.id)
      ),
    enabled: !!ordersQuery.data?.length,
  });

  // Step 4: Get recommendations (depends on user profile + orders)
  const recommendationsQuery = useQuery({
    queryKey: ["recommendations", userId],
    queryFn: () =>
      fetchRecommendations({
        userId,
        userPreferences: userQuery.data?.preferences,
        orderHistory: ordersQuery.data,
      }),
    enabled: !!userQuery.data && !!ordersQuery.data,
    staleTime: 5 * 60 * 1000, // Recommendations can be cached longer
  });

  return {
    user: userQuery.data,
    orders: ordersQuery.data,
    analytics: analyticsQuery.data,
    recommendations: recommendationsQuery.data,

    // Loading states
    isLoadingUser: userQuery.isLoading,
    isLoadingOrders: ordersQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,
    isLoadingRecommendations: recommendationsQuery.isLoading,

    // Overall states
    isLoading: userQuery.isLoading,
    isLoadingRelatedData:
      ordersQuery.isLoading ||
      analyticsQuery.isLoading ||
      recommendationsQuery.isLoading,

    // Errors
    errors: {
      user: userQuery.error,
      orders: ordersQuery.error,
      analytics: analyticsQuery.error,
      recommendations: recommendationsQuery.error,
    },

    // Data ready checks
    hasUser: !!userQuery.data,
    hasOrders: !!ordersQuery.data,
    hasAnalytics: !!analyticsQuery.data,
    hasRecommendations: !!recommendationsQuery.data,

    // Actions
    refetchAll: () => {
      userQuery.refetch();
      if (userQuery.data) ordersQuery.refetch();
      if (ordersQuery.data) analyticsQuery.refetch();
      if (userQuery.data && ordersQuery.data) recommendationsQuery.refetch();
    },
  };
};
```

---

## 🎯 **CACHE STRATEGIES AVANZADAS**

### Strategy 1: Multi-Level Cache Hierarchy

```typescript
// 🎯 useMultiLevelCache.ts - Advanced Caching Strategy
interface CacheLevel {
  memory: number; // In-memory cache duration
  persistent: number; // Persistent cache duration
  network: number; // Network cache duration
}

const CACHE_LEVELS = {
  // Critical data - fast access, short cache
  critical: {
    memory: 30 * 1000,
    persistent: 2 * 60 * 1000,
    network: 60 * 1000,
  },

  // Standard data - balanced approach
  standard: {
    memory: 60 * 1000,
    persistent: 5 * 60 * 1000,
    network: 2 * 60 * 1000,
  },

  // Static data - long cache
  static: {
    memory: 10 * 60 * 1000,
    persistent: 30 * 60 * 1000,
    network: 10 * 60 * 1000,
  },
} as const;

export const useAdvancedCaching = () => {
  const queryClient = useQueryClient();

  // Set cache configuration based on data type
  const setCacheConfig = (
    queryKey: unknown[],
    level: keyof typeof CACHE_LEVELS,
    data?: any
  ) => {
    const config = CACHE_LEVELS[level];

    queryClient.setQueryDefaults(queryKey, {
      staleTime: config.memory,
      cacheTime: config.persistent,
      networkMode: "online" as const,
    });

    // If data provided, set it immediately
    if (data) {
      queryClient.setQueryData(queryKey, data);
    }
  };

  // Preload critical data
  const preloadCriticalData = async () => {
    const criticalQueries = [
      { key: ["user", "profile"], fn: fetchUserProfile },
      { key: ["navigation"], fn: fetchNavigation },
      { key: ["permissions"], fn: fetchPermissions },
    ];

    await Promise.all(
      criticalQueries.map(({ key, fn }) => {
        setCacheConfig(key, "critical");
        return queryClient.prefetchQuery({ queryKey: key, queryFn: fn });
      })
    );
  };

  // Cache optimization strategies
  const optimizeCache = () => {
    // Remove old queries
    queryClient.removeQueries({
      predicate: (query) => {
        const timeSinceLastUsed = Date.now() - (query.state.dataUpdatedAt || 0);
        return timeSinceLastUsed > 30 * 60 * 1000; // 30 minutes
      },
    });

    // Prefetch likely-needed data
    const currentUser = queryClient.getQueryData(["user", "profile"]);
    if (currentUser) {
      // Prefetch user-related data
      queryClient.prefetchQuery({
        queryKey: ["user", "preferences"],
        queryFn: () => fetchUserPreferences((currentUser as any).id),
      });
    }
  };

  return {
    setCacheConfig,
    preloadCriticalData,
    optimizeCache,

    // Cache analysis
    getCacheSize: () => queryClient.getQueryCache().getAll().length,
    getCacheStats: () => {
      const queries = queryClient.getQueryCache().getAll();
      return {
        total: queries.length,
        stale: queries.filter((q) => q.isStale()).length,
        active: queries.filter((q) => q.getObserversCount() > 0).length,
        inactive: queries.filter((q) => q.getObserversCount() === 0).length,
      };
    },
  };
};
```

### Strategy 2: Smart Cache Invalidation

```typescript
// 🎯 useSmartInvalidation.ts - Intelligent Cache Updates
export const useSmartInvalidation = () => {
  const queryClient = useQueryClient();

  // Invalidation patterns based on entity relationships
  const invalidationMap = {
    user: {
      created: () => [
        ["users"], // User lists
        ["dashboard"], // Dashboard stats
        ["analytics", "users"], // User analytics
      ],
      updated: (userId: string) => [
        ["users"], // User lists
        ["user", userId], // Specific user
        ["user", userId, "profile"], // User profile
      ],
      deleted: (userId: string) => [
        ["users"], // User lists
        ["user", userId], // Specific user (remove)
        ["dashboard"], // Dashboard stats
        ["analytics"], // All analytics
      ],
    },

    order: {
      created: (userId: string) => [
        ["orders"], // Order lists
        ["orders", "user", userId], // User orders
        ["dashboard"], // Dashboard stats
        ["analytics", "revenue"], // Revenue analytics
        ["user", userId, "analytics"], // User analytics
      ],
      updated: (orderId: string, userId: string) => [
        ["orders"], // Order lists
        ["order", orderId], // Specific order
        ["orders", "user", userId], // User orders
        ["analytics", "revenue"], // Revenue analytics
      ],
      cancelled: (orderId: string, userId: string) => [
        ["orders"], // Order lists
        ["order", orderId], // Specific order
        ["orders", "user", userId], // User orders
        ["dashboard"], // Dashboard stats
        ["analytics"], // All analytics
      ],
    },
  };

  // Smart invalidation function
  const smartInvalidate = async (
    entity: keyof typeof invalidationMap,
    action: string,
    entityId?: string,
    relatedId?: string
  ) => {
    const entityMap = invalidationMap[entity];

    if (!entityMap || !(action in entityMap)) {
      console.warn(`Unknown invalidation pattern: ${entity}.${action}`);
      return;
    }

    const invalidationKeys = (entityMap as any)[action](entityId, relatedId);

    // Batch invalidations for performance
    await Promise.all(
      invalidationKeys.map((key: unknown[]) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
    );

    // Log for debugging
    console.debug(
      `Invalidated ${invalidationKeys.length} query patterns for ${entity}.${action}`
    );
  };

  // Remove specific entity from cache
  const removeFromCache = (entity: string, entityId: string) => {
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return key.includes(entity) && key.includes(entityId);
      },
    });
  };

  // Update entity across all relevant queries
  const updateEntityInCache = <T>(
    entity: string,
    entityId: string,
    updater: (oldData: T) => T
  ) => {
    queryClient.setQueriesData(
      {
        predicate: (query) => {
          const key = query.queryKey;
          return key.includes(entity) && key.includes(entityId);
        },
      },
      updater
    );
  };

  return {
    smartInvalidate,
    removeFromCache,
    updateEntityInCache,

    // Utility functions
    invalidateByPattern: (pattern: string[]) => {
      return queryClient.invalidateQueries({
        predicate: (query) => {
          return pattern.every((p) => query.queryKey.includes(p));
        },
      });
    },

    // Get related queries
    getRelatedQueries: (entity: string, entityId: string) => {
      return queryClient.getQueryCache().findAll({
        predicate: (query) => {
          const key = query.queryKey;
          return key.includes(entity) && key.includes(entityId);
        },
      });
    },
  };
};
```

---

## 🔄 **BACKGROUND SYNC PATTERNS**

### Pattern 1: Automatic Background Refresh

```typescript
// 🎯 useBackgroundSync.ts - Keep Data Fresh Automatically
export const useBackgroundSync = () => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Background sync configuration
  const syncConfig = {
    // Critical data - sync frequently
    critical: {
      interval: 30 * 1000, // 30 seconds
      queries: [
        ["user", "profile"],
        ["notifications"],
        ["realtime", "updates"],
      ],
    },

    // Standard data - sync moderately
    standard: {
      interval: 2 * 60 * 1000, // 2 minutes
      queries: [["users"], ["orders"], ["dashboard"]],
    },

    // Static data - sync rarely
    static: {
      interval: 10 * 60 * 1000, // 10 minutes
      queries: [["settings"], ["configuration"], ["navigation"]],
    },
  };

  // Setup background sync intervals
  useEffect(() => {
    if (!isOnline) return;

    const intervals: NodeJS.Timeout[] = [];

    Object.entries(syncConfig).forEach(([level, config]) => {
      const interval = setInterval(async () => {
        try {
          await Promise.all(
            config.queries.map((queryKey) =>
              queryClient.refetchQueries({
                queryKey,
                type: "active", // Only refetch active queries
              })
            )
          );

          setLastSync(new Date());
          console.debug(`Background sync completed for ${level} data`);
        } catch (error) {
          console.error(`Background sync failed for ${level}:`, error);
        }
      }, config.interval);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [isOnline, queryClient]);

  // Manual sync function
  const manualSync = async (level?: keyof typeof syncConfig) => {
    if (!isOnline) return false;

    try {
      const configsToSync = level
        ? [syncConfig[level]]
        : Object.values(syncConfig);

      await Promise.all(
        configsToSync.flatMap((config) =>
          config.queries.map((queryKey) =>
            queryClient.refetchQueries({ queryKey })
          )
        )
      );

      setLastSync(new Date());
      return true;
    } catch (error) {
      console.error("Manual sync failed:", error);
      return false;
    }
  };

  // Sync on window focus (user returns to app)
  useEffect(() => {
    const handleFocus = () => {
      if (isOnline) {
        manualSync("critical"); // Sync critical data immediately
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isOnline]);

  return {
    isOnline,
    lastSync,
    manualSync,

    // Sync status
    isSyncing: queryClient
      .getQueryCache()
      .getAll()
      .some((q) => q.state.isFetching),

    // Sync utilities
    syncNow: () => manualSync(),
    syncCritical: () => manualSync("critical"),
    syncAll: () => manualSync(),

    // Sync stats
    getSyncStats: () => {
      const queries = queryClient.getQueryCache().getAll();
      return {
        total: queries.length,
        syncing: queries.filter((q) => q.state.isFetching).length,
        stale: queries.filter((q) => q.isStale()).length,
        error: queries.filter((q) => q.state.error).length,
      };
    },
  };
};
```

### Pattern 2: Smart Retry with Exponential Backoff

```typescript
// 🎯 useSmartRetry.ts - Intelligent Retry Logic
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryOnlyOnNetworkError: boolean;
}

export const useSmartRetry = (config: Partial<RetryConfig> = {}) => {
  const finalConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2,
    retryOnlyOnNetworkError: true,
    ...config,
  };

  // Smart retry function with exponential backoff
  const createRetryFunction = (queryKey: unknown[]) => {
    return (failureCount: number, error: any) => {
      // Don't retry client errors (4xx), only server errors (5xx) and network errors
      if (finalConfig.retryOnlyOnNetworkError) {
        const isNetworkError = !error.response || error.response.status >= 500;
        if (!isNetworkError) return false;
      }

      return failureCount < finalConfig.maxRetries;
    };
  };

  // Smart retry delay with jitter
  const createRetryDelayFunction = () => {
    return (attemptIndex: number) => {
      const delay = Math.min(
        finalConfig.baseDelay *
          Math.pow(finalConfig.backoffFactor, attemptIndex),
        finalConfig.maxDelay
      );

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.1 * delay;
      return delay + jitter;
    };
  };

  // Network-aware retry
  const createNetworkAwareRetry = () => {
    return (failureCount: number, error: any) => {
      // Don't retry if offline
      if (!navigator.onLine) return false;

      // Check if it's a network error
      const isNetworkError =
        !error.response ||
        error.code === "NETWORK_ERROR" ||
        error.message?.includes("network") ||
        error.response?.status >= 500;

      if (!isNetworkError) return false;

      return failureCount < finalConfig.maxRetries;
    };
  };

  return {
    retry: createRetryFunction,
    retryDelay: createRetryDelayFunction(),
    networkAwareRetry: createNetworkAwareRetry(),

    // Utility functions
    shouldRetryError: (error: any) => {
      if (finalConfig.retryOnlyOnNetworkError) {
        return !error.response || error.response.status >= 500;
      }
      return true;
    },

    calculateDelay: (attemptIndex: number) => {
      return Math.min(
        finalConfig.baseDelay *
          Math.pow(finalConfig.backoffFactor, attemptIndex),
        finalConfig.maxDelay
      );
    },
  };
};

// Usage example
export const useUsersWithSmartRetry = () => {
  const { retry, retryDelay } = useSmartRetry({
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 10000,
  });

  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    retry: retry(["users"]),
    retryDelay,
    // Additional network-aware options
    networkMode: "online",
    refetchOnReconnect: true,
  });
};
```

---

## ⚡ **OPTIMISTIC UPDATES COMPLEJAS**

### Pattern 1: Multi-Entity Optimistic Updates

```typescript
// 🎯 useComplexOptimisticUpdates.ts - Handle Complex Data Relationships
export const useComplexOptimisticUpdates = () => {
  const queryClient = useQueryClient();

  // Complex optimistic update for creating order with inventory update
  const createOrderWithInventoryUpdate = useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const result = await createOrderAction(orderData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    onMutate: async (orderData) => {
      // Cancel related queries
      await queryClient.cancelQueries({ queryKey: ["orders"] });
      await queryClient.cancelQueries({ queryKey: ["products"] });
      await queryClient.cancelQueries({ queryKey: ["inventory"] });
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });

      // Snapshot current data
      const previousOrders = queryClient.getQueryData(["orders"]);
      const previousProducts = queryClient.getQueryData(["products"]);
      const previousInventory = queryClient.getQueryData(["inventory"]);
      const previousDashboard = queryClient.getQueryData(["dashboard"]);

      // Create optimistic order
      const optimisticOrder = {
        id: `temp_${Date.now()}`,
        ...orderData,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      // 1. Add order to orders list
      queryClient.setQueryData(["orders"], (old: any[]) =>
        old ? [optimisticOrder, ...old] : [optimisticOrder]
      );

      // 2. Update product inventory
      queryClient.setQueryData(
        ["products"],
        (old: Product[]) =>
          old?.map((product) => {
            const orderItem = orderData.items.find(
              (item) => item.productId === product.id
            );
            if (orderItem) {
              return {
                ...product,
                stock: Math.max(0, product.stock - orderItem.quantity),
              };
            }
            return product;
          }) || []
      );

      // 3. Update inventory levels
      queryClient.setQueryData(["inventory"], (old: any) => ({
        ...old,
        totalItems:
          old?.totalItems -
          orderData.items.reduce((sum, item) => sum + item.quantity, 0),
        lowStockItems: old?.lowStockItems || [],
      }));

      // 4. Update dashboard stats
      queryClient.setQueryData(["dashboard"], (old: any) => ({
        ...old,
        totalOrders: (old?.totalOrders || 0) + 1,
        pendingOrders: (old?.pendingOrders || 0) + 1,
        totalRevenue: (old?.totalRevenue || 0) + orderData.total,
      }));

      return {
        previousOrders,
        previousProducts,
        previousInventory,
        previousDashboard,
        optimisticOrder,
      };
    },

    onError: (err, variables, context) => {
      // Rollback all optimistic updates
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
      if (context?.previousProducts) {
        queryClient.setQueryData(["products"], context.previousProducts);
      }
      if (context?.previousInventory) {
        queryClient.setQueryData(["inventory"], context.previousInventory);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(["dashboard"], context.previousDashboard);
      }
    },

    onSuccess: (newOrder, variables, context) => {
      // Replace optimistic order with real order
      queryClient.setQueryData(
        ["orders"],
        (old: any[]) =>
          old?.map((order) =>
            order.id === context?.optimisticOrder.id ? newOrder : order
          ) || []
      );
    },

    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  return {
    createOrderWithInventoryUpdate: createOrderWithInventoryUpdate.mutateAsync,
    isCreatingOrder: createOrderWithInventoryUpdate.isPending,
  };
};
```

### Pattern 2: Optimistic Updates with Conflict Resolution

```typescript
// 🎯 useOptimisticWithConflictResolution.ts - Handle Update Conflicts
interface ConflictResolutionStrategy {
  strategy: "server-wins" | "client-wins" | "merge" | "user-choice";
  mergeFields?: string[];
}

export const useOptimisticWithConflictResolution = (
  config: ConflictResolutionStrategy = { strategy: "server-wins" }
) => {
  const queryClient = useQueryClient();
  const [conflicts, setConflicts] = useState<any[]>([]);

  const updateUserWithConflictResolution = useMutation({
    mutationFn: async (userData: UpdateUserData) => {
      const result = await updateUserAction(userData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },

    onMutate: async (userData) => {
      await queryClient.cancelQueries({ queryKey: ["users"] });
      await queryClient.cancelQueries({ queryKey: ["user", userData.id] });

      const previousUsers = queryClient.getQueryData(["users"]);
      const previousUser = queryClient.getQueryData(["user", userData.id]);

      // Optimistic update
      const optimisticUser = {
        ...previousUser,
        ...userData,
        updatedAt: new Date().toISOString(),
        __optimistic: true,
      };

      queryClient.setQueryData(["user", userData.id], optimisticUser);
      queryClient.setQueryData(
        ["users"],
        (old: User[]) =>
          old?.map((user) =>
            user.id === userData.id ? optimisticUser : user
          ) || []
      );

      return {
        previousUsers,
        previousUser,
        optimisticUser,
        optimisticUpdateTime: Date.now(),
      };
    },

    onSuccess: (serverUser, variables, context) => {
      // Check for conflicts
      const hasConflict =
        context?.optimisticUser &&
        serverUser.updatedAt !== context.optimisticUser.updatedAt;

      if (hasConflict) {
        handleConflict(serverUser, context.optimisticUser, variables.id);
      } else {
        // No conflict, update with server data
        queryClient.setQueryData(["user", variables.id], serverUser);
        queryClient.setQueryData(
          ["users"],
          (old: User[]) =>
            old?.map((user) =>
              user.id === variables.id ? serverUser : user
            ) || []
        );
      }
    },

    onError: (err, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousUser) {
        queryClient.setQueryData(["user", variables.id], context.previousUser);
      }
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
    },
  });

  const handleConflict = (
    serverData: User,
    clientData: User,
    userId: string
  ) => {
    switch (config.strategy) {
      case "server-wins":
        queryClient.setQueryData(["user", userId], serverData);
        break;

      case "client-wins":
        // Keep client data, but we should probably re-send to server
        queryClient.setQueryData(["user", userId], clientData);
        break;

      case "merge":
        const mergedData = mergeConflictingData(
          serverData,
          clientData,
          config.mergeFields
        );
        queryClient.setQueryData(["user", userId], mergedData);
        break;

      case "user-choice":
        // Present conflict to user for resolution
        setConflicts((prev) => [
          ...prev,
          {
            id: userId,
            serverData,
            clientData,
            timestamp: new Date(),
          },
        ]);
        break;
    }
  };

  const mergeConflictingData = (
    server: User,
    client: User,
    mergeFields?: string[]
  ) => {
    if (!mergeFields) {
      // Default merge: prefer server for system fields, client for user fields
      return {
        ...server, // Server data as base
        name: client.name || server.name,
        email: client.email || server.email,
        // Keep server timestamps and system fields
      };
    }

    const merged = { ...server };
    mergeFields.forEach((field) => {
      if (client[field as keyof User] !== undefined) {
        (merged as any)[field] = client[field as keyof User];
      }
    });

    return merged;
  };

  const resolveConflict = (
    conflictId: string,
    resolution: "server" | "client" | "merged",
    mergedData?: any
  ) => {
    const conflict = conflicts.find((c) => c.id === conflictId);
    if (!conflict) return;

    let finalData;
    switch (resolution) {
      case "server":
        finalData = conflict.serverData;
        break;
      case "client":
        finalData = conflict.clientData;
        break;
      case "merged":
        finalData =
          mergedData ||
          mergeConflictingData(conflict.serverData, conflict.clientData);
        break;
    }

    queryClient.setQueryData(["user", conflictId], finalData);
    queryClient.setQueryData(
      ["users"],
      (old: User[]) =>
        old?.map((user) => (user.id === conflictId ? finalData : user)) || []
    );

    // Remove resolved conflict
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
  };

  return {
    updateUser: updateUserWithConflictResolution.mutateAsync,
    isUpdating: updateUserWithConflictResolution.isPending,
    conflicts,
    resolveConflict,
    hasConflicts: conflicts.length > 0,
  };
};
```

---

## 🔍 **PREFETCHING INTELIGENTE**

### Pattern 1: Predictive Prefetching

```typescript
// 🎯 usePredictivePrefetching.ts - AI-like Prefetching Based on User Behavior
interface UserBehaviorData {
  commonPaths: string[];
  timeSpentOnPages: Record<string, number>;
  frequentlyAccessedData: string[];
  timeOfDayPatterns: Record<string, string[]>;
}

export const usePredictivePrefetching = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData>({
    commonPaths: [],
    timeSpentOnPages: {},
    frequentlyAccessedData: [],
    timeOfDayPatterns: {},
  });

  // Track user behavior
  useEffect(() => {
    const trackPageView = (url: string) => {
      const startTime = Date.now();

      return () => {
        const timeSpent = Date.now() - startTime;
        setUserBehavior((prev) => ({
          ...prev,
          timeSpentOnPages: {
            ...prev.timeSpentOnPages,
            [url]: (prev.timeSpentOnPages[url] || 0) + timeSpent,
          },
        }));
      };
    };

    const cleanup = trackPageView(router.asPath);

    // Track navigation patterns
    const handleRouteChange = (url: string) => {
      setUserBehavior((prev) => ({
        ...prev,
        commonPaths: [
          ...new Set([...prev.commonPaths, url]).slice(-10), // Keep last 10 paths
        ],
      }));
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      cleanup();
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  // Predictive prefetching based on current location and behavior
  const predictAndPrefetch = useCallback(() => {
    const currentPath = router.asPath;
    const currentHour = new Date().getHours();

    // Predict likely next pages based on common patterns
    const likelyNextPages = predictNextPages(
      currentPath,
      userBehavior.commonPaths
    );

    // Predict likely data needs based on time and patterns
    const likelyDataNeeds = predictDataNeeds(
      currentPath,
      currentHour,
      userBehavior
    );

    // Prefetch pages
    likelyNextPages.forEach((path) => {
      router.prefetch(path);
    });

    // Prefetch data
    likelyDataNeeds.forEach(({ queryKey, queryFn }) => {
      queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: 60 * 1000, // 1 minute
      });
    });
  }, [router, queryClient, userBehavior]);

  // Predict next pages based on common navigation patterns
  const predictNextPages = (currentPath: string, commonPaths: string[]) => {
    const predictions: string[] = [];

    // Pattern 1: Sequential navigation
    if (currentPath === "/users") {
      predictions.push("/users/[id]"); // Likely to view user details
    }

    if (currentPath === "/dashboard") {
      predictions.push("/users", "/orders", "/analytics"); // Common next steps
    }

    // Pattern 2: Based on user's historical navigation
    const currentIndex = commonPaths.indexOf(currentPath);
    if (currentIndex >= 0 && currentIndex < commonPaths.length - 1) {
      predictions.push(commonPaths[currentIndex + 1]);
    }

    return [...new Set(predictions)]; // Remove duplicates
  };

  // Predict data needs based on context and time patterns
  const predictDataNeeds = (
    currentPath: string,
    currentHour: number,
    behavior: UserBehaviorData
  ) => {
    const predictions: Array<{
      queryKey: unknown[];
      queryFn: () => Promise<any>;
    }> = [];

    // Context-based predictions
    if (currentPath === "/dashboard") {
      predictions.push(
        { queryKey: ["users", "stats"], queryFn: fetchUserStats },
        { queryKey: ["orders", "recent"], queryFn: fetchRecentOrders },
        { queryKey: ["analytics", "overview"], queryFn: fetchAnalyticsOverview }
      );
    }

    if (currentPath.startsWith("/users")) {
      predictions.push(
        { queryKey: ["users"], queryFn: fetchUsers },
        { queryKey: ["users", "filters"], queryFn: fetchUserFilters }
      );
    }

    // Time-based predictions
    if (currentHour >= 9 && currentHour <= 17) {
      // Business hours
      predictions.push(
        { queryKey: ["notifications"], queryFn: fetchNotifications },
        { queryKey: ["dashboard", "realtime"], queryFn: fetchRealtimeStats }
      );
    }

    return predictions;
  };

  // Prefetch on hover (for links)
  const prefetchOnHover = useCallback(
    (
      path: string,
      dataQueries?: Array<{ queryKey: unknown[]; queryFn: () => Promise<any> }>
    ) => {
      return {
        onMouseEnter: () => {
          router.prefetch(path);
          dataQueries?.forEach(({ queryKey, queryFn }) => {
            queryClient.prefetchQuery({
              queryKey,
              queryFn,
              staleTime: 30 * 1000,
            });
          });
        },
      };
    },
    [router, queryClient]
  );

  // Prefetch on viewport (Intersection Observer)
  const prefetchOnViewport = useCallback(
    (
      path: string,
      dataQueries?: Array<{ queryKey: unknown[]; queryFn: () => Promise<any> }>
    ) => {
      return useCallback(
        (node: HTMLElement | null) => {
          if (!node) return;

          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  router.prefetch(path);
                  dataQueries?.forEach(({ queryKey, queryFn }) => {
                    queryClient.prefetchQuery({ queryKey, queryFn });
                  });
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.1 } // Trigger when 10% visible
          );

          observer.observe(node);

          return () => observer.disconnect();
        },
        [path, dataQueries]
      );
    },
    [router, queryClient]
  );

  // Auto-prefetch based on behavior patterns
  useEffect(() => {
    const interval = setInterval(() => {
      predictAndPrefetch();
    }, 30 * 1000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [predictAndPrefetch]);

  return {
    prefetchOnHover,
    prefetchOnViewport,
    predictAndPrefetch,
    userBehavior,

    // Manual prefetch functions
    prefetchUserDetails: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: ["user", userId],
        queryFn: () => fetchUser(userId),
      });
    },

    prefetchUserOrders: (userId: string) => {
      queryClient.prefetchQuery({
        queryKey: ["orders", "user", userId],
        queryFn: () => fetchUserOrders(userId),
      });
    },

    // Prefetch management
    clearPrefetches: () => {
      queryClient.removeQueries({
        predicate: (query) => {
          return (
            query.getObserversCount() === 0 && // No active observers
            query.state.dataUpdatedAt &&
            Date.now() - query.state.dataUpdatedAt > 5 * 60 * 1000
          ); // Older than 5 min
        },
      });
    },
  };
};

// Usage example in components
const UserCard = ({ user }: { user: User }) => {
  const { prefetchOnHover, prefetchUserDetails } = usePredictivePrefetching();

  return (
    <div
      {...prefetchOnHover(`/users/${user.id}`, [
        { queryKey: ["user", user.id], queryFn: () => fetchUser(user.id) },
        {
          queryKey: ["orders", "user", user.id],
          queryFn: () => fetchUserOrders(user.id),
        },
      ])}
      onClick={() => router.push(`/users/${user.id}`)}
    >
      {user.name}
    </div>
  );
};
```

---

_Esta documentación avanzada complementa la documentación básica y proporciona patrones de nivel enterprise para casos de uso complejos._
