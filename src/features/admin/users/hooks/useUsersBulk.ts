/**
 * 📦 USERS BULK OPERATIONS - TANSTACK OPTIMIZED
 * =============================================
 *
 * Hook para operaciones masivas de usuarios con optimistic updates.
 * Performance enterprise con progress tracking y rollback automático.
 *
 * Enterprise: 2025-01-17 - Bulk operations optimization
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import { updateUserAction, deleteUserAction } from "../server/actions";
import type { User } from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Query keys (matching existing patterns)
const USERS_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all, "list"] as const,
} as const;

// 📦 Bulk operation types
export type BulkOperation =
  | "delete"
  | "ban"
  | "unban"
  | "role_change"
  | "activate"
  | "deactivate";

// 📊 Bulk operation config
interface BulkOperationConfig {
  operation: BulkOperation;
  userIds: string[];
  newRole?: User["role"];
  banReason?: string;
}

// 📈 Progress tracking
interface BulkProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  percentage: number;
  errors: Array<{ userId: string; error: string; user: User }>;
}

// 🎯 Bulk result
interface BulkResult {
  success: boolean;
  progress: BulkProgress;
  successfulIds: string[];
  failedIds: string[];
  errors: Array<{ userId: string; error: string }>;
}

/**
 * 📦 USE USERS BULK OPERATIONS
 *
 * Hook para operaciones masivas de usuarios con tracking detallado.
 */
export function useUsersBulk() {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  // 📊 Progress state
  const [currentOperation, setCurrentOperation] =
    useState<BulkOperation | null>(null);
  const [progress, setProgress] = useState<BulkProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: 0,
    percentage: 0,
    errors: [],
  });

  // 🚀 Execute single user operation
  const executeSingleOperation = useCallback(
    async (
      config: BulkOperationConfig,
      userId: string,
      user: User
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const formData = new FormData();
        formData.append("id", userId);

        switch (config.operation) {
          case "delete":
            const deleteResult = await deleteUserAction(formData);
            if (!deleteResult.success) throw new Error(deleteResult.error);
            break;

          case "ban":
          case "unban":
            formData.append(
              "banned",
              config.operation === "ban" ? "true" : "false"
            );
            if (config.operation === "ban" && config.banReason) {
              formData.append("banReason", config.banReason);
            }
            const banResult = await updateUserAction(formData);
            if (!banResult.success) throw new Error(banResult.error);
            break;

          case "role_change":
            if (!config.newRole) throw new Error("New role is required");
            formData.append("role", config.newRole);
            const roleResult = await updateUserAction(formData);
            if (!roleResult.success) throw new Error(roleResult.error);
            break;

          case "activate":
          case "deactivate":
            formData.append(
              "banned",
              config.operation === "deactivate" ? "true" : "false"
            );
            const statusResult = await updateUserAction(formData);
            if (!statusResult.success) throw new Error(statusResult.error);
            break;

          default:
            throw new Error(`Unsupported operation: ${config.operation}`);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    []
  );

  // 🎯 Apply optimistic updates
  const applyOptimisticUpdates = useCallback(
    (config: BulkOperationConfig, users: User[]) => {
      const userIds = new Set(config.userIds);

      return users.map((user) => {
        if (!userIds.has(user.id)) return user;

        // Apply optimistic changes based on operation
        switch (config.operation) {
          case "delete":
            // Will be removed from list, no update needed
            return user;

          case "ban":
            return {
              ...user,
              banned: true,
              banReason: config.banReason || "Banned via bulk operation",
              banExpires: null,
              updatedAt: new Date().toISOString(),
            };

          case "unban":
            return {
              ...user,
              banned: false,
              banReason: null,
              banExpires: null,
              updatedAt: new Date().toISOString(),
            };

          case "role_change":
            return {
              ...user,
              role: config.newRole || user.role,
              updatedAt: new Date().toISOString(),
            };

          case "activate":
            return {
              ...user,
              banned: false,
              updatedAt: new Date().toISOString(),
            };

          case "deactivate":
            return {
              ...user,
              banned: true,
              updatedAt: new Date().toISOString(),
            };

          default:
            return user;
        }
      });
    },
    []
  );

  // 📦 Bulk operation mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async (config: BulkOperationConfig): Promise<BulkResult> => {
      setCurrentOperation(config.operation);

      // Get current users list
      const currentUsers =
        queryClient.getQueryData<User[]>(USERS_QUERY_KEYS.lists()) || [];
      const targetUsers = currentUsers.filter((user) =>
        config.userIds.includes(user.id)
      );

      // Initialize progress
      const initialProgress: BulkProgress = {
        total: config.userIds.length,
        completed: 0,
        failed: 0,
        inProgress: config.userIds.length,
        percentage: 0,
        errors: [],
      };
      setProgress(initialProgress);

      // Track results
      const results: Array<{
        userId: string;
        success: boolean;
        error?: string;
        user: User;
      }> = [];

      // Execute operations with controlled concurrency (max 3 concurrent)
      const BATCH_SIZE = 3;
      const batches = [];

      for (let i = 0; i < config.userIds.length; i += BATCH_SIZE) {
        const batch = config.userIds.slice(i, i + BATCH_SIZE);
        batches.push(batch);
      }

      // Process batches sequentially, items within batch concurrently
      for (const batch of batches) {
        const batchPromises = batch.map(async (userId) => {
          const user = targetUsers.find((u) => u.id === userId);
          if (!user) {
            return {
              userId,
              success: false,
              error: "User not found",
              user: {} as User,
            };
          }

          const result = await executeSingleOperation(config, userId, user);

          // Update progress
          setProgress((prev) => {
            const newCompleted = result.success
              ? prev.completed + 1
              : prev.completed;
            const newFailed = result.success ? prev.failed : prev.failed + 1;
            const newInProgress = prev.inProgress - 1;
            const newPercentage = Math.round(
              ((newCompleted + newFailed) / prev.total) * 100
            );

            const newErrors = result.success
              ? prev.errors
              : [
                  ...prev.errors,
                  { userId, error: result.error || "Unknown error", user },
                ];

            return {
              ...prev,
              completed: newCompleted,
              failed: newFailed,
              inProgress: newInProgress,
              percentage: newPercentage,
              errors: newErrors,
            };
          });

          return { userId, ...result, user };
        });

        // Wait for batch to complete before proceeding
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }

      // Compile final result
      const successfulResults = results.filter((r) => r.success);
      const failedResults = results.filter((r) => !r.success);

      return {
        success: failedResults.length === 0,
        progress: {
          total: config.userIds.length,
          completed: successfulResults.length,
          failed: failedResults.length,
          inProgress: 0,
          percentage: 100,
          errors: failedResults.map((r) => ({
            userId: r.userId,
            error: r.error || "Unknown error",
            user: r.user,
          })),
        },
        successfulIds: successfulResults.map((r) => r.userId),
        failedIds: failedResults.map((r) => r.userId),
        errors: failedResults.map((r) => ({
          userId: r.userId,
          error: r.error || "Unknown error",
        })),
      };
    },
    onMutate: async (config) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      // Get current data
      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      if (previousUsers) {
        // Apply optimistic updates
        if (config.operation === "delete") {
          // Remove deleted users optimistically
          const filteredUsers = previousUsers.filter(
            (user) => !config.userIds.includes(user.id)
          );
          queryClient.setQueryData<User[]>(
            USERS_QUERY_KEYS.lists(),
            filteredUsers
          );
        } else {
          // Update users optimistically
          const updatedUsers = applyOptimisticUpdates(config, previousUsers);
          queryClient.setQueryData<User[]>(
            USERS_QUERY_KEYS.lists(),
            updatedUsers
          );
        }
      }

      return { previousUsers };
    },
    onError: (err, config, context) => {
      // Rollback optimistic updates
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSuccess: (result, config) => {
      // Handle partial failures
      if (result.errors.length > 0) {
        // Rollback failed items
        const currentUsers =
          queryClient.getQueryData<User[]>(USERS_QUERY_KEYS.lists()) || [];
        const correctedUsers = currentUsers.map((user) => {
          const failedError = result.progress.errors.find((e) => e.userId === user.id);
          if (failedError) {
            // Revert this user to original state
            return failedError.user;
          }
          return user;
        });
        queryClient.setQueryData<User[]>(
          USERS_QUERY_KEYS.lists(),
          correctedUsers
        );
      }
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
      setCurrentOperation(null);
    },
  });

  // 🎯 Bulk action wrappers
  const bulkDelete = useCallback(
    async (userIds: string[]) => {
      if (userIds.length === 0) return;

      const result = await notify(
        () =>
          bulkOperationMutation.mutateAsync({
            operation: "delete",
            userIds,
          }),
        `Eliminando ${userIds.length} usuario(s)...`,
        `${userIds.length} usuario(s) eliminado(s) exitosamente`
      );

      return result;
    },
    [bulkOperationMutation, notify]
  );

  const bulkBan = useCallback(
    async (userIds: string[], reason?: string) => {
      if (userIds.length === 0) return;

      const result = await notify(
        () =>
          bulkOperationMutation.mutateAsync({
            operation: "ban",
            userIds,
            banReason: reason,
          }),
        `Baneando ${userIds.length} usuario(s)...`,
        `${userIds.length} usuario(s) baneado(s) exitosamente`
      );

      return result;
    },
    [bulkOperationMutation, notify]
  );

  const bulkUnban = useCallback(
    async (userIds: string[]) => {
      if (userIds.length === 0) return;

      const result = await notify(
        () =>
          bulkOperationMutation.mutateAsync({
            operation: "unban",
            userIds,
          }),
        `Desbaneando ${userIds.length} usuario(s)...`,
        `${userIds.length} usuario(s) desbaneado(s) exitosamente`
      );

      return result;
    },
    [bulkOperationMutation, notify]
  );

  const bulkChangeRole = useCallback(
    async (userIds: string[], newRole: User["role"]) => {
      if (userIds.length === 0) return;

      const roleText =
        newRole === "admin"
          ? "administrador"
          : newRole === "super_admin"
          ? "super administrador"
          : "usuario";

      const result = await notify(
        () =>
          bulkOperationMutation.mutateAsync({
            operation: "role_change",
            userIds,
            newRole,
          }),
        `Cambiando rol de ${userIds.length} usuario(s) a ${roleText}...`,
        `${userIds.length} usuario(s) actualizado(s) a ${roleText} exitosamente`
      );

      return result;
    },
    [bulkOperationMutation, notify]
  );

  // 📊 Bulk operation status
  const bulkStatus = useMemo(
    () => ({
      isRunning: bulkOperationMutation.isPending,
      currentOperation,
      progress,
      hasErrors: progress.errors.length > 0,
      canCancel: false, // Could implement cancellation logic
    }),
    [bulkOperationMutation.isPending, currentOperation, progress]
  );

  return {
    // 📦 Bulk actions
    bulkDelete,
    bulkBan,
    bulkUnban,
    bulkChangeRole,

    // 📊 Status
    bulkStatus,
    progress,

    // 🔄 Raw mutation (for advanced usage)
    bulkOperationMutation,
  };
}

/**
 * 🎯 USE BULK SELECTION
 *
 * Hook para manejo de selección múltiple de usuarios.
 */
export function useBulkSelection(users: User[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 🎯 Selection actions
  const selectUser = useCallback((userId: string) => {
    setSelectedIds((prev) => new Set(prev).add(userId));
  }, []);

  const deselectUser = useCallback((userId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const toggleUser = useCallback((userId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(users.map((user) => user.id)));
  }, [users]);

  const selectNone = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectByFilter = useCallback(
    (filter: (user: User) => boolean) => {
      const filteredIds = users.filter(filter).map((user) => user.id);
      setSelectedIds(new Set(filteredIds));
    },
    [users]
  );

  // 📊 Selection stats
  const selectionStats = useMemo(() => {
    const selectedUsers = users.filter((user) => selectedIds.has(user.id));
    const selectedRoles = selectedUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      selectedCount: selectedIds.size,
      totalCount: users.length,
      selectedUsers,
      allSelected: selectedIds.size === users.length && users.length > 0,
      noneSelected: selectedIds.size === 0,
      partialSelection: selectedIds.size > 0 && selectedIds.size < users.length,
      selectedRoles,
      canDelete: selectedUsers.every((user) => user.role !== "super_admin"),
      canBan: selectedUsers.every((user) => !user.banned),
      canUnban: selectedUsers.every((user) => user.banned),
    };
  }, [selectedIds, users]);

  return {
    // 🎯 Selection state
    selectedIds: Array.from(selectedIds),
    selectedIdsSet: selectedIds,

    // 📊 Stats
    selectionStats,

    // 🎯 Actions
    selectUser,
    deselectUser,
    toggleUser,
    selectAll,
    selectNone,
    selectByFilter,

    // 🔧 Utilities
    isSelected: (userId: string) => selectedIds.has(userId),
    clearSelection: selectNone,
  };
}
