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

    // Guard against SSR
    if (typeof window === "undefined") return;

    // 🎯 Implementación: Command Palette / Search Modal
    const event = new CustomEvent("admin-search", {
      detail: {
        source: "admin-layout",
        user: user.email,
        currentPath,
      },
    });
    window.dispatchEvent(event);

    // 🚀 Alternative: Open search modal if available
    // setSearchModalOpen?.(true);

    // 📊 Analytics tracking
    if (window.gtag) {
      window.gtag("event", "admin_search_triggered", {
        event_category: "navigation",
        event_label: "header_search",
      });
    }
  }, [user.email, currentPath]);

  const handleNotifications = useCallback(() => {
    console.log("🔔 Notifications action triggered");

    // Guard against SSR
    if (typeof window === "undefined") return;

    // 🎯 Implementación: Toggle notifications panel
    const event = new CustomEvent("admin-notifications", {
      detail: {
        action: "toggle",
        user: user.email,
        timestamp: new Date().toISOString(),
      },
    });
    window.dispatchEvent(event);

    // 🚀 Alternative: Navigate to notifications page
    // window.location.href = '/admin/notifications';

    // 📊 Analytics tracking
    if (window.gtag) {
      window.gtag("event", "admin_notifications_opened", {
        event_category: "navigation",
        event_label: "header_notifications",
      });
    }
  }, [user.email]);

  const handleSettings = useCallback(() => {
    console.log("⚙️ Settings action triggered");

    // Guard against SSR
    if (typeof window === "undefined") return;

    // 🎯 Implementación: Navigate to settings
    const settingsUrl = "/admin/settings";

    // 📊 Analytics before navigation
    if (window.gtag) {
      window.gtag("event", "admin_settings_accessed", {
        event_category: "navigation",
        event_label: "header_settings",
      });
    }

    // 🚀 Navigation
    window.location.href = settingsUrl;

    // Alternative with next/router if needed:
    // import { useRouter } from 'next/navigation';
    // const router = useRouter();
    // router.push(settingsUrl);
  }, []);

  const handleProfileClick = useCallback(() => {
    console.log("👤 Profile action triggered", user.email);

    // Guard against SSR
    if (typeof window === "undefined") return;

    // 🎯 Implementación: Toggle profile dropdown menu
    const event = new CustomEvent("admin-profile-menu", {
      detail: {
        action: "toggle",
        user: {
          email: user.email,
          name: user.name,
          role: userRole,
        },
      },
    });
    window.dispatchEvent(event);

    // 🚀 Alternative: Direct navigation to profile
    // window.location.href = '/admin/profile';

    // 📊 Analytics tracking
    if (window.gtag) {
      window.gtag("event", "admin_profile_menu_opened", {
        event_category: "navigation",
        event_label: "header_profile",
      });
    }
  }, [user.email, user.name, userRole]);

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
