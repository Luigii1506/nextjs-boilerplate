/**
 * 🧭 DYNAMIC NAVIGATION PURE - SERVER ACTIONS
 * ============================================
 *
 * Versión 100% pura usando Server Actions directamente.
 * Sin API routes, solo Next.js 15 + React 19 features.
 *
 * Created: 2025-01-29 - Pure Server Actions implementation
 */

"use client";

import React, { useEffect, useState } from "react";
import { Users, Home, Upload, Sliders } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

// 🏷️ Navigation items configuration
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

// 🎨 Static styles
const navStyles = {
  base: "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors",
  active: "bg-slate-100 text-slate-800 font-medium",
  idle: "text-slate-600 hover:text-slate-800 hover:bg-slate-50",
} as const;

interface DynamicNavigationPureProps {
  isAdmin: boolean;
}

/**
 * 🧭 Pure Client Component Navigation Item
 * Uses Server Actions directly - no API calls
 */
function PureNavItem({
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
 * 💀 Navigation Skeleton - Hydration Safe
 */
function NavigationSkeleton() {
  return (
    <nav className="mt-8 space-y-2">
      <Link href="/dashboard" className={`${navStyles.base} ${navStyles.idle}`}>
        <Home className="w-4 h-4" />
        <span>Dashboard</span>
      </Link>
      <Link href="/users" className={`${navStyles.base} ${navStyles.idle}`}>
        <Users className="w-4 h-4" />
        <span>Usuarios</span>
      </Link>
      <div className={`${navStyles.base} opacity-60`}>
        <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
        <span className="text-slate-400">Cargando menú...</span>
      </div>
    </nav>
  );
}

/**
 * 🚀 PURE DYNAMIC NAVIGATION
 * 100% Server Actions - Zero API routes!
 * Leverages React 19 + Next.js 15 features
 */
export default function DynamicNavigationPure({
  isAdmin,
}: DynamicNavigationPureProps) {
  const pathname = usePathname();
  const isEnabled = useIsEnabled(); // ⚡ Pure Server Actions hook
  const [isHydrated, setIsHydrated] = useState(false);

  // 🛡️ Hydration detection
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 🎯 Route active detection
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // 🛡️ Show skeleton during hydration
  if (!isHydrated) {
    return <NavigationSkeleton />;
  }

  // ✅ Render navigation with pure Server Actions
  return (
    <nav className="mt-8 space-y-2">
      {NAVIGATION_CONFIG.map((item) => {
        const featureEnabled = item.requiredFeature
          ? isEnabled(item.requiredFeature)
          : true;

        return (
          <PureNavItem
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
