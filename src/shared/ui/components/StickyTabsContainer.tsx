/**
 * 📌 STICKY TABS CONTAINER - REUSABLE COMPONENT
 * ==============================================
 *
 * Wrapper reutilizable para ReusableTabs que proporciona:
 * - Sticky positioning con z-index correcto
 * - Container con bordes redondeados
 * - Responsive padding y spacing
 * - Consistent styling across all sections
 *
 * Este componente estandariza el layout de tabs en toda la app,
 * eliminando la duplicación del wrapper sticky que se repite en:
 * - /users
 * - /inventory
 * - /suppliers
 * - /files
 * - /seller-portal
 * - /audit
 *
 * Usage:
 * ```tsx
 * <StickyTabsContainer>
 *   <ReusableTabs
 *     tabs={tabs}
 *     activeTab={activeTab}
 *     onTabChange={setActiveTab}
 *   />
 * </StickyTabsContainer>
 * ```
 *
 * With responsive variant:
 * ```tsx
 * <StickyTabsContainer responsive={true}>
 *   <ReusableTabs ... />
 * </StickyTabsContainer>
 * ```
 *
 * Created: 2025-01-18
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Types
export interface StickyTabsContainerProps {
  /** Content to render (typically ReusableTabs) */
  children: React.ReactNode;
  /** Use responsive padding (mobile-friendly) */
  responsive?: boolean;
  /** Z-index value for sticky positioning */
  zIndex?: number;
  /** Additional CSS classes for the outer container */
  className?: string;
  /** Additional CSS classes for the inner wrapper */
  innerClassName?: string;
  /** Additional CSS classes for the tabs container */
  containerClassName?: string;
}

/**
 * 📌 StickyTabsContainer Component
 *
 * Proporciona un wrapper sticky consistente para ReusableTabs
 * con responsive design y dark mode support.
 */
export const StickyTabsContainer: React.FC<StickyTabsContainerProps> = ({
  children,
  responsive = true,
  zIndex = 20,
  className,
  innerClassName,
  containerClassName,
}) => {
  return (
    <div
      className={cn(
        "sticky top-0 bg-gray-50 dark:bg-gray-900",
        className
      )}
      style={{ zIndex }}
    >
      {/* Responsive Wrapper */}
      <div
        className={cn(
          responsive
            ? "w-full px-4 pt-4 sm:px-6 sm:pt-6"
            : "max-w-[1600px] mx-auto px-6 pt-6",
          innerClassName
        )}
      >
        {/* Max-width Container (for responsive mode) */}
        {responsive ? (
          <div className="max-w-full xl:max-w-[1600px] mx-auto">
            {/* Rounded Container with Border */}
            <div
              className={cn(
                "bg-white dark:bg-gray-800",
                "rounded-lg sm:rounded-xl",
                "shadow-sm",
                "border border-gray-200 dark:border-gray-700",
                "p-1.5 sm:p-2",
                containerClassName
              )}
            >
              {children}
            </div>
          </div>
        ) : (
          /* Non-responsive variant */
          <div
            className={cn(
              "bg-white dark:bg-gray-800",
              "rounded-xl",
              "shadow-sm",
              "border border-gray-200 dark:border-gray-700",
              "p-2",
              containerClassName
            )}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default StickyTabsContainer;
