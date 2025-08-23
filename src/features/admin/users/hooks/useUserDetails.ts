/**
 * 👤 USER DETAILS HOOK - TANSTACK OPTIMIZED
 * =========================================
 *
 * Hook para obtener detalles individuales de usuario con prefetching.
 * Performance enterprise con cache inteligente.
 *
 * Enterprise: 2025-01-17 - Individual user details optimization
 */

"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import { getUserDetailsAction } from "../server/actions";
import type { User } from "../types";

// 🎯 Query keys
export const USER_DETAILS_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USER_DETAILS_QUERY_KEYS.all, "list"] as const,
  details: () => [...USER_DETAILS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USER_DETAILS_QUERY_KEYS.details(), id] as const,
} as const;

// 🚀 User details fetcher function
async function fetchUserDetails(userId: string): Promise<User> {
  const result = await getUserDetailsAction(userId);
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch user details");
  }
  return result.data;
}

/**
 * 👤 USE USER DETAILS
 *
 * Hook para obtener detalles de un usuario específico.
 * Incluye prefetching inteligente y sincronización con la lista.
 */
export function useUserDetails(userId?: string) {
  const queryClient = useQueryClient();

  // 📊 User details query
  const {
    data: user,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: USER_DETAILS_QUERY_KEYS.detail(userId!),
    queryFn: () => fetchUserDetails(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30s fresh
    gcTime: 5 * 60 * 1000, // 5min cache
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: false, // Don't refetch on focus for details
    refetchOnMount: true,
    throwOnError: false,
    // 🎯 Initial data from users list if available
    initialData: () => {
      if (!userId) return undefined;
      const usersList = queryClient.getQueryData<User[]>(
        USER_DETAILS_QUERY_KEYS.lists()
      );
      return usersList?.find((user) => user.id === userId);
    },
    // 🔄 Keep initial data fresh by refetching
    initialDataUpdatedAt: () => {
      const queryState = queryClient.getQueryState(
        USER_DETAILS_QUERY_KEYS.lists()
      );
      return queryState?.dataUpdatedAt;
    },
  });

  // 📊 Enhanced user data with computed properties
  const enhancedUser = useMemo(() => {
    if (!user) return null;

    const now = new Date();
    const createdAt = new Date(user.createdAt);
    const daysSinceCreated = Math.floor(
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      ...user,
      // 📊 Computed properties
      computed: {
        isNewUser: daysSinceCreated <= 7,
        accountAge: {
          days: daysSinceCreated,
          formatted:
            daysSinceCreated < 30
              ? `${daysSinceCreated} días`
              : daysSinceCreated < 365
              ? `${Math.floor(daysSinceCreated / 30)} meses`
              : `${Math.floor(daysSinceCreated / 365)} años`,
        },
        statusText: user.banned ? "Baneado" : "Activo",
        roleText:
          user.role === "admin"
            ? "Administrador"
            : user.role === "super_admin"
            ? "Super Administrador"
            : "Usuario",
        canBeDeleted: user.role !== "super_admin",
        canBeModified: true, // Could add more complex logic here
      },
    };
  }, [user]);

  return {
    // 📊 Data
    user: enhancedUser,
    rawUser: user,

    // 🔄 States
    isLoading,
    isFetching,
    isValidating: isFetching && !isLoading,
    error: error?.message || null,
    hasError: isError,
    exists: !!user,

    // 🔄 Actions
    refresh: refetch,
  };
}

/**
 * 🎯 USE USER PREFETCH
 *
 * Hook para prefetch de usuarios con estrategias inteligentes.
 */
export function useUserPrefetch() {
  const queryClient = useQueryClient();

  // 🚀 Prefetch user details
  const prefetchUser = useCallback(
    async (userId: string) => {
      await queryClient.prefetchQuery({
        queryKey: USER_DETAILS_QUERY_KEYS.detail(userId),
        queryFn: () => fetchUserDetails(userId),
        staleTime: 30 * 1000,
      });
    },
    [queryClient]
  );

  // 🎯 Prefetch user on hover (optimistic prefetching)
  const prefetchUserOnHover = useCallback(
    (userId: string) => {
      // Only prefetch if not already cached
      const existingData = queryClient.getQueryData(
        USER_DETAILS_QUERY_KEYS.detail(userId)
      );
      if (!existingData) {
        prefetchUser(userId);
      }
    },
    [prefetchUser, queryClient]
  );

  // 📊 Prefetch multiple users (batch prefetching)
  const prefetchUsers = useCallback(
    async (userIds: string[]) => {
      const promises = userIds.map((userId) => {
        const existingData = queryClient.getQueryData(
          USER_DETAILS_QUERY_KEYS.detail(userId)
        );
        return existingData ? Promise.resolve() : prefetchUser(userId);
      });

      await Promise.allSettled(promises);
    },
    [prefetchUser, queryClient]
  );

  // 🔄 Prefetch related users (users with same role, etc.)
  const prefetchRelatedUsers = useCallback(
    async (user: User) => {
      const usersList = queryClient.getQueryData<User[]>(
        USER_DETAILS_QUERY_KEYS.lists()
      );
      if (!usersList) return;

      // Prefetch users with same role
      const sameRoleUsers = usersList
        .filter((u) => u.role === user.role && u.id !== user.id)
        .slice(0, 3); // Limit to avoid too many requests

      await prefetchUsers(sameRoleUsers.map((u) => u.id));
    },
    [prefetchUsers, queryClient]
  );

  return {
    prefetchUser,
    prefetchUserOnHover,
    prefetchUsers,
    prefetchRelatedUsers,
  };
}

/**
 * 📊 USE USER DETAILS UTILS
 *
 * Utilidades para manejo de cache y sincronización de user details.
 */
export function useUserDetailsUtils() {
  const queryClient = useQueryClient();

  // 🔄 Invalidate user details
  const invalidateUser = useCallback(
    async (userId: string) => {
      await queryClient.invalidateQueries({
        queryKey: USER_DETAILS_QUERY_KEYS.detail(userId),
      });
    },
    [queryClient]
  );

  // 🗑️ Remove user from cache
  const removeUserFromCache = useCallback(
    (userId: string) => {
      queryClient.removeQueries({
        queryKey: USER_DETAILS_QUERY_KEYS.detail(userId),
      });
    },
    [queryClient]
  );

  // 🔄 Update user in cache
  const updateUserInCache = useCallback(
    (userId: string, updater: (user: User) => User) => {
      queryClient.setQueryData<User>(
        USER_DETAILS_QUERY_KEYS.detail(userId),
        (old) => (old ? updater(old) : undefined)
      );

      // Also update in lists cache if present
      queryClient.setQueryData<User[]>(USER_DETAILS_QUERY_KEYS.lists(), (old) =>
        old?.map((user) => (user.id === userId ? updater(user) : user))
      );
    },
    [queryClient]
  );

  // 📊 Get cached user data
  const getCachedUser = useCallback(
    (userId: string): User | undefined => {
      return queryClient.getQueryData<User>(
        USER_DETAILS_QUERY_KEYS.detail(userId)
      );
    },
    [queryClient]
  );

  // 🔄 Sync user with list
  const syncUserWithList = useCallback(
    (user: User) => {
      // Update the user in the main users list
      queryClient.setQueryData<User[]>(
        USER_DETAILS_QUERY_KEYS.lists(),
        (old) => old?.map((u) => (u.id === user.id ? user : u)) || [user]
      );
    },
    [queryClient]
  );

  return {
    invalidateUser,
    removeUserFromCache,
    updateUserInCache,
    getCachedUser,
    syncUserWithList,
  };
}
