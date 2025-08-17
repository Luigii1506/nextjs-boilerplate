/**
 * 👥 USE USERS CORE HOOK
 * =======================
 *
 * Hook enterprise principal para el módulo CORE de usuarios
 * React 19 compliance con optimistic updates y performance optimizado
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import {
  useActionState,
  useOptimistic,
  useCallback,
  useMemo,
  useRef,
  useTransition,
  useEffect,
} from "react";
import { USERS_ACTIONS } from "../constants";
import { usersHookLogger, usersSecurityLogger } from "../utils/logger";
import {
  usersConfig,
  adaptConfigForHook,
  type UsersModuleConfig,
} from "../config";
import {
  usersOptimisticReducer,
  createInitialUsersOptimisticState,
  usersOptimisticSelectors,
  type UsersOptimisticState,
} from "../reducers";
import * as serverActions from "../server/actions";
import type {
  User,
  CreateUserForm,
  EditUserForm,
  BanUserForm,
  UserListResponse,
  ActionResult,
  BulkUpdateData,
} from "../types";
import { generateTempUserId } from "../utils";

// 🎯 Hook Configuration Interface
interface UseUsersConfig extends Partial<UsersModuleConfig> {
  initialUsers?: User[];
  autoLoad?: boolean;
  enableRealTimeUpdates?: boolean;
}

// 🎯 Hook Return Interface
export interface UseUsersReturn {
  // 📊 Core Data
  users: User[];
  optimisticState: User[];
  totalUsers: number;

  // 🔄 Loading States
  isLoading: boolean;
  isProcessing: boolean;
  isPending: boolean;

  // 📊 Analytics & Stats
  activeUsers: User[];
  bannedUsers: User[];
  adminUsers: User[];
  stats: {
    total: number;
    active: number;
    banned: number;
    admins: number;
    activePercentage: number;
    adminPercentage: number;
  };

  // ❌ Error States
  error: string | null;
  hasError: boolean;
  errors: Record<string, string>;

  // 🎯 User Operations
  createUser: (userData: CreateUserForm) => Promise<ActionResult<User>>;
  updateUser: (userData: EditUserForm) => Promise<ActionResult<User>>;
  deleteUser: (userId: string) => Promise<ActionResult<void>>;
  banUser: (banData: BanUserForm) => Promise<ActionResult<User>>;
  unbanUser: (userId: string) => Promise<ActionResult<User>>;
  updateUserRole: (
    userId: string,
    newRole: User["role"]
  ) => Promise<ActionResult<User>>;

  // 🔄 Bulk Operations
  bulkUpdateUsers: (
    data: BulkUpdateData
  ) => Promise<ActionResult<{ updatedCount: number }>>;

  // 🔍 Search & Filter
  searchUsers: (searchTerm: string) => User[];
  filterUsersByRole: (role: User["role"] | "all") => User[];
  filterUsersByStatus: (status: "active" | "banned" | "all") => User[];

  // 🔄 Data Management
  refresh: () => void;
  clearErrors: () => void;

  // 🏗️ Configuration & Debug
  config: UsersModuleConfig;
  configSummary: Record<string, unknown>;
  debug?: {
    hasInitialized: boolean;
    optimisticState: UsersOptimisticState;
    config: UsersModuleConfig;
    selectors: typeof usersOptimisticSelectors;
  };
}

/**
 * 👥 USE USERS CORE HOOK
 *
 * Hook principal del módulo CORE de usuarios con todas las funcionalidades
 * enterprise siempre activas (sin feature flags).
 *
 * Features:
 * - ✅ React 19 compliance (useActionState, useOptimistic, useTransition)
 * - ✅ Optimistic UI updates siempre habilitadas
 * - ✅ Performance optimizado con memoization
 * - ✅ Logging estructurado con security audit
 * - ✅ Error handling robusto
 * - ✅ Auto-refresh siempre activo
 * - ✅ Configuration management centralizada
 * - ✅ Analytics y métricas en tiempo real
 * - ✅ Bulk operations optimizadas
 * - ✅ Search y filtering avanzado
 */
export const useUsers = (userConfig?: UseUsersConfig): UseUsersReturn => {
  const [isPending, startTransition] = useTransition();
  const hasInitialized = useRef(false);

  // 🏗️ CORE: Configuration management (sin feature flags)
  const coreConfiguration = useMemo(
    () => adaptConfigForHook(userConfig),
    [userConfig]
  );

  // 🎯 CORE: Structured logging (siempre habilitado)
  usersHookLogger.debug("Users hook initialized", {
    hasUserConfig: !!userConfig,
    autoLoad: userConfig?.autoLoad ?? true,
    configSummary: usersConfig.getConfigSummary(),
  });

  // 🎯 PRIMARY DATA STATE (Server Actions as Source of Truth)
  const [usersState, usersAction, usersPending] = useActionState(
    async (): Promise<ActionResult<UserListResponse>> => {
      usersHookLogger.debug("Fetching users from server");
      return await serverActions.getAllUsersAction(
        coreConfiguration.ui.itemsPerPage,
        0
      );
    },
    null
  );

  // 🎯 OPTIMISTIC STATE (siempre habilitado para módulos core)
  const [optimisticState, addOptimistic] = useOptimistic(
    createInitialUsersOptimisticState(),
    usersOptimisticReducer
  );

  // 🚀 AUTO-INITIALIZATION (Direct - sin verificación de flags)
  useEffect(() => {
    if (!hasInitialized.current && (userConfig?.autoLoad ?? true)) {
      hasInitialized.current = true;

      usersHookLogger.info("Initializing core users module", {
        config: coreConfiguration,
        initialUsers: userConfig?.initialUsers?.length || 0,
      });

      // Load initial data AFTER render (React 19 compliance)
      startTransition(() => {
        usersAction();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userConfig?.autoLoad]);

  // 🎯 COMPUTED STATES (Core patterns)
  const isLoading = useMemo(
    () => usersPending || isPending,
    [usersPending, isPending]
  );

  const users = useMemo(() => {
    if (usersState?.success && usersState.data) {
      return usersState.data.users;
    }
    return userConfig?.initialUsers || [];
  }, [usersState, userConfig?.initialUsers]);

  const error = useMemo(() => {
    if (usersState?.error) return usersState.error;
    if (usersOptimisticSelectors.hasErrors(optimisticState)) {
      const errors = usersOptimisticSelectors.getErrors(optimisticState);
      return Object.values(errors).find(Boolean) || null;
    }
    return null;
  }, [usersState?.error, optimisticState]);

  // 📊 ANALYTICS & STATS (siempre disponibles)
  const stats = useMemo(() => {
    const optimisticStats = usersOptimisticSelectors.getStats(optimisticState);
    const totalUsers = users.length;

    return {
      total: totalUsers,
      active:
        optimisticStats.totalActive || users.filter((u) => !u.banned).length,
      banned:
        optimisticStats.totalBanned || users.filter((u) => u.banned).length,
      admins:
        optimisticStats.totalAdmins ||
        users.filter((u) => u.role === "admin" || u.role === "super_admin")
          .length,
      activePercentage:
        usersOptimisticSelectors.getActiveUserPercentage(optimisticState),
      adminPercentage:
        usersOptimisticSelectors.getAdminPercentage(optimisticState),
    };
  }, [users, optimisticState]);

  // 🎯 USER OPERATIONS (Siempre con Optimistic UI y Auto-refresh)

  // 👤 Create User
  const createUser = useCallback(
    async (userData: CreateUserForm): Promise<ActionResult<User>> => {
      const tempId = generateTempUserId();

      usersHookLogger.info("Creating user", {
        email: userData.email,
        role: userData.role,
        tempId,
      });

      // 🔐 Security logging
      usersSecurityLogger.userOperation(
        "CREATE_USER",
        "system", // Current user would come from auth
        null,
        true, // Optimistic
        { email: userData.email, role: userData.role }
      );

      // ✅ Optimistic UI (siempre habilitado)
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.CREATE_USER,
          tempUser: {
            ...userData,
            emailVerified: false,
            image: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            banned: false,
            banReason: null,
            banExpires: null,
            status: "active",
          },
          tempId,
        });
      });

      try {
        // Server Action
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("role", userData.role);

        const result = await serverActions.createUserAction(formData);

        // ✅ Auto-refresh (siempre habilitado)
        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          // 📊 Analytics (simplified)
          usersHookLogger.info("User created analytics", {
            userId: result.data?.id,
            role: userData.role,
            tempId,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to create user", error, {
          tempId,
          email: userData.email,
        });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create user",
        };
      }
    },
    [addOptimistic, usersAction]
  );

  // ✏️ Update User
  const updateUser = useCallback(
    async (userData: EditUserForm): Promise<ActionResult<User>> => {
      usersHookLogger.info("Updating user", {
        userId: userData.id,
        updates: Object.keys(userData).filter((key) => key !== "id"),
      });

      // ✅ Optimistic UI
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.UPDATE_USER,
          userId: userData.id,
          updates: {
            name: userData.name,
            email: userData.email,
            role: userData.role,
          },
        });
      });

      try {
        const formData = new FormData();
        formData.append("id", userData.id);
        formData.append("name", userData.name);
        formData.append("email", userData.email);
        formData.append("role", userData.role);

        const result = await serverActions.updateUserAction(formData);

        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          usersHookLogger.info("user_updated", {
            userId: userData.id,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to update user", error, {
          userId: userData.id,
        });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update user",
        };
      }
    },
    [addOptimistic, usersAction]
  );

  // 🗑️ Delete User
  const deleteUser = useCallback(
    async (userId: string): Promise<ActionResult<void>> => {
      usersHookLogger.info("Deleting user", { userId });

      // 🔐 Security audit
      usersSecurityLogger.userOperation(
        "DELETE_USER",
        "system", // Current user
        userId,
        true,
        { action: "DELETE_USER" }
      );

      // ✅ Optimistic UI
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.DELETE_USER,
          userId,
        });
      });

      try {
        const formData = new FormData();
        formData.append("userId", userId);

        const result = await serverActions.deleteUserAction(formData);

        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          usersHookLogger.info("user_deleted", {
            userId,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to delete user", error, { userId });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to delete user",
        };
      }
    },
    [addOptimistic, usersAction]
  );

  // 🚫 Ban User
  const banUser = useCallback(
    async (banData: BanUserForm): Promise<ActionResult<User>> => {
      usersHookLogger.info("Banning user", {
        userId: banData.id,
        reason: banData.reason,
      });

      // 🔐 Security audit
      usersSecurityLogger.banOperation(
        "system", // Current admin
        banData.id,
        "BAN",
        banData.reason
      );

      // ✅ Optimistic UI
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.BAN_USER,
          userId: banData.id,
          reason: banData.reason,
        });
      });

      try {
        const formData = new FormData();
        formData.append("id", banData.id);
        formData.append("reason", banData.reason);

        const result = await serverActions.banUserAction(formData);

        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          usersHookLogger.info("user_banned", {
            userId: banData.id,
            reason: banData.reason,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to ban user", error, {
          userId: banData.id,
        });

        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to ban user",
        };
      }
    },
    [addOptimistic, usersAction]
  );

  // ✅ Unban User
  const unbanUser = useCallback(
    async (userId: string): Promise<ActionResult<User>> => {
      usersHookLogger.info("Unbanning user", { userId });

      // 🔐 Security audit
      usersSecurityLogger.banOperation(
        "system", // Current admin
        userId,
        "UNBAN"
      );

      // ✅ Optimistic UI
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.UNBAN_USER,
          userId,
        });
      });

      try {
        const formData = new FormData();
        formData.append("id", userId);

        const result = await serverActions.unbanUserAction(formData);

        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          usersHookLogger.info("user_unbanned", {
            userId,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to unban user", error, { userId });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to unban user",
        };
      }
    },
    [addOptimistic, usersAction]
  );

  // 🎭 Update User Role
  const updateUserRole = useCallback(
    async (
      userId: string,
      newRole: User["role"]
    ): Promise<ActionResult<User>> => {
      const currentUser = users.find((u) => u.id === userId);
      const oldRole = currentUser?.role;

      usersHookLogger.info("Updating user role", {
        userId,
        fromRole: oldRole,
        toRole: newRole,
      });

      // 🔐 Security audit for role changes
      usersSecurityLogger.roleChange(
        "system", // Current admin
        userId,
        oldRole || "unknown",
        newRole
      );

      // ✅ Optimistic UI
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.UPDATE_ROLE,
          userId,
          newRole,
          oldRole,
        });
      });

      try {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("role", newRole);

        const result = await serverActions.updateUserRoleAction(formData);

        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          usersHookLogger.info("role_changed", {
            userId,
            fromRole: oldRole,
            toRole: newRole,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to update user role", error, {
          userId,
          newRole,
        });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to update role",
        };
      }
    },
    [users, addOptimistic, usersAction]
  );

  // 🔄 Bulk Update Users
  const bulkUpdateUsers = useCallback(
    async (
      data: BulkUpdateData
    ): Promise<ActionResult<{ updatedCount: number }>> => {
      usersHookLogger.info("Bulk updating users", {
        userCount: data.userIds.length,
        newRole: data.newRole,
      });

      // ✅ Optimistic UI
      startTransition(() => {
        addOptimistic({
          type: USERS_ACTIONS.BULK_UPDATE,
          userIds: data.userIds,
          newRole: data.newRole,
        });
      });

      try {
        const formData = new FormData();
        formData.append("userIds", JSON.stringify(data.userIds));
        formData.append("newRole", data.newRole);

        const result = await serverActions.bulkUpdateUsersAction(formData);

        if (result.success) {
          startTransition(() => {
            usersAction();
          });

          usersHookLogger.info("bulk_update", {
            userCount: data.userIds.length,
            newRole: data.newRole,
          });
        }

        return result;
      } catch (error) {
        usersHookLogger.error("Failed to bulk update users", error, {
          userCount: data.userIds.length,
        });

        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to bulk update",
        };
      }
    },
    [addOptimistic, usersAction]
  );

  // 🔍 SEARCH & FILTER OPERATIONS (Optimized with useMemo)
  const searchUsers = useCallback(
    (searchTerm: string): User[] => {
      return usersOptimisticSelectors.searchUsers(optimisticState, searchTerm);
    },
    [optimisticState]
  );

  const filterUsersByRole = useCallback(
    (role: User["role"] | "all"): User[] => {
      if (role === "all") return users;
      return users.filter((user) => user.role === role);
    },
    [users]
  );

  const filterUsersByStatus = useCallback(
    (status: "active" | "banned" | "all"): User[] => {
      if (status === "all") return users;
      const isBanned = status === "banned";
      return users.filter((user) => user.banned === isBanned);
    },
    [users]
  );

  // 🔄 Data Management
  const refresh = useCallback(() => {
    usersHookLogger.debug("Manual refresh requested");
    startTransition(() => usersAction());
  }, [usersAction]);

  const clearErrors = useCallback(() => {
    startTransition(() => {
      addOptimistic({
        type: USERS_ACTIONS.CLEAR_ERRORS,
      });
    });
  }, [addOptimistic]);

  // 🏗️ CORE RETURN INTERFACE (Siempre disponible)
  return useMemo(
    () => ({
      // 📊 Core Data
      users,
      optimisticState: usersOptimisticSelectors.getAllUsers(optimisticState),
      totalUsers: stats.total,

      // 🔄 Loading States
      isLoading,
      isProcessing: usersOptimisticSelectors.isLoading(optimisticState),
      isPending,

      // 📊 Analytics (siempre disponibles)
      activeUsers: usersOptimisticSelectors.getActiveUsers(optimisticState),
      bannedUsers: usersOptimisticSelectors.getBannedUsers(optimisticState),
      adminUsers: usersOptimisticSelectors.getAdminUsers(optimisticState),
      stats,

      // ❌ Error States
      error,
      hasError: !!error,
      errors: usersOptimisticSelectors.getErrors(optimisticState),

      // 🎯 User Operations (Siempre disponibles)
      createUser,
      updateUser,
      deleteUser,
      banUser,
      unbanUser,
      updateUserRole,

      // 🔄 Bulk Operations
      bulkUpdateUsers,

      // 🔍 Search & Filter
      searchUsers,
      filterUsersByRole,
      filterUsersByStatus,

      // 🔄 Data Management
      refresh,
      clearErrors,

      // 🏗️ Configuration & Debugging
      config: coreConfiguration,
      configSummary: usersConfig.getConfigSummary(),

      // 📊 Debug Info (Development only)
      ...(coreConfiguration.settings.performanceTracking && {
        debug: {
          hasInitialized: hasInitialized.current,
          optimisticState,
          config: coreConfiguration,
          selectors: usersOptimisticSelectors,
        },
      }),
    }),
    [
      users,
      optimisticState,
      stats,
      isLoading,
      isPending,
      error,
      createUser,
      updateUser,
      deleteUser,
      banUser,
      unbanUser,
      updateUserRole,
      bulkUpdateUsers,
      searchUsers,
      filterUsersByRole,
      filterUsersByStatus,
      refresh,
      clearErrors,
      coreConfiguration,
    ]
  );
};
