/**
 * ⏳ TAB LOADING SKELETON COMPONENT
 * ==================================
 *
 * Skeletons de carga estandarizados para tabs
 * Diferentes layouts según el tipo de contenido
 *
 * Created: 2025-01-27 - Tab Loading Skeleton Component
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface TabLoadingSkeletonProps {
  /**
   * Tipo de layout del skeleton
   * - "stats": Grid de tarjetas de estadísticas
   * - "list": Lista vertical de items
   * - "grid": Grid de cards (usuarios, productos, etc)
   * - "table": Tabla con filas
   */
  type: "stats" | "list" | "grid" | "table";
  /**
   * Número de items a mostrar
   * @default 4 para stats, 6 para grid, 5 para list/table
   */
  count?: number;
  /**
   * Número de filas (alias para count, para compatibilidad)
   * @deprecated Use count instead
   */
  rows?: number;
  /**
   * Mostrar header skeleton
   * @default true
   */
  showHeader?: boolean;
  className?: string;
}

/**
 * TabLoadingSkeleton - Skeletons de carga unificados
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <TabLoadingSkeleton type="stats" count={4} />
 * }
 * ```
 */
export const TabLoadingSkeleton: React.FC<TabLoadingSkeletonProps> = ({
  type,
  count,
  rows,
  showHeader = true,
  className,
}) => {
  const defaultCount = {
    stats: 4,
    grid: 6,
    list: 5,
    table: 5,
  };

  const itemCount = count ?? rows ?? defaultCount[type];

  const renderStatsSkeleton = () => (
    <div className="space-y-6">
      {showHeader && (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(itemCount)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="space-y-6">
      {showHeader && (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(itemCount)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="space-y-6">
      {showHeader && (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
      )}
      <div className="space-y-4">
        {[...Array(itemCount)].map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="space-y-6">
      {showHeader && (
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
      )}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="h-12 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 animate-pulse" />
        {/* Table rows */}
        {[...Array(itemCount)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 last:border-b-0 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    </div>
  );

  const skeletons = {
    stats: renderStatsSkeleton,
    grid: renderGridSkeleton,
    list: renderListSkeleton,
    table: renderTableSkeleton,
  };

  return (
    <div className={cn("animate-pulse", className)}>
      {skeletons[type]()}
    </div>
  );
};

export default TabLoadingSkeleton;
