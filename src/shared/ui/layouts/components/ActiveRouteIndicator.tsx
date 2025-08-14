/**
 * 🎯 ACTIVE ROUTE INDICATOR - CLIENT COMPONENT
 * ============================================
 *
 * Componente para indicar visualmente la ruta activa.
 * Usando el patrón de "Progressive Enhancement".
 *
 * Created: 2025-01-29
 */

"use client";

import React from "react";
import { usePathname } from "next/navigation";

interface ActiveRouteIndicatorProps {
  targetRoute: string;
  children: React.ReactNode;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function ActiveRouteIndicator({
  targetRoute,
  children,
  activeClassName = "text-blue-600 font-medium",
  inactiveClassName = "text-slate-600",
}: ActiveRouteIndicatorProps) {
  const pathname = usePathname();
  const isActive =
    pathname === targetRoute || pathname.startsWith(targetRoute + "/");

  return (
    <div className={isActive ? activeClassName : inactiveClassName}>
      {children}
    </div>
  );
}
