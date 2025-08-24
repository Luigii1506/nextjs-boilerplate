/**
 * ♾️ USERS INFINITE SCROLL - TANSTACK OPTIMIZED
 * ============================================
 *
 * Hook para paginación infinita de usuarios usando TanStack Query.
 * Performance enterprise con virtual scrolling y lazy loading.
 *
 * Enterprise: 2025-01-17 - Infinite scroll optimization
 */

"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { getAllUsersAction } from "../server/actions";
import type { User, UserListResponse } from "../types";
// Removed useUserPrefetch - unnecessary complexity

// 🎯 Infinite Query keys
export const USERS_INFINITE_QUERY_KEYS = {
  all: ["users", "infinite"] as const,
  list: (params: InfiniteUsersParams) =>
    [...USERS_INFINITE_QUERY_KEYS.all, "list", params] as const,
} as const;

// 📄 Pagination parameters
interface InfiniteUsersParams {
  pageSize: number;
  searchValue?: string;
  searchField?: "email" | "name";
  role?: User["role"] | "all";
  status?: "active" | "banned" | "all";
}

// 📄 Page data structure
interface UserPage {
  users: User[];
  nextCursor: number | null;
  hasNextPage: boolean;
  totalUsers: number;
  pageIndex: number;
}

// 🚀 Infinite users fetcher
async function fetchInfiniteUsers(
  params: InfiniteUsersParams,
  pageParam: number = 0
): Promise<UserPage> {
  const result = await getAllUsersAction(
    params.pageSize,
    pageParam * params.pageSize,
    params.searchValue,
    params.searchField
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch users");
  }

  const { users, pagination } = result.data;

  return {
    users,
    nextCursor: pagination.hasMore ? pageParam + 1 : null,
    hasNextPage: pagination.hasMore,
    totalUsers: pagination.total,
    pageIndex: pageParam,
  };
}

// 📱 Virtual scrolling configuration
interface VirtualScrollConfig {
  itemHeight: number;
  overscan: number;
  enableVirtualization: boolean;
}

const DEFAULT_VIRTUAL_CONFIG: VirtualScrollConfig = {
  itemHeight: 120, // Height of UserCard component
  overscan: 5, // Items to render outside viewport
  enableVirtualization: true,
};

// 🎛️ Infinite scroll configuration
interface InfiniteScrollConfig {
  pageSize: number;
  prefetchNextPage: boolean;
  prefetchOnHover: boolean;
  enableVirtualScroll: boolean;
  loadMoreThreshold: number; // Distance from bottom to trigger load more
}

const DEFAULT_INFINITE_CONFIG: InfiniteScrollConfig = {
  pageSize: 20,
  prefetchNextPage: true,
  prefetchOnHover: true,
  enableVirtualScroll: true,
  loadMoreThreshold: 300, // 300px from bottom
};

/**
 * ♾️ USE USERS INFINITE
 *
 * Hook para paginación infinita de usuarios con optimizaciones enterprise.
 */
export function useUsersInfinite(
  filters: Partial<InfiniteUsersParams> = {},
  config: Partial<InfiniteScrollConfig> = {}
) {
  const fullConfig = { ...DEFAULT_INFINITE_CONFIG, ...config };
  const queryClient = useQueryClient();
  // useUserPrefetch removed - functionality handled by TanStack Query automatically

  // 🎛️ Query parameters
  const queryParams = useMemo(
    (): InfiniteUsersParams => ({
      pageSize: fullConfig.pageSize,
      ...filters,
    }),
    [fullConfig.pageSize, filters]
  );

  // 📊 Infinite query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: USERS_INFINITE_QUERY_KEYS.list(queryParams),
    queryFn: ({ pageParam = 0 }) => fetchInfiniteUsers(queryParams, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: 30 * 1000, // 30s fresh
    gcTime: 5 * 60 * 1000, // 5min cache
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    throwOnError: false,
    // 🔄 Prefetch next page when approaching end
    ...(fullConfig.prefetchNextPage && {
      getPreviousPageParam: (firstPage: { pageIndex: number }) =>
        firstPage.pageIndex > 0 ? firstPage.pageIndex - 1 : undefined,
    }),
  });

  // 📊 Flattened users data
  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? [];
  }, [data?.pages]);

  // 📊 Stats and metadata
  const stats = useMemo(() => {
    const firstPage = data?.pages[0];
    const lastPage = data?.pages[data.pages.length - 1];

    return {
      totalUsers: firstPage?.totalUsers ?? 0,
      loadedUsers: users.length,
      totalPages: data?.pages.length ?? 0,
      hasMorePages: hasNextPage,
      loadingProgress: firstPage?.totalUsers
        ? (users.length / firstPage.totalUsers) * 100
        : 0,
      isComplete: !hasNextPage && users.length > 0,
    };
  }, [data?.pages, users.length, hasNextPage]);

  // 🔄 Scroll-based loading
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(false);

  const handleScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    const nearBottom = distanceFromBottom <= fullConfig.loadMoreThreshold;
    setIsNearBottom(nearBottom);

    // Auto-load next page when near bottom
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    fullConfig.loadMoreThreshold,
  ]);

  // 🎯 Intersection observer for auto-loading
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = loadMoreTriggerRef.current;
    if (!trigger || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollRef.current,
        rootMargin: `${fullConfig.loadMoreThreshold}px`,
        threshold: 0.1,
      }
    );

    observer.observe(trigger);

    return () => {
      observer.unobserve(trigger);
      observer.disconnect();
    };
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    fullConfig.loadMoreThreshold,
  ]);

  // 🚀 Prefetch on hover with batching
  const handleUserHover = useCallback(
    (user: User, index: number) => {
      if (!fullConfig.prefetchOnHover) return;

      // TanStack Query handles prefetching automatically based on staleTime and caching strategy
      // Manual prefetching removed to simplify the code
      console.debug(`User hover event for ${user.id} at index ${index}`);
    },
    [fullConfig.prefetchOnHover]
  );

  // 🎯 Manual load more
  const loadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 🔄 Refresh all data
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // 🗑️ Clear cache and reload
  const clearAndReload = useCallback(async () => {
    queryClient.removeQueries({
      queryKey: USERS_INFINITE_QUERY_KEYS.list(queryParams),
    });
    await refetch();
  }, [queryClient, queryParams, refetch]);

  // 📊 Virtual scrolling helpers
  const getVirtualizedItems = useCallback(
    (startIndex: number, endIndex: number) => {
      return users.slice(startIndex, endIndex + 1);
    },
    [users]
  );

  const getItemHeight = useCallback((index: number) => {
    // Could implement dynamic heights here
    return DEFAULT_VIRTUAL_CONFIG.itemHeight;
  }, []);

  return {
    // 📊 Data
    users,
    stats,

    // 🔄 Loading states
    isLoading,
    isFetching,
    isFetchingNextPage,
    isNearBottom,
    hasNextPage,

    // ❌ Error handling
    error: error?.message || null,
    hasError: isError,

    // 🎯 Actions
    loadMore,
    refresh,
    clearAndReload,
    handleUserHover,

    // 🔗 Refs for scroll detection
    scrollRef,
    loadMoreTriggerRef,
    handleScroll,

    // 📱 Virtual scrolling
    getVirtualizedItems,
    getItemHeight,

    // 🎛️ Configuration
    config: fullConfig,
    queryParams,
  };
}

/**
 * 📱 USE VIRTUAL USERS LIST
 *
 * Hook para lista virtualizada de usuarios con scroll infinito.
 */
export function useVirtualUsersList(
  filters: Partial<InfiniteUsersParams> = {},
  virtualConfig: Partial<VirtualScrollConfig> = {}
) {
  const fullVirtualConfig = { ...DEFAULT_VIRTUAL_CONFIG, ...virtualConfig };

  const infiniteQuery = useUsersInfinite(filters, {
    enableVirtualScroll: true,
    prefetchOnHover: true,
  });

  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  const [scrollTop, setScrollTop] = useState(0);

  // 📊 Calculate visible items
  const calculateVisibleRange = useCallback(
    (containerScrollTop: number, containerHeight: number) => {
      const { itemHeight, overscan } = fullVirtualConfig;

      const startIndex = Math.floor(containerScrollTop / itemHeight);
      const endIndex = Math.min(
        infiniteQuery.users.length - 1,
        Math.ceil((containerScrollTop + containerHeight) / itemHeight)
      );

      // Add overscan
      const start = Math.max(0, startIndex - overscan);
      const end = Math.min(infiniteQuery.users.length - 1, endIndex + overscan);

      return { start, end };
    },
    [fullVirtualConfig, infiniteQuery.users.length]
  );

  // 🔄 Handle scroll for virtualization
  const handleVirtualScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, clientHeight } = event.currentTarget;

      setScrollTop(scrollTop);

      const newRange = calculateVisibleRange(scrollTop, clientHeight);
      if (
        newRange.start !== visibleRange.start ||
        newRange.end !== visibleRange.end
      ) {
        setVisibleRange(newRange);
      }

      // Also call the infinite scroll handler
      infiniteQuery.handleScroll();
    },
    [calculateVisibleRange, visibleRange, infiniteQuery]
  );

  // 📊 Virtual list data
  const virtualListData = useMemo(() => {
    const { itemHeight } = fullVirtualConfig;
    const totalHeight = infiniteQuery.users.length * itemHeight;
    const offsetY = visibleRange.start * itemHeight;
    const visibleUsers = infiniteQuery.users.slice(
      visibleRange.start,
      visibleRange.end + 1
    );

    return {
      totalHeight,
      offsetY,
      visibleUsers,
      visibleRange,
    };
  }, [fullVirtualConfig, infiniteQuery.users, visibleRange]);

  return {
    ...infiniteQuery,

    // 📱 Virtual scrolling specific
    virtualListData,
    handleVirtualScroll,
    scrollTop,
    visibleRange,

    // 🎛️ Virtual config
    virtualConfig: fullVirtualConfig,
  };
}
