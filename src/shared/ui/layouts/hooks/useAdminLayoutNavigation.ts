/**
 * 🏛️ ADMIN LAYOUT NAVIGATION HOOK - TANSTACK OPTIMIZED
 * ====================================================
 *
 * Hook específico para AdminLayout con TanStack Query.
 * Optimiza la navegación y el estado del layout.
 *
 * Enterprise: 2025-01-17 - AdminLayout TanStack optimization
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useNavigationQuery } from "@/core/navigation/hooks/useNavigationQuery";
import type { UserRole } from "@/core/navigation";
import type { SessionUser } from "@/shared/types/user";

// 🎯 Hook props interface
interface UseAdminLayoutNavigationProps {
  user: SessionUser;
  userRole: UserRole;
  isAuthenticated: boolean;
}

// 🎯 Hook return interface
interface UseAdminLayoutNavigationReturn {
  // Navigation data
  navigationItems: ReturnType<typeof useNavigationQuery>["navigationItems"];
  categories: ReturnType<typeof useNavigationQuery>["categories"];
  stats: ReturnType<typeof useNavigationQuery>["stats"];
  isRouteActive: ReturnType<typeof useNavigationQuery>["isRouteActive"];
  currentPath: ReturnType<typeof useNavigationQuery>["currentPath"];

  // Loading states
  isNavigationLoading: boolean;
  navigationError: string | null;

  // UI states
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Actions
  handleSearch: () => void;
  handleNotifications: () => void;
  handleSettings: () => void;
  handleProfileClick: () => void;

  // Layout optimizations
  shouldShowMobileMenu: boolean;
  shouldShowDesktopSidebar: boolean;
}

/**
 * ⚡ USE ADMIN LAYOUT NAVIGATION
 *
 * Hook optimizado para AdminLayout que maneja toda la lógica
 * de navegación y UI state con TanStack Query.
 */
export function useAdminLayoutNavigation({
  user,
  userRole,
  isAuthenticated,
}: UseAdminLayoutNavigationProps): UseAdminLayoutNavigationReturn {
  // 🎛️ UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ⚡ TanStack Query optimized navigation
  const {
    navigationItems,
    categories,
    stats,
    isRouteActive,
    currentPath,
    isLoading: isNavigationLoading,
    error: navigationError,
  } = useNavigationQuery({
    userRole,
    isAuthenticated,
    debugMode: process.env.NODE_ENV === "development",
  });

  // 🎯 UI Actions
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleSearch = useCallback(() => {
    console.log("🔍 Search action triggered");
    // TODO: Implement search functionality
  }, []);

  const handleNotifications = useCallback(() => {
    console.log("🔔 Notifications action triggered");
    // TODO: Implement notifications functionality
  }, []);

  const handleSettings = useCallback(() => {
    console.log("⚙️ Settings action triggered");
    // TODO: Navigate to settings page
  }, []);

  const handleProfileClick = useCallback(() => {
    console.log("👤 Profile action triggered", user.email);
    // TODO: Implement profile menu
  }, [user.email]);

  // 📱 Responsive optimizations
  const shouldShowMobileMenu = useMemo(() => {
    // Logic to determine when to show mobile menu
    return true; // Always show for now, can be enhanced with window size detection
  }, []);

  const shouldShowDesktopSidebar = useMemo(() => {
    // Logic to determine when to show desktop sidebar
    return true; // Always show for now, can be enhanced with user preferences
  }, []);

  return {
    // Navigation data
    navigationItems,
    categories,
    stats,
    isRouteActive,
    currentPath,

    // Loading states
    isNavigationLoading,
    navigationError,

    // UI states
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,

    // Actions
    handleSearch,
    handleNotifications,
    handleSettings,
    handleProfileClick,

    // Layout optimizations
    shouldShowMobileMenu,
    shouldShowDesktopSidebar,
  };
}
