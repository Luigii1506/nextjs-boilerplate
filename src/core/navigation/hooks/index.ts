/**
 * ⚡ NAVIGATION HOOKS - TANSTACK QUERY OPTIMIZED
 * =============================================
 *
 * Solo hooks optimizados con TanStack Query.
 * Zero legacy code, máxima performance empresarial.
 *
 * Enterprise: 2025-01-17 - TanStack Query only
 */

// 🎯 Core TanStack Query navigation hook
export {
  useNavigationQuery,
  useNavigationPrefetch,
  navigationQueryUtils,
  NAVIGATION_QUERY_KEYS,
} from "./useNavigationQuery";

// 📊 Re-export utility functions for convenience
import { useNavigationQuery } from "./useNavigationQuery";
import type { UserRole } from "../constants";

/**
 * 🧭 USE NAVIGATION - Direct TanStack Query Hook
 *
 * Hook optimizado que usa TanStack Query directamente.
 * Reemplaza la capa de compatibilidad con performance superior.
 */
export function useNavigation(props: {
  userRole: UserRole;
  isAuthenticated: boolean;
  debugMode?: boolean;
}) {
  return useNavigationQuery(props);
}
