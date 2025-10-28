/**
 * 📄 TAB HEADER - REUSABLE COMPONENT
 * ===================================
 *
 * Header reutilizable para tabs con título, descripción y acciones.
 * Diseñado para ser flexible y cubrir diferentes casos de uso.
 *
 * Features:
 * - Icon opcional
 * - Título y descripción
 * - Acciones primarias y secundarias
 * - Responsive design
 * - Dark mode support
 * - Animaciones opcionales
 *
 * Casos de uso:
 * - AdminsTab: Título + 1 acción primaria
 * - AnalyticsTab: Título + 2 acciones secundarias + 1 primaria
 * - AllUsersTab: Título + filtros + 1 acción primaria
 * - OverviewTab: Título simple sin acciones
 *
 * Created: 2025-01-18
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Types
export interface TabHeaderAction {
  /** Label del botón */
  label: string;
  /** Icon del botón (React component) */
  icon?: React.ReactNode;
  /** Click handler */
  onClick: () => void;
  /** Variante del botón */
  variant?: "primary" | "secondary" | "ghost";
  /** Color del botón primary */
  color?: "blue" | "purple" | "indigo" | "green" | "red";
  /** Deshabilitar el botón */
  disabled?: boolean;
  /** Clases adicionales */
  className?: string;
}

export interface TabHeaderProps {
  /** Icon principal del header */
  icon?: React.ReactNode;
  /** Título del tab */
  title: string;
  /** Descripción/subtítulo */
  description?: string;
  /** Acciones (botones) */
  actions?: TabHeaderAction[];
  /** Contenido custom para acciones (ej: select, filtros) */
  customActions?: React.ReactNode;
  /** Clases adicionales para el contenedor */
  className?: string;
  /** Habilitar animación de fade in */
  animated?: boolean;
}

// 🎨 Color variants para botones primary
const PRIMARY_COLORS = {
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  purple: "bg-purple-600 hover:bg-purple-700 text-white",
  indigo: "bg-indigo-600 hover:bg-indigo-700 text-white",
  green: "bg-green-600 hover:bg-green-700 text-white",
  red: "bg-red-600 hover:bg-red-700 text-white",
} as const;

/**
 * 📄 TabHeader Component
 */
export const TabHeader: React.FC<TabHeaderProps> = ({
  icon,
  title,
  description,
  actions = [],
  customActions,
  className,
  animated = false,
}) => {
  // Separar acciones por variante
  const primaryActions = actions.filter(
    (action) => action.variant === "primary" || !action.variant
  );
  const secondaryActions = actions.filter(
    (action) => action.variant === "secondary"
  );
  const ghostActions = actions.filter((action) => action.variant === "ghost");

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        animated && "animate-fadeInUp stagger-1",
        className
      )}
    >
      {/* Left: Title & Description */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </h2>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>

      {/* Right: Actions */}
      {(actions.length > 0 || customActions) && (
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Custom Actions (ej: select, filtros) */}
          {customActions}

          {/* Ghost Actions (tertiary) */}
          {ghostActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center space-x-2 px-3 py-2",
                "text-gray-600 dark:text-gray-400",
                "hover:text-gray-900 dark:hover:text-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "rounded-lg transition-colors",
                action.disabled && "opacity-50 cursor-not-allowed",
                action.className
              )}
            >
              {action.icon}
              <span className="text-sm">{action.label}</span>
            </button>
          ))}

          {/* Secondary Actions */}
          {secondaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center space-x-2 px-4 py-2",
                "bg-gray-100 dark:bg-gray-700",
                "text-gray-700 dark:text-gray-300",
                "hover:bg-gray-200 dark:hover:bg-gray-600",
                "rounded-lg transition-colors",
                action.disabled && "opacity-50 cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700",
                action.className
              )}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}

          {/* Primary Actions */}
          {primaryActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors",
                action.color
                  ? PRIMARY_COLORS[action.color]
                  : PRIMARY_COLORS.blue,
                action.disabled && "opacity-50 cursor-not-allowed",
                action.className
              )}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TabHeader;
