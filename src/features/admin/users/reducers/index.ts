/**
 * 👥 USERS OPTIMISTIC REDUCER
 * ============================
 *
 * Reducer para manejar estado optimista del módulo Core de usuarios
 * Maneja todas las operaciones de usuarios con feedback inmediato
 *
 * Updated: 2025-01-17 - Enterprise patterns v2.0
 */

import { USERS_ACTIONS } from "../constants";
import { usersOptimisticLogger } from "../utils/logger";
import type { User } from "../types";

// 🎯 Optimistic State Interface
export interface UsersOptimisticState {
  users: User[];
  totalUsers: number;
  lastUpdated: string;
  activeOperations: number;
  errors: Record<string, string>;
  stats: {
    totalActive: number;
    totalBanned: number;
    totalAdmins: number;
  };
}

// 🎭 Optimistic Action Types
export type UsersOptimisticAction =
  // User CRUD operations
  | {
      type: typeof USERS_ACTIONS.CREATE_USER;
      tempUser: Omit<User, "id">;
      tempId: string;
    }
  | {
      type: typeof USERS_ACTIONS.UPDATE_USER;
      userId: string;
      updates: Partial<User>;
    }
  | {
      type: typeof USERS_ACTIONS.DELETE_USER;
      userId: string;
    }

  // User status operations
  | {
      type: typeof USERS_ACTIONS.BAN_USER;
      userId: string;
      reason: string;
    }
  | {
      type: typeof USERS_ACTIONS.UNBAN_USER;
      userId: string;
    }
  | {
      type: typeof USERS_ACTIONS.UPDATE_ROLE;
      userId: string;
      newRole: User["role"];
      oldRole?: User["role"];
    }

  // Bulk operations
  | {
      type: typeof USERS_ACTIONS.BULK_UPDATE;
      userIds: string[];
      newRole: User["role"];
    }
  | {
      type: typeof USERS_ACTIONS.BULK_DELETE;
      userIds: string[];
    }

  // UI state operations
  | {
      type: typeof USERS_ACTIONS.START_LOADING;
      operation: string;
    }
  | {
      type: typeof USERS_ACTIONS.COMPLETE_LOADING;
      operation: string;
    }
  | {
      type: typeof USERS_ACTIONS.FAIL_LOADING;
      operation: string;
      error: string;
    }
  | {
      type: typeof USERS_ACTIONS.CLEAR_ERRORS;
    }
  | {
      type: typeof USERS_ACTIONS.REFRESH_DATA;
      users: User[];
    };

// 🧮 Helper Functions
function calculateStats(users: User[]) {
  const totalActive = users.filter((u) => !u.banned).length;
  const totalBanned = users.filter((u) => u.banned).length;
  const totalAdmins = users.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  ).length;

  return {
    totalActive,
    totalBanned,
    totalAdmins,
  };
}

function updateUserInArray(
  users: User[],
  userId: string,
  updates: Partial<User>
): User[] {
  return users.map((user) =>
    user.id === userId
      ? { ...user, ...updates, updatedAt: new Date().toISOString() }
      : user
  );
}

function removeUserFromArray(users: User[], userId: string): User[] {
  return users.filter((user) => user.id !== userId);
}

function removeUsersFromArray(users: User[], userIds: string[]): User[] {
  return users.filter((user) => !userIds.includes(user.id));
}

// 🎯 Create Initial Optimistic State
export function createInitialUsersOptimisticState(): UsersOptimisticState {
  return {
    users: [],
    totalUsers: 0,
    lastUpdated: new Date().toISOString(),
    activeOperations: 0,
    errors: {},
    stats: {
      totalActive: 0,
      totalBanned: 0,
      totalAdmins: 0,
    },
  };
}

/**
 * 🎯 USERS OPTIMISTIC REDUCER
 *
 * Maneja todas las operaciones optimistas para usuarios:
 * - ✅ Create: Agrega usuario temporal inmediatamente
 * - ✅ Update: Actualiza datos inmediatamente
 * - ✅ Delete: Remueve usuario inmediatamente
 * - ✅ Ban/Unban: Cambia estado inmediatamente
 * - ✅ Role Change: Actualiza rol inmediatamente
 * - ✅ Bulk Operations: Operaciones en lote
 * - ✅ Loading States: Feedback visual
 * - ✅ Error Handling: Manejo robusto de errores
 * - ✅ Stats Calculation: Métricas en tiempo real
 */
export function usersOptimisticReducer(
  state: UsersOptimisticState,
  action: UsersOptimisticAction
): UsersOptimisticState {
  usersOptimisticLogger.debug(`Optimistic action: ${action.type}`, {
    currentUsers: state.users.length,
    activeOperations: state.activeOperations,
  });

  switch (action.type) {
    // 👤 CREATE USER
    case USERS_ACTIONS.CREATE_USER: {
      const tempUser: User = {
        ...action.tempUser,
        id: action.tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailVerified: false,
        banned: false,
        banReason: null,
        banExpires: null,
        image: null,
        status: "active",
      };

      const nextUsers = [...state.users, tempUser];
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Creating user optimistically`, {
        tempId: action.tempId,
        email: tempUser.email,
        role: tempUser.role,
      });

      return {
        ...state,
        users: nextUsers,
        totalUsers: state.totalUsers + 1,
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // ✏️ UPDATE USER
    case USERS_ACTIONS.UPDATE_USER: {
      const nextUsers = updateUserInArray(
        state.users,
        action.userId,
        action.updates
      );
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Updating user optimistically`, {
        userId: action.userId,
        updates: Object.keys(action.updates),
      });

      return {
        ...state,
        users: nextUsers,
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // 🗑️ DELETE USER
    case USERS_ACTIONS.DELETE_USER: {
      const nextUsers = removeUserFromArray(state.users, action.userId);
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Deleting user optimistically`, {
        userId: action.userId,
        remainingUsers: nextUsers.length,
      });

      return {
        ...state,
        users: nextUsers,
        totalUsers: Math.max(0, state.totalUsers - 1),
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // 🚫 BAN USER
    case USERS_ACTIONS.BAN_USER: {
      const nextUsers = updateUserInArray(state.users, action.userId, {
        banned: true,
        banReason: action.reason,
        banExpires: null, // Could be set based on business rules
        status: "banned",
      });
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Banning user optimistically`, {
        userId: action.userId,
        reason: action.reason,
      });

      return {
        ...state,
        users: nextUsers,
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // ✅ UNBAN USER
    case USERS_ACTIONS.UNBAN_USER: {
      const nextUsers = updateUserInArray(state.users, action.userId, {
        banned: false,
        banReason: null,
        banExpires: null,
        status: "active",
      });
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Unbanning user optimistically`, {
        userId: action.userId,
      });

      return {
        ...state,
        users: nextUsers,
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // 🎭 UPDATE ROLE
    case USERS_ACTIONS.UPDATE_ROLE: {
      const nextUsers = updateUserInArray(state.users, action.userId, {
        role: action.newRole,
      });
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Changing user role optimistically`, {
        userId: action.userId,
        fromRole: action.oldRole,
        toRole: action.newRole,
      });

      return {
        ...state,
        users: nextUsers,
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // 🔄 BULK UPDATE
    case USERS_ACTIONS.BULK_UPDATE: {
      let nextUsers = [...state.users];

      action.userIds.forEach((userId) => {
        nextUsers = updateUserInArray(nextUsers, userId, {
          role: action.newRole,
        });
      });

      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Bulk updating users optimistically`, {
        userCount: action.userIds.length,
        newRole: action.newRole,
      });

      return {
        ...state,
        users: nextUsers,
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // 🗑️ BULK DELETE
    case USERS_ACTIONS.BULK_DELETE: {
      const nextUsers = removeUsersFromArray(state.users, action.userIds);
      const nextStats = calculateStats(nextUsers);

      usersOptimisticLogger.info(`Bulk deleting users optimistically`, {
        userCount: action.userIds.length,
        remainingUsers: nextUsers.length,
      });

      return {
        ...state,
        users: nextUsers,
        totalUsers: Math.max(0, state.totalUsers - action.userIds.length),
        activeOperations: state.activeOperations + 1,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
      };
    }

    // 🔄 LOADING STATES
    case USERS_ACTIONS.START_LOADING: {
      return {
        ...state,
        activeOperations: state.activeOperations + 1,
      };
    }

    case USERS_ACTIONS.COMPLETE_LOADING: {
      return {
        ...state,
        activeOperations: Math.max(0, state.activeOperations - 1),
        errors: {
          ...state.errors,
          [action.operation]: undefined,
        } as Record<string, string>,
      };
    }

    case USERS_ACTIONS.FAIL_LOADING: {
      usersOptimisticLogger.error(
        `Operation failed: ${action.operation}`,
        new Error(action.error),
        {
          operation: action.operation,
        }
      );

      return {
        ...state,
        activeOperations: Math.max(0, state.activeOperations - 1),
        errors: {
          ...state.errors,
          [action.operation]: action.error,
        },
      };
    }

    case USERS_ACTIONS.CLEAR_ERRORS: {
      return {
        ...state,
        errors: {},
      };
    }

    // 🔄 REFRESH DATA
    case USERS_ACTIONS.REFRESH_DATA: {
      const nextStats = calculateStats(action.users);

      usersOptimisticLogger.info(`Refreshing users data`, {
        newUserCount: action.users.length,
        previousCount: state.users.length,
      });

      return {
        ...state,
        users: action.users,
        totalUsers: action.users.length,
        lastUpdated: new Date().toISOString(),
        stats: nextStats,
        activeOperations: 0, // Reset on refresh
        errors: {}, // Clear errors on successful refresh
      };
    }

    default:
      return state;
  }
}

// 🔍 SELECTOR FUNCTIONS
export const usersOptimisticSelectors = {
  // 📊 Basic data selectors
  getAllUsers: (state: UsersOptimisticState) => state.users,
  getTotalUsers: (state: UsersOptimisticState) => state.totalUsers,
  getActiveOperations: (state: UsersOptimisticState) => state.activeOperations,
  getLastUpdated: (state: UsersOptimisticState) => state.lastUpdated,

  // 👤 User filtering selectors
  getActiveUsers: (state: UsersOptimisticState) =>
    state.users.filter((user) => !user.banned),

  getBannedUsers: (state: UsersOptimisticState) =>
    state.users.filter((user) => user.banned),

  getAdminUsers: (state: UsersOptimisticState) =>
    state.users.filter(
      (user) => user.role === "admin" || user.role === "super_admin"
    ),

  getUsersByRole: (state: UsersOptimisticState, role: User["role"]) =>
    state.users.filter((user) => user.role === role),

  // 🔍 Search selectors
  searchUsers: (state: UsersOptimisticState, searchTerm: string) =>
    state.users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ),

  // 📊 Statistics selectors
  getStats: (state: UsersOptimisticState) => state.stats,

  getActiveUserPercentage: (state: UsersOptimisticState) => {
    if (state.totalUsers === 0) return 0;
    return Math.round((state.stats.totalActive / state.totalUsers) * 100);
  },

  getBannedUserPercentage: (state: UsersOptimisticState) => {
    if (state.totalUsers === 0) return 0;
    return Math.round((state.stats.totalBanned / state.totalUsers) * 100);
  },

  getAdminPercentage: (state: UsersOptimisticState) => {
    if (state.totalUsers === 0) return 0;
    return Math.round((state.stats.totalAdmins / state.totalUsers) * 100);
  },

  // 🔄 State selectors
  isLoading: (state: UsersOptimisticState) => state.activeOperations > 0,
  hasErrors: (state: UsersOptimisticState) =>
    Object.keys(state.errors).length > 0,
  getErrors: (state: UsersOptimisticState) => state.errors,
  getErrorForOperation: (state: UsersOptimisticState, operation: string) =>
    state.errors[operation],

  // 🔍 User lookup selectors
  getUserById: (state: UsersOptimisticState, userId: string) =>
    state.users.find((user) => user.id === userId),

  hasUser: (state: UsersOptimisticState, userId: string) =>
    state.users.some((user) => user.id === userId),

  // 📈 Analytics selectors
  getRecentUsers: (state: UsersOptimisticState, days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return state.users.filter((user) => new Date(user.createdAt) >= cutoff);
  },

  getUsersByCreationMonth: (state: UsersOptimisticState) => {
    const monthlyData = new Map<string, number>();

    state.users.forEach((user) => {
      const month = new Date(user.createdAt).toISOString().slice(0, 7); // YYYY-MM
      monthlyData.set(month, (monthlyData.get(month) || 0) + 1);
    });

    return Object.fromEntries(monthlyData);
  },
};
