/**
 * 👥 USERS QUERY HOOK - TANSTACK OPTIMIZED
 * =========================================
 *
 * Hook súper optimizado usando TanStack Query.
 * Performance enterprise, battle-tested, cero parpadeos.
 *
 * Enterprise: 2025-01-17 - TanStack Query integration
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";
import {
  getAllUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  banUserAction,
  unbanUserAction,
} from "../server/actions";
import type { User, CreateUserForm } from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Query keys
const USERS_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all, "list"] as const,
  list: (filters: Record<string, unknown>) =>
    [...USERS_QUERY_KEYS.lists(), filters] as const,
  details: () => [...USERS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
} as const;

// 🚀 Users fetcher function
async function fetchUsers(): Promise<User[]> {
  const result = await getAllUsersAction(100, 0); // Get more users for better caching
  if (!result.success || !result.data) {
    throw new Error(result.error || "Failed to fetch users");
  }
  return result.data.users;
}

/**
 * 👥 USE USERS QUERY
 *
 * Hook principal para obtener users con TanStack Query.
 * Incluye cache inteligente, background updates, optimistic mutations.
 */
export function useUsersQuery() {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  // 📊 Main users query
  const {
    data: users = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: USERS_QUERY_KEYS.lists(),
    queryFn: fetchUsers,
    staleTime: 30 * 1000, // 30s fresh
    gcTime: 5 * 60 * 1000, // 5min cache
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    throwOnError: false,
  });

  // 📊 Computed stats
  const stats = useMemo(() => {
    if (!users || users.length === 0) {
      return {
        total: 0,
        active: 0,
        banned: 0,
        admins: 0,
        activePercentage: 0,
        adminPercentage: 0,
      };
    }

    const total = users.length;
    const active = users.filter((user) => !user.banned).length;
    const banned = users.filter((user) => user.banned).length;
    const admins = users.filter(
      (user) => user.role === "admin" || user.role === "super_admin"
    ).length;

    return {
      total,
      active,
      banned,
      admins,
      activePercentage: total > 0 ? (active / total) * 100 : 0,
      adminPercentage: total > 0 ? (admins / total) * 100 : 0,
    };
  }, [users]);

  // ➕ Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      formData.append("role", userData.role);

      const result = await createUserAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (newUser) => {
      // 🎯 Optimistic update
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🚀 Optimistic user
      const optimisticUser: User = {
        id: `temp-${Date.now()}`,
        name: newUser.name,
        email: newUser.email,
        emailVerified: false,
        role: newUser.role,
        image: null,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.lists(), (old) => [
        ...(old || []),
        optimisticUser,
      ]);

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // 🔙 Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      // 🔄 Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // ✏️ Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({
      userId,
      ...userData
    }: { userId: string } & Partial<User>) => {
      const formData = new FormData();
      formData.append("id", userId);
      Object.entries(userData).forEach(([key, value]) => {
        if (value != null) formData.append(key, String(value));
      });

      const result = await updateUserAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async ({ userId, ...updates }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🎯 Optimistic update
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === userId ? { ...user, ...updates } : user
          ) || []
      );

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 🗑️ Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Create FormData with correct field name
      const formData = new FormData();
      formData.append("userId", userId); // ✅ Fixed: Use 'userId' instead of 'id'

      const result = await deleteUserAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🎯 Optimistic removal
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) => old?.filter((user) => user.id !== userId) || []
      );

      return { previousUsers };
    },
    onError: (err, userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 🚫 Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async ({
      userId,
      reason,
    }: {
      userId: string;
      reason: string;
    }) => {
      const formData = new FormData();
      formData.append("id", userId);
      formData.append("reason", reason);

      const result = await banUserAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async ({ userId, reason }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🎯 Optimistic ban
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === userId
              ? { ...user, banned: true, banReason: reason, banExpires: null }
              : user
          ) || []
      );

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // ✅ Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const formData = new FormData();
      formData.append("id", userId);

      const result = await unbanUserAction(formData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🎯 Optimistic unban
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((user) =>
            user.id === userId
              ? { ...user, banned: false, banReason: null, banExpires: null }
              : user
          ) || []
      );

      return { previousUsers };
    },
    onError: (err, userId, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 🔍 Filter functions with memoization
  const searchUsers = useCallback(
    (searchTerm: string) => {
      if (!searchTerm) return users;
      const term = searchTerm.toLowerCase();
      return users.filter(
        (user) =>
          user.name.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
      );
    },
    [users]
  );

  const filterUsersByRole = useCallback(
    (role: User["role"]) => {
      return users.filter((user) => user.role === role);
    },
    [users]
  );

  const filterUsersByStatus = useCallback(
    (status: "active" | "banned") => {
      return users.filter((user) =>
        status === "active" ? !user.banned : user.banned
      );
    },
    [users]
  );

  // 🎯 Action wrappers with notifications
  const createUser = useCallback(
    async (userData: CreateUserForm) => {
      await notify(
        () => createUserMutation.mutateAsync(userData),
        "Creando usuario...",
        "Usuario creado exitosamente"
      );
    },
    [createUserMutation, notify]
  );

  const updateUser = useCallback(
    async (userId: string, updates: Partial<User>) => {
      await notify(
        () => updateUserMutation.mutateAsync({ userId, ...updates }),
        "Actualizando usuario...",
        "Usuario actualizado exitosamente"
      );
    },
    [updateUserMutation, notify]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      await notify(
        () => deleteUserMutation.mutateAsync(userId),
        "Eliminando usuario...",
        "Usuario eliminado exitosamente"
      );
    },
    [deleteUserMutation, notify]
  );

  const banUser = useCallback(
    async (userId: string, reason?: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      // 🚫 Pedir razón si no se proporciona
      const banReason =
        reason ||
        prompt("🚫 Razón del baneo:", "Violación de términos de servicio");

      if (!banReason || banReason.trim() === "") {
        // Usuario canceló o no proporcionó razón
        return;
      }

      await notify(
        () => banUserMutation.mutateAsync({ userId, reason: banReason.trim() }),
        "Baneando usuario...",
        `Usuario baneado exitosamente: ${banReason.trim()}`
      );
    },
    [users, banUserMutation, notify]
  );

  const unbanUser = useCallback(
    async (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      await notify(
        () => unbanUserMutation.mutateAsync(userId),
        "Desbaneando usuario...",
        "Usuario desbaneado exitosamente"
      );
    },
    [users, unbanUserMutation, notify]
  );

  // 🔄 Toggle ban (backward compatibility)
  const toggleBanUser = useCallback(
    async (userId: string) => {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      if (user.banned) {
        await unbanUser(userId);
      } else {
        await banUser(userId);
      }
    },
    [users, banUser, unbanUser]
  );

  return {
    // 📊 Data
    users,
    stats,

    // 🔄 States
    isLoading,
    isFetching,
    isValidating: isFetching && !isLoading,
    error: error?.message || null,
    hasError: isError,

    // 🔍 Filters
    searchUsers,
    filterUsersByRole,
    filterUsersByStatus,

    // 🎯 Actions
    createUser,
    updateUser,
    deleteUser,
    banUser,
    unbanUser,
    toggleBanUser, // Backward compatibility
    refresh: refetch,

    // 🔄 Mutation states
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
    isBanning: banUserMutation.isPending,
    isUnbanning: unbanUserMutation.isPending,
  };
}
