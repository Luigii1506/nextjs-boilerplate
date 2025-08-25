/**
 * 🚀 SPA WRAPPER COMPONENT - UNIVERSAL
 * ====================================
 *
 * Componente wrapper universal para todas las SPAs de la aplicación
 * Incluye scroll smooth, animaciones perfectas y navegación por tabs
 *
 * Features:
 * - Scroll header ultra-smooth
 * - Tabs navigation integrada
 * - Animaciones GPU optimizadas
 * - Responsive design
 * - Zero config para nuevos módulos
 *
 * Usage:
 * <SPAWrapper
 *   title="Gestión de Usuarios"
 *   description="Administra usuarios, roles y permisos"
 *   tabs={USERS_TABS}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * >
 *   <YourTabContent />
 * </SPAWrapper>
 *
 * Created: 2025-01-18 - Universal SPA Wrapper
 */

"use client";

import React, { ReactNode } from "react";
import { cn } from "@/shared/utils";
import { ReusableTabs, type TabItem } from "./ReusableTabs";
import { useScrollHeader } from "@/shared/hooks/useScrollHeader";

export interface SPAWrapperProps {
  /** Título principal del módulo */
  title: string;
  /** Descripción del módulo */
  description?: string;
  /** Array de tabs para navegación */
  tabs: TabItem[];
  /** Tab activo actual */
  activeTab: string;
  /** Callback para cambio de tab */
  onTabChange: (tabId: string) => void;
  /** Contenido de los tabs */
  children: ReactNode;
  /** Classname adicional para el wrapper */
  className?: string;
  /** Stats o información adicional */
  stats?: {
    label: string;
    value: string | number;
    color?: "blue" | "green" | "yellow" | "red" | "purple";
  }[];
  /** Acciones adicionales en el header */
  headerActions?: ReactNode;
  /** Configuración del scroll */
  scrollConfig?: {
    threshold?: number;
    wheelSensitivity?: number;
    debug?: boolean;
  };
}

/**
 * 🎯 Universal SPA Wrapper Component
 */
const SPAWrapper: React.FC<SPAWrapperProps> = ({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  stats,
  headerActions,
  scrollConfig = {},
}) => {
  // 🚀 Scroll header hook
  const { scrollY, isHeaderVisible, isPastThreshold } = useScrollHeader({
    threshold: scrollConfig.threshold || 50,
    wheelSensitivity: scrollConfig.wheelSensitivity || 0.5,
    useWheelFallback: true,
    debug: scrollConfig.debug || false,
  });

  // 🎯 Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🎯 Handle tab change with smooth scroll to top
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    scrollToTop();
  };

  // 📊 Stats colors mapping
  const getStatsColor = (color: string = "blue") => {
    const colors = {
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      green:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      yellow:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      purple:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900", className)}>
      {/* 🎯 Fixed Navigation */}
      <div
        className={cn(
          "border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50",
          "transform-gpu transition-all duration-300",
          // Backdrop blur effect when scrolled
          isPastThreshold
            ? "header-backdrop scrolled bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
            : "bg-white dark:bg-gray-800"
        )}
        style={{
          transform: `translateY(${
            scrollY > 0 ? Math.min(scrollY * 0.1, 10) : 0
          }px)`,
        }}
      >
        <div className="px-6 py-4">
          {/* 📋 Smart Header with Smooth Animations */}
          <div
            className={cn(
              "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
              "transform-gpu transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isHeaderVisible
                ? "opacity-100 translate-y-0 scale-y-100 mb-6 max-h-96"
                : "opacity-0 -translate-y-3 scale-y-90 mb-0 max-h-0 overflow-hidden pointer-events-none"
            )}
            style={{
              visibility: isHeaderVisible ? "visible" : "hidden",
              transitionProperty:
                "opacity, transform, margin-bottom, max-height",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* 📝 Title and Description */}
            <div className="flex-1">
              <div
                className={cn(
                  "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                  isHeaderVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-2"
                )}
              >
                <h1
                  className={cn(
                    "text-2xl font-bold text-gray-900 dark:text-white",
                    "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                    isHeaderVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-1"
                  )}
                >
                  {title}
                </h1>

                {description && (
                  <p
                    className={cn(
                      "text-gray-600 dark:text-gray-400 mt-1",
                      "transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                      isHeaderVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-1"
                    )}
                  >
                    {description}
                  </p>
                )}

                {/* 📊 Stats Row */}
                {stats && stats.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {stats.map((stat, index) => (
                      <div
                        key={index}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                          getStatsColor(stat.color)
                        )}
                      >
                        <span className="font-semibold">{stat.value}</span>
                        <span>{stat.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 🎯 Header Actions */}
            {headerActions && (
              <div
                className={cn(
                  "flex items-center space-x-3",
                  "transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                  isHeaderVisible
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 translate-x-4 scale-98"
                )}
              >
                {headerActions}
              </div>
            )}
          </div>

          {/* 🎨 Tabs Navigation - ALWAYS VISIBLE */}
          <div className="pt-4">
            <ReusableTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              variant="underline"
              size="lg"
              showIcons={true}
              showNotifications={true}
              className="border-none"
            />
          </div>
        </div>
      </div>

      {/* 📄 Main Content Area */}
      <main className="flex-1 relative">
        <div className="transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SPAWrapper;
