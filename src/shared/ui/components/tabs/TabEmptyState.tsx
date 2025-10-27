/**
 * 🎭 TAB EMPTY STATE COMPONENT
 * =============================
 *
 * Estado vacío estandarizado para tabs
 * Muestra mensaje cuando no hay datos
 *
 * Created: 2025-01-27 - Tab Empty State Component
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

export interface TabEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  /**
   * Botón de acción opcional
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

/**
 * TabEmptyState - Estado vacío estándar para tabs
 *
 * @example
 * ```tsx
 * <TabEmptyState
 *   icon={<Users className="w-20 h-20" />}
 *   title="No se encontraron usuarios"
 *   description="Aún no hay usuarios registrados"
 *   action={{
 *     label: "Crear Usuario",
 *     onClick: handleCreate,
 *     icon: <Plus className="w-5 h-5" />
 *   }}
 * />
 * ```
 */
export const TabEmptyState: React.FC<TabEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn("text-center py-16", className)}>
      <div className="text-gray-300 dark:text-gray-600 mx-auto mb-6 flex justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 mx-auto transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};

export default TabEmptyState;
