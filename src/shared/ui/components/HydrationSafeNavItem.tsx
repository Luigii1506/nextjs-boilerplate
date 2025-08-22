/**
 * 🧭 HYDRATION-SAFE NAVIGATION ITEM
 * ==================================
 *
 * Componente de navegación que previene errores de hidratación
 * cuando depende de feature flags cargados dinámicamente.
 *
 * Estrategia profesional:
 * - Muestra placeholder durante la hidratación inicial
 * - Solo renderiza el contenido real después de que los feature flags se carguen
 * - Mantiene consistencia visual con skeletons elegantes
 *
 * Created: 2025-01-29
 */

"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { useHydrationWithDependencies } from "@/shared/hooks/useHydration";
import { useIsEnabled } from "@/features/admin/feature-flags";

interface HydrationSafeNavItemProps {
  /** Ruta de navegación */
  href: string;
  /** Icono del elemento de navegación */
  icon: LucideIcon;
  /** Texto del elemento de navegación */
  label: string;
  /** Feature flag requerida para mostrar este elemento */
  requiredFeatureFlag: string;
  /** Función para detectar si la ruta está activa */
  isActive: (href: string) => boolean;
  /** Clases CSS base para navegación */
  navBase: string;
  /** Clases CSS para estado activo */
  navActive: string;
  /** Clases CSS para estado inactivo */
  navIdle: string;
}

/**
 * Skeleton placeholder que coincide exactamente con el tamaño del nav item real
 */
function NavItemSkeleton({ navBase }: { navBase: string }) {
  return (
    <div className={`${navBase} animate-pulse`}>
      {/* Placeholder para el icono */}
      <div className="w-4 h-4 bg-slate-200 rounded"></div>
      {/* Placeholder para el texto */}
      <div className="h-4 bg-slate-200 rounded flex-1"></div>
    </div>
  );
}

/**
 * Componente de navegación que es seguro para hidratación
 * y depende de feature flags dinámicos
 */
export function HydrationSafeNavItem({
  href,
  icon: Icon,
  label,
  requiredFeatureFlag,
  isActive,
  navBase,
  navActive,
  navIdle,
}: HydrationSafeNavItemProps) {
  // Feature flags are now handled by the isEnabled function directly
  const isLoading = false; // No longer needed with consolidated system
  const isEnabled = useIsEnabled();

  // Detectar cuando la hidratación está completa Y los feature flags se han cargado
  const { isReady } = useHydrationWithDependencies([!isLoading]);

  // Durante la carga inicial (SSR + hidratación + feature flags loading)
  // mostramos un skeleton para evitar layout shift
  if (!isReady) {
    return <NavItemSkeleton navBase={navBase} />;
  }

  // Una vez que todo está listo, verificamos si el feature flag está activo
  const featureEnabled = isEnabled(
    requiredFeatureFlag as "fileUpload" | "userManagement" | "analytics"
  );

  // Si la feature no está habilitada, no renderizamos nada
  if (!featureEnabled) {
    return null;
  }

  // Renderizar el nav item normal
  const isItemActive = isActive(href);

  return (
    <Link
      href={href}
      className={`${navBase} ${isItemActive ? navActive : navIdle}`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}

/**
 * Hook especializado para nav items con feature flags
 * Proporciona toda la lógica necesaria de manera reutilizable
 */
export function useNavItemFeatureFlag(requiredFeatureFlag: string) {
  // Feature flags are now handled by the isEnabled function directly
  const isLoading = false; // No longer needed with consolidated system
  const isEnabled = useIsEnabled();
  const { isReady } = useHydrationWithDependencies([!isLoading]);

  return {
    isReady,
    isFeatureEnabled: isReady
      ? isEnabled(
          requiredFeatureFlag as "fileUpload" | "userManagement" | "analytics"
        )
      : false,
    shouldRender:
      isReady &&
      isEnabled(
        requiredFeatureFlag as "fileUpload" | "userManagement" | "analytics"
      ),
    shouldShowSkeleton: !isReady,
  };
}

/**
 * Versión más simple para casos donde solo necesitas renderizado condicional
 */
interface FeatureGatedNavItemProps {
  requiredFeatureFlag: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showSkeletonWhileLoading?: boolean;
  navBase?: string;
}

export function FeatureGatedNavItem({
  requiredFeatureFlag,
  children,
  fallback = null,
  showSkeletonWhileLoading = true,
  navBase = "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors",
}: FeatureGatedNavItemProps) {
  const { isReady, shouldRender, shouldShowSkeleton } =
    useNavItemFeatureFlag(requiredFeatureFlag);

  if (shouldShowSkeleton && showSkeletonWhileLoading) {
    return <NavItemSkeleton navBase={navBase} />;
  }

  if (!isReady) {
    return <>{fallback}</>;
  }

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
