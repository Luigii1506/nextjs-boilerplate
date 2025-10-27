/**
 * 📊 TAB FOOTER STATS COMPONENT
 * ==============================
 *
 * Footer con estadísticas y acciones para tabs
 * Muestra contadores, filtros aplicados y botones de acción
 *
 * Created: 2025-01-27 - Tab Footer Stats Component
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface TabFooterStatsAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export interface TabFooterStatsProps {
  /**
   * Texto principal mostrando el conteo
   */
  count: string;
  /**
   * Acciones disponibles en el footer
   */
  actions?: TabFooterStatsAction[];
  /**
   * Mostrar como filtrado
   */
  isFiltered?: boolean;
  className?: string;
}

/**
 * TabFooterStats - Footer con estadísticas
 *
 * @example
 * ```tsx
 * <TabFooterStats
 *   count={`Mostrando ${filteredUsers.length} usuarios`}
 *   isFiltered={hasFilters}
 *   actions={[
 *     {
 *       label: "Exportar",
 *       icon: <Download className="w-4 h-4" />,
 *       onClick: handleExport
 *     }
 *   ]}
 * />
 * ```
 */
export const TabFooterStats: React.FC<TabFooterStatsProps> = ({
  count,
  actions,
  isFiltered,
  className,
}) => {
  return (
    <div
      className={cn(
        "border-t border-gray-200 dark:border-gray-700 pt-6",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {count}
            {isFiltered && (
              <span className="ml-1 text-blue-600 dark:text-blue-400">
                (filtrado)
              </span>
            )}
          </p>
        </div>
        {actions && actions.length > 0 && (
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabFooterStats;
