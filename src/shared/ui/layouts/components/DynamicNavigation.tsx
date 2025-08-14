/**
 * 🧭 DYNAMIC NAVIGATION - CLIENT COMPONENT
 * =========================================
 *
 * Navegación que se actualiza automáticamente cuando cambian los feature flags.
 * Patrón híbrido usado por Google, Facebook, GitHub para actualizaciones inmediatas.
 *
 * Created: 2025-01-29 - For real-time navigation updates
 */

"use client";

import React, { useEffect, useState } from "react";
import { Users, Home, Upload, Sliders } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFeatureFlags } from "@/shared/hooks/useFeatureFlags";

// 🏷️ Navigation items configuration (same as server version)
const NAVIGATION_CONFIG = [
  {
    href: "/dashboard",
    icon: Home,
    label: "Dashboard",
    requiresAuth: true,
    requiredRole: null,
    requiredFeature: null,
  },
  {
    href: "/users",
    icon: Users,
    label: "Usuarios",
    requiresAuth: true,
    requiredRole: null,
    requiredFeature: null,
  },
  {
    href: "/files",
    icon: Upload,
    label: "📁 Gestión de Archivos",
    requiresAuth: true,
    requiredRole: null,
    requiredFeature: "fileUpload" as const,
  },
  {
    href: "/feature-flags",
    icon: Sliders,
    label: "🎛️ Feature Flags",
    requiresAuth: true,
    requiredRole: "admin" as const,
    requiredFeature: null,
  },
] as const;

// 🎨 Static styles (same as server version)
const navStyles = {
  base: "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors",
  active: "bg-slate-100 text-slate-800 font-medium",
  idle: "text-slate-600 hover:text-slate-800 hover:bg-slate-50",
} as const;

interface DynamicNavigationProps {
  isAdmin: boolean;
}

/**
 * 🧭 Client Component Navigation Item
 * Updates automatically when feature flags change
 */
function ClientNavItem({
  item,
  isActive,
  isAdmin,
  featureEnabled,
}: {
  item: (typeof NAVIGATION_CONFIG)[number];
  isActive: boolean;
  isAdmin: boolean;
  featureEnabled: boolean;
}) {
  // 🛡️ Check role requirements
  if (item.requiredRole === "admin" && !isAdmin) {
    return null;
  }

  // 🎛️ Check feature flag requirements
  if (item.requiredFeature && !featureEnabled) {
    return null;
  }

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`${navStyles.base} ${
        isActive ? navStyles.active : navStyles.idle
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{item.label}</span>
    </Link>
  );
}

/**
 * 💀 Navigation Loading Skeleton
 * Prevents hydration mismatches during feature flag evaluation
 */
function NavigationSkeleton() {
  return (
    <nav className="mt-8 space-y-2">
      {/* Show basic navigation items that don't require feature flags */}
      <Link href="/dashboard" className={`${navStyles.base} ${navStyles.idle}`}>
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>
      <Link href="/users" className={`${navStyles.base} ${navStyles.idle}`}>
        <Users className="w-4 h-4" />
        <span>Usuarios</span>
      </Link>
      {/* Show loading for feature-dependent items */}
      <div className={`${navStyles.base} opacity-60`}>
        <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
        <span className="text-slate-400">Cargando menú...</span>
      </div>
    </nav>
  );
}

/**
 * 🚀 MAIN DYNAMIC NAVIGATION COMPONENT
 * This will re-render automatically when feature flags change
 * 🛡️ HYDRATION-SAFE: Uses skeleton during hydration
 */
export default function DynamicNavigation({ isAdmin }: DynamicNavigationProps) {
  const pathname = usePathname();
  const { isEnabled, isLoading } = useFeatureFlags();
  const [isHydrated, setIsHydrated] = useState(false);

  // 🛡️ Simple hydration detection - run on client mount
  useEffect(() => {
    // Set hydrated immediately on client side
    setIsHydrated(true);
  }, []);

  // 🎯 Determine if route is active
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // 🛡️ Show skeleton during hydration OR while feature flags are loading
  if (!isHydrated || isLoading) {
    return <NavigationSkeleton />;
  }

  // ✅ Safe to render with feature flags after hydration and loading
  return (
    <nav className="mt-8 space-y-2">
      {NAVIGATION_CONFIG.map((item) => {
        const featureEnabled = item.requiredFeature
          ? isEnabled(item.requiredFeature)
          : true;

        return (
          <ClientNavItem
            key={item.href}
            item={item}
            isActive={isActive(item.href)}
            isAdmin={isAdmin}
            featureEnabled={featureEnabled}
          />
        );
      })}
    </nav>
  );
}
