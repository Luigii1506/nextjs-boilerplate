/**
 * 🧭 NAVIGATION COMPONENT
 * =======================
 *
 * Componente de navegación estándar:
 * ✅ Feature flags reactivos con broadcast
 * ✅ Filtrado por roles automático
 * ✅ Hydration safe
 * ✅ Performance optimizado
 *
 * Standard: 2025-01-17 - Clean and simple navigation
 */

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useNavigation } from "@/core/navigation/useNavigation";
import { NAVIGATION_STYLES } from "@/core";

interface NavigationProps {
  userRole: "user" | "admin" | "super_admin";
}

/**
 * 🧭 NAVIGATION COMPONENT
 * Componente estándar de navegación
 */
export default function Navigation({ userRole }: NavigationProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  // 🛡️ Hydration detection
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 🧭 Hook que maneja TODO automáticamente
  const { navigationItems, isRouteActive } = useNavigation({
    userRole,
    isAuthenticated: true,
    debugMode: process.env.NODE_ENV === "development",
  });

  // 🛡️ Loading state
  if (!isHydrated) {
    return (
      <nav className="mt-8 space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${NAVIGATION_STYLES.base} opacity-60`}>
            <div className="w-4 h-4 bg-slate-300 rounded animate-pulse" />
            <span className="text-slate-400">Cargando...</span>
          </div>
        ))}
      </nav>
    );
  }

  // ✅ Render - SÚPER SIMPLE
  return (
    <nav className="mt-8 space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = isRouteActive(item.href);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${NAVIGATION_STYLES.base} ${
              isActive ? NAVIGATION_STYLES.active : NAVIGATION_STYLES.idle
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
            {item.badge && (
              <span className={NAVIGATION_STYLES.badge}>{item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
