/**
 * 🔐 USE AUTH QUERY - TANSTACK QUERY OPTIMIZED
 * =========================================
 *
 * Hook de autenticación súper optimizado con TanStack Query.
 * Session management reactivo, cache inteligente, background updates.
 *
 * Enterprise: 2025-01-17 - TanStack Query migration
 */

"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/core/auth/auth-client";
import { useNotifications } from "@/shared/hooks/useNotifications";
import type { User } from "@/shared/types/user";

// 📝 Session Data Interface
interface SessionData {
  user: User | null;
  // Agrega otras propiedades de la sesión si existen
  [key: string]: unknown;
}

// 🎯 Query Keys para auth
export const AUTH_QUERY_KEYS = {
  all: ["auth"] as const,
  session: () => [...AUTH_QUERY_KEYS.all, "session"] as const,
  user: () => [...AUTH_QUERY_KEYS.all, "user"] as const,
  permissions: (userId: string) =>
    [...AUTH_QUERY_KEYS.all, "permissions", userId] as const,
} as const;

// 📝 Auth State Interface
export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  error: string | null;
}

// 📝 Auth Actions Interface
export interface AuthActions {
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  invalidateAuth: () => void;
}

// 📝 Complete Auth Hook Return
export interface AuthHookReturn extends AuthState, AuthActions {
  // Loading states
  isRefreshing: boolean;
  isLoggingOut: boolean;

  // Session data
  sessionData: SessionData | null;

  // Utilities
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  requiresAuth: boolean;
}

// 🔍 Session fetcher
async function fetchSession(): Promise<SessionData | null> {
  try {
    console.log("🔍 [useAuthQuery] Fetching session...");
    const session = await authClient.getSession();
    console.log("📋 [useAuthQuery] Raw session from authClient:", session);

    const sessionData = (session.data as SessionData) || null;
    console.log("✅ [useAuthQuery] Processed session data:", {
      hasData: !!sessionData,
      user: sessionData?.user,
      userId: sessionData?.user?.id,
      userEmail: sessionData?.user?.email,
    });

    return sessionData;
  } catch (error) {
    console.error("❌ [useAuthQuery] Error fetching session:", error);
    throw error;
  }
}

// 🚪 Logout function
async function performLogout() {
  try {
    await authClient.signOut();
    // Clear all related cache after logout
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
}

/**
 * 🔐 USE AUTH QUERY HOOK
 *
 * Hook principal optimizado con TanStack Query para session management.
 * Maneja cache inteligente, background updates, y optimistic updates.
 */
export function useAuthQuery(
  requireAuth: boolean = false,
  config: {
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    retry?: number;
    retryDelay?: number;
  } = {}
): AuthHookReturn {
  const {
    staleTime = 30 * 1000, // 30s - sessions are relatively stable
    gcTime = 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus = true, // Important for security
    refetchOnReconnect = true,
    retry = 2,
    retryDelay = 1000,
  } = config;

  const queryClient = useQueryClient();
  const router = useRouter();
  const { error: notifyError, success: notifySuccess } = useNotifications();

  // 📊 SESSION QUERY
  const {
    data: sessionData,
    isLoading,
    isFetching: isRefreshing,
    error,
    refetch: refetchSession,
  } = useQuery({
    queryKey: AUTH_QUERY_KEYS.session(),
    queryFn: fetchSession,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    refetchOnReconnect,
    retry,
    retryDelay,
    // Don't retry on 401/403 errors (auth errors)
    retryOnMount: true,
    refetchOnMount: true,
    networkMode: "always", // Always try to fetch, important for auth
  });

  // 🚪 LOGOUT MUTATION
  const logoutMutation = useMutation<boolean, Error, void>({
    mutationFn: performLogout,
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.all });

      // Clear any other user-specific cache
      queryClient.clear();

      notifySuccess("Sesión cerrada exitosamente");
      router.push("/login");
    },
    onError: (error) => {
      notifyError(`Error cerrando sesión: ${error.message}`);
    },
  });

  // 🧮 Computed Auth State
  const authState = useMemo((): AuthState => {
    const user = sessionData?.user ?? null;
    const isAuthenticated = !!user;
    const isAdmin = user?.role === "admin" || user?.role === "super_admin";
    const isSuperAdmin = user?.role === "super_admin";

    return {
      isLoading,
      isAuthenticated,
      user,
      isAdmin,
      isSuperAdmin,
      error: error?.message || null,
    };
  }, [sessionData, isLoading, error]);

  // 🔄 Auto-redirect logic with useEffect
  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const currentPath = window.location.pathname;
    const authPages = ["/login", "/register", "/forgot-password"];
    const isOnAuthPage = authPages.includes(currentPath);

    if (authState.isAuthenticated) {
      // If authenticated and on auth page, redirect to callback or home
      if (isOnAuthPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get("callbackUrl") || "/";
        router.replace(callbackUrl);
      }
    } else {
      // If not authenticated and requires auth, redirect to login
      if (requireAuth && !isOnAuthPage) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [authState.isAuthenticated, isLoading, requireAuth, router]);

  // 🎯 Auth Actions
  const authActions = useMemo(
    (): AuthActions => ({
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      refreshSession: async () => {
        await refetchSession();
      },
      invalidateAuth: () => {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.all });
      },
    }),
    [logoutMutation, refetchSession, queryClient]
  );

  // 🛠️ Utility Functions
  const utilities = useMemo(
    () => ({
      hasRole: (role: string) => authState.user?.role === role,
      hasAnyRole: (roles: string[]) =>
        authState.user ? roles.includes(authState.user.role) : false,
    }),
    [authState.user]
  );

  // 🎯 Return complete auth hook state
  return {
    ...authState,
    ...authActions,

    // Loading states
    isRefreshing,
    isLoggingOut: logoutMutation.isPending,

    // Session data
    sessionData,

    // Utilities
    ...utilities,
    requiresAuth: requireAuth,
  };
}

/**
 * 🔐 USE AUTH - Compatibility Hook
 *
 * Mantiene la misma API que el hook original para compatibilidad.
 * Internamente usa TanStack Query optimizado.
 */
export function useAuth(requireAuth: boolean = false): AuthState {
  const { isLoading, isAuthenticated, user, isAdmin, isSuperAdmin, error } =
    useAuthQuery(requireAuth);

  return {
    isLoading,
    isAuthenticated,
    user,
    isAdmin,
    isSuperAdmin,
    error,
  };
}

/**
 * 🛡️ USE PROTECTED PAGE - TanStack Query Optimized
 *
 * Hook optimizado para páginas protegidas.
 */
export function useProtectedPage(): AuthState {
  return useAuth(true);
}

/**
 * 👑 USE ADMIN PAGE - TanStack Query Optimized
 *
 * Hook optimizado para páginas de admin con validación adicional.
 */
export function useAdminPage(): AuthState {
  const authState = useAuthQuery(true);
  const router = useRouter();

  useEffect(() => {
    if (
      !authState.isLoading &&
      authState.isAuthenticated &&
      !authState.isAdmin
    ) {
      // Si no es admin, redirigir a página de usuario
      router.replace("/unauthorized");
    }
  }, [
    authState.isLoading,
    authState.isAuthenticated,
    authState.isAdmin,
    router,
  ]);

  return {
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    isAdmin: authState.isAdmin,
    isSuperAdmin: authState.isSuperAdmin,
    error: authState.error,
  };
}

/**
 * 🌐 USE PUBLIC PAGE - TanStack Query Optimized
 *
 * Hook optimizado para páginas públicas.
 */
export function usePublicPage(): AuthState {
  return useAuth(false);
}

/**
 * 🔄 USE REFRESH AUTH - TanStack Query Optimized
 *
 * Hook optimizado para refrescar el estado de autenticación.
 */
export function useRefreshAuth() {
  const { refreshSession, isRefreshing } = useAuthQuery();

  return {
    refreshAuth: refreshSession,
    isRefreshing,
  };
}

/**
 * 🚪 USE LOGOUT - TanStack Query Optimized
 *
 * Hook especializado para logout con loading state.
 */
export function useLogout() {
  const { logout, isLoggingOut } = useAuthQuery();

  return {
    logout,
    isLoggingOut,
  };
}

/**
 * 🎭 USE AUTH ROLES - Advanced Role Management
 *
 * Hook avanzado para manejo de roles y permisos.
 */
export function useAuthRoles() {
  const { user, hasRole, hasAnyRole, isAdmin, isSuperAdmin } = useAuthQuery();

  const canAccess = useCallback(
    (requiredRoles: string | string[]) => {
      if (!user) return false;

      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];
      return hasAnyRole(roles);
    },
    [user, hasAnyRole]
  );

  const isRole = useCallback((role: string) => hasRole(role), [hasRole]);

  return {
    user,
    userRole: user?.role || null,
    isAdmin,
    isSuperAdmin,
    isUser: user?.role === "user",
    canAccess,
    isRole,
    hasRole,
    hasAnyRole,
  };
}
