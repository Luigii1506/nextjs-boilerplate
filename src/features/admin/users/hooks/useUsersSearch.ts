/**
 * 🔍 USERS SEARCH HOOK - TANSTACK OPTIMIZED
 * =========================================
 *
 * Hook súper optimizado para búsqueda de usuarios con debouncing.
 * Performance enterprise con cache inteligente y search suggestions.
 *
 * Enterprise: 2025-01-17 - Advanced search optimization
 */

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { getAllUsersAction } from "../server/actions";
import type { User, UserSearchParams } from "../types";
import { useUserPrefetch } from "./useUserDetails";

// 🎯 Search Query keys
export const USERS_SEARCH_QUERY_KEYS = {
  all: ["users", "search"] as const,
  searches: () => [...USERS_SEARCH_QUERY_KEYS.all, "searches"] as const,
  search: (params: UserSearchParams) =>
    [...USERS_SEARCH_QUERY_KEYS.searches(), params] as const,
  suggestions: () => [...USERS_SEARCH_QUERY_KEYS.all, "suggestions"] as const,
} as const;

// 🚀 Search fetcher function
async function searchUsers(params: UserSearchParams): Promise<User[]> {
  const result = await getAllUsersAction(
    params.limit,
    params.offset,
    params.searchValue,
    params.searchField
  );

  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to search users");
  }

  return result.data.users;
}

// 🎛️ Search configuration
interface SearchConfig {
  debounceMs: number;
  minSearchLength: number;
  maxSuggestions: number;
  enablePrefetch: boolean;
  enableSuggestions: boolean;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  debounceMs: 300,
  minSearchLength: 2,
  maxSuggestions: 5,
  enablePrefetch: true,
  enableSuggestions: true,
};

/**
 * 🔍 USE USERS SEARCH
 *
 * Hook avanzado para búsqueda de usuarios con debouncing, suggestions y prefetching.
 */
export function useUsersSearch(config: Partial<SearchConfig> = {}) {
  const fullConfig = { ...DEFAULT_SEARCH_CONFIG, ...config };
  const queryClient = useQueryClient();
  const { prefetchUserOnHover } = useUserPrefetch();

  // 🎛️ Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<"email" | "name">("name");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 🕐 Debouncing timer
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  // 🔄 Debounce search term
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    setIsSearching(true);

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);

      // Add to search history if valid search
      if (
        searchTerm.length >= fullConfig.minSearchLength &&
        !searchHistory.includes(searchTerm)
      ) {
        setSearchHistory((prev) => [searchTerm, ...prev].slice(0, 10)); // Keep last 10 searches
      }
    }, fullConfig.debounceMs);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    searchTerm,
    fullConfig.debounceMs,
    fullConfig.minSearchLength,
    searchHistory,
  ]);

  // 🔍 Search parameters
  const searchParams = useMemo((): UserSearchParams | null => {
    if (debouncedSearchTerm.length < fullConfig.minSearchLength) {
      return null;
    }

    return {
      limit: 50, // Get more results for better UX
      offset: 0,
      searchValue: debouncedSearchTerm.trim(),
      searchField,
    };
  }, [debouncedSearchTerm, searchField, fullConfig.minSearchLength]);

  // 📊 Search results query
  const {
    data: searchResults = [],
    isLoading: isLoadingResults,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: searchParams
      ? USERS_SEARCH_QUERY_KEYS.search(searchParams)
      : ["no-search"],
    queryFn: () => searchUsers(searchParams!),
    enabled: !!searchParams,
    staleTime: 2 * 60 * 1000, // 2min - search results can be cached longer
    gcTime: 5 * 60 * 1000, // 5min cache
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });

  // 💡 Search suggestions from cache
  const suggestions = useMemo(() => {
    if (!fullConfig.enableSuggestions || searchTerm.length < 1) {
      return [];
    }

    // Get all cached users to build suggestions
    const cachedUsers = queryClient.getQueryData<User[]>(["users", "list"]);
    if (!cachedUsers) return searchHistory.slice(0, fullConfig.maxSuggestions);

    // Build suggestions from cached users
    const term = searchTerm.toLowerCase();
    const userSuggestions = cachedUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      )
      .slice(0, fullConfig.maxSuggestions)
      .map((user) => (searchField === "email" ? user.email : user.name));

    // Combine with search history
    const historySuggestions = searchHistory
      .filter((h) => h.toLowerCase().includes(term))
      .slice(
        0,
        Math.max(0, fullConfig.maxSuggestions - userSuggestions.length)
      );

    return [...new Set([...userSuggestions, ...historySuggestions])];
  }, [
    searchTerm,
    searchField,
    searchHistory,
    queryClient,
    fullConfig.enableSuggestions,
    fullConfig.maxSuggestions,
  ]);

  // 🎯 Search actions
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const updateSearchField = useCallback(
    (field: "email" | "name") => {
      setSearchField(field);
      // Trigger new search with new field
      if (debouncedSearchTerm.length >= fullConfig.minSearchLength) {
        setDebouncedSearchTerm(""); // Reset to trigger new search
        setTimeout(() => setDebouncedSearchTerm(searchTerm), 50);
      }
    },
    [searchTerm, debouncedSearchTerm, fullConfig.minSearchLength]
  );

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setIsSearching(false);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    setSearchTerm(suggestion);
    setDebouncedSearchTerm(suggestion);
    setIsSearching(false);
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // 🚀 Prefetch on hover
  const handleResultHover = useCallback(
    (user: User) => {
      if (fullConfig.enablePrefetch) {
        prefetchUserOnHover(user.id);
      }
    },
    [prefetchUserOnHover, fullConfig.enablePrefetch]
  );

  // 📊 Search stats
  const searchStats = useMemo(() => {
    return {
      hasSearchTerm: searchTerm.length > 0,
      hasValidSearchTerm: searchTerm.length >= fullConfig.minSearchLength,
      isSearching: isSearching || isFetching,
      hasResults: searchResults.length > 0,
      resultCount: searchResults.length,
      hasError: isError,
      hasSuggestions: suggestions.length > 0,
      suggestionsCount: suggestions.length,
      historyCount: searchHistory.length,
    };
  }, [
    searchTerm,
    fullConfig.minSearchLength,
    isSearching,
    isFetching,
    searchResults.length,
    isError,
    suggestions.length,
    searchHistory.length,
  ]);

  return {
    // 🔍 Search state
    searchTerm,
    debouncedSearchTerm,
    searchField,
    isSearching: isSearching || isLoadingResults,
    isFetching,

    // 📊 Results
    results: searchResults,
    suggestions,
    searchHistory,
    stats: searchStats,

    // ❌ Error handling
    error: error?.message || null,
    hasError: isError,

    // 🎯 Actions
    updateSearchTerm,
    updateSearchField,
    clearSearch,
    selectSuggestion,
    clearSearchHistory,
    handleResultHover,
    refresh: refetch,

    // 🎛️ Config
    config: fullConfig,
  };
}

/**
 * 🔍 USE QUICK SEARCH
 *
 * Hook simplificado para búsqueda rápida sin configuración avanzada.
 */
export function useQuickSearch() {
  return useUsersSearch({
    debounceMs: 200,
    minSearchLength: 1,
    enableSuggestions: false,
    enablePrefetch: false,
  });
}

/**
 * 📱 USE SEARCH FILTERS
 *
 * Hook para filtros de búsqueda avanzada.
 */
export function useSearchFilters() {
  const [roleFilter, setRoleFilter] = useState<User["role"] | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"active" | "banned" | "all">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  const filterResults = useCallback(
    (users: User[]): User[] => {
      return users.filter((user) => {
        // Role filter
        if (roleFilter !== "all" && user.role !== roleFilter) return false;

        // Status filter
        if (statusFilter === "active" && user.banned) return false;
        if (statusFilter === "banned" && !user.banned) return false;

        // Date filter
        if (dateFilter !== "all") {
          const userDate = new Date(user.createdAt);
          const now = new Date();
          const timeDiff = now.getTime() - userDate.getTime();
          const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

          switch (dateFilter) {
            case "today":
              if (daysDiff > 0) return false;
              break;
            case "week":
              if (daysDiff > 7) return false;
              break;
            case "month":
              if (daysDiff > 30) return false;
              break;
          }
        }

        return true;
      });
    },
    [roleFilter, statusFilter, dateFilter]
  );

  const clearFilters = useCallback(() => {
    setRoleFilter("all");
    setStatusFilter("all");
    setDateFilter("all");
  }, []);

  const hasActiveFilters =
    roleFilter !== "all" || statusFilter !== "all" || dateFilter !== "all";

  return {
    // 🎛️ Filter states
    roleFilter,
    statusFilter,
    dateFilter,

    // 🎯 Actions
    setRoleFilter,
    setStatusFilter,
    setDateFilter,
    clearFilters,
    filterResults,

    // 📊 Status
    hasActiveFilters,
  };
}
