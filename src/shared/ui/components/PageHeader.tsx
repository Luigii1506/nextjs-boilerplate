/**
 * 📄 PAGE HEADER - REUSABLE COMPONENT
 * ====================================
 *
 * Header reutilizable para todas las secciones administrativas
 * Diseñado para ser responsivo y consistente en toda la app.
 *
 * Features:
 * - Responsive design (mobile-first)
 * - Dark mode support
 * - Optional action button
 * - Quick stats display
 * - Icon support
 * - Smooth animations
 *
 * Usage:
 * ```tsx
 * <PageHeader
 *   icon={<Users className="w-8 h-8" />}
 *   title="Gestión de Usuarios"
 *   description="Administra usuarios, roles y permisos"
 *   stats={[
 *     { icon: <Users />, label: "120 Total", color: "blue" },
 *     { icon: <UserCheck />, label: "95 Activos", color: "green" }
 *   ]}
 *   action={<Settings className="w-5 h-5" />}
 *   onActionClick={() => console.log('Settings clicked')}
 * />
 * ```
 *
 * Created: 2025-01-18
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Types
export interface StatItem {
  icon: React.ReactNode;
  label: string;
  color: "blue" | "green" | "purple" | "orange" | "red" | "yellow" | "indigo";
  value?: string | number;
}

export interface PageHeaderProps {
  /** Main icon for the header */
  icon?: React.ReactNode;
  /** Title of the page */
  title: string;
  /** Description/subtitle */
  description?: string;
  /** Quick stats to display */
  stats?: StatItem[];
  /** Optional action button icon */
  action?: React.ReactNode;
  /** Action button click handler */
  onActionClick?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Hide the header (for animations) */
  hidden?: boolean;
}

// 🎨 Color variants for stats
const statColorVariants = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-blue-900 dark:text-blue-100",
  green:
    "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-green-900 dark:text-green-100",
  purple:
    "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-purple-900 dark:text-purple-100",
  orange:
    "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-orange-900 dark:text-orange-100",
  red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-red-900 dark:text-red-100",
  yellow:
    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-yellow-900 dark:text-yellow-100",
  indigo:
    "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-indigo-900 dark:text-indigo-100",
} as const;

/**
 * 📄 PageHeader Component
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  stats = [],
  action,
  onActionClick,
  className,
  hidden = false,
}) => {
  if (hidden) return null;

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out animate-fadeIn",
        className
      )}
    >
      <div className="border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="max-w-full xl:max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-4">
              {/* Title Section - Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 sm:gap-3">
                    {icon && (
                      <span className="text-blue-600 dark:text-blue-400">
                        {icon}
                      </span>
                    )}
                    <span>{title}</span>
                  </h1>
                  {description && (
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {description}
                    </p>
                  )}
                </div>

                {/* Action Button - Desktop only */}
                {action && onActionClick && (
                  <button
                    onClick={onActionClick}
                    className="hidden sm:block p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    aria-label="Configuración"
                  >
                    {action}
                  </button>
                )}
              </div>

              {/* Quick Stats - Responsive Grid */}
              {stats.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {stats.map((stat, index) => {
                    const colors = statColorVariants[stat.color];
                    const [bgColor, iconColor, textColor] = colors.split(" ");

                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg flex-1 sm:flex-initial min-w-0",
                          bgColor
                        )}
                      >
                        <span className={cn("flex-shrink-0", iconColor)}>
                          {stat.icon}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-medium truncate",
                            textColor
                          )}
                        >
                          {stat.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
