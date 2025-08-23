/**
 * 🎯 USERS HOOKS INDEX - TANSTACK ONLY
 * ====================================
 *
 * Solo hooks optimizados con TanStack Query.
 * Zero legacy code, máxima performance enterprise.
 *
 * Enterprise: 2025-01-17 - Complete modern architecture
 */

// 🎯 Core TanStack Query hooks
export { useUsersQuery } from "./useUsersQuery";
// 🔍 User details now handled directly by useUsersQuery - no separate hook needed
export { useUserModal } from "./useUserModal";

// 🔍 Search and filtering
export {
  useUsersSearch,
  useQuickSearch,
  useSearchFilters,
  USERS_SEARCH_QUERY_KEYS,
} from "./useUsersSearch";

// ♾️ Infinite scroll and pagination
export {
  useUsersInfinite,
  useVirtualUsersList,
  USERS_INFINITE_QUERY_KEYS,
} from "./useUsersInfinite";

// 📦 Bulk operations
export {
  useUsersBulk,
  useBulkSelection,
  type BulkOperation,
} from "./useUsersBulk";

// 🗄️ Advanced cache management
// 🗄️ Cache management now handled by TanStack Query automatically

// 🎯 Centralized query keys
export const USER_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_QUERY_KEYS.all, "list"] as const,
  details: () => [...USER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_QUERY_KEYS.details(), id] as const,
  searches: () => [...USER_QUERY_KEYS.all, "search"] as const,
  search: (params: Record<string, unknown>) =>
    [...USER_QUERY_KEYS.searches(), params] as const,
  infinite: () => [...USER_QUERY_KEYS.all, "infinite"] as const,
  infiniteList: (params: Record<string, unknown>) =>
    [...USER_QUERY_KEYS.infinite(), "list", params] as const,
} as const;

// 🎛️ Hook configuration presets
export const UserHookConfigs = {
  // 💻 Standard admin panel configuration
  ADMIN_PANEL: {
    usersQuery: {
      staleTime: 30000,
      refetchOnWindowFocus: true,
    },
    search: {
      debounceMs: 300,
      enableSuggestions: true,
      enablePrefetch: true,
    },
    bulk: {
      maxBatchSize: 50,
      confirmBulkActions: true,
    },
    cache: {
      strategy: "balanced" as const,
    },
  },

  // 📱 Mobile optimized configuration
  MOBILE_OPTIMIZED: {
    infinite: {
      pageSize: 15,
      enableVirtualScroll: true,
    },
    search: {
      debounceMs: 500, // Slower for mobile
      enableSuggestions: false,
    },
    cache: {
      strategy: "conservative" as const,
    },
  },

  // ⚡ High performance configuration
  HIGH_PERFORMANCE: {
    usersQuery: {
      staleTime: 5000,
      refetchInterval: 10000,
    },
    virtual: {
      enableVirtualization: true,
      itemHeight: 120,
    },
    cache: {
      strategy: "aggressive" as const,
      enableBackgroundUpdates: true,
      enablePredictivePrefetch: true,
    },
  },
} as const;

// 🛠️ Hook utilities and metadata
export const UserHookUtils = {
  // 🎯 Available hooks registry
  HOOKS_REGISTRY: {
    core: ["useUsersQuery", "useUserModal"],
    search: ["useUsersSearch", "useQuickSearch", "useSearchFilters"],
    infinite: ["useUsersInfinite", "useVirtualUsersList"],
    bulk: ["useUsersBulk", "useBulkSelection"],
    cache: [], // TanStack Query handles caching automatically
  } as const,

  // 📊 Performance profiles
  PERFORMANCE_PROFILES: {
    useUsersQuery: { memory: "medium", cpu: "low", network: "medium" },
    useUsersInfinite: { memory: "high", cpu: "medium", network: "low" },
    useUsersSearch: { memory: "low", cpu: "medium", network: "high" },
    useUsersBulk: { memory: "medium", cpu: "high", network: "high" },
    // Cache management moved to TanStack Query configuration
  } as const,

  // 🎯 Get performance profile helper
  getPerformanceProfile: (
    hookName: keyof typeof UserHookUtils.PERFORMANCE_PROFILES
  ) => {
    return (
      UserHookUtils.PERFORMANCE_PROFILES[hookName] || {
        memory: "unknown",
        cpu: "unknown",
        network: "unknown",
      }
    );
  },
} as const;

// 📝 Type exports
export type {
  User,
  CreateUserForm,
  EditUserForm,
  BanUserForm,
  UserStats,
  UserFilters,
} from "../types";

// 🎯 Default export - Configuration registry
export default {
  configs: UserHookConfigs,
  utils: UserHookUtils,
  queryKeys: USER_QUERY_KEYS,
} as const;
