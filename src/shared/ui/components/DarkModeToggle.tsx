/**
 * 🌙 DARK MODE TOGGLE COMPONENT
 * =============================
 *
 * Componente hermoso y funcional para cambiar entre modo claro y oscuro.
 *
 * Features:
 * - ✅ Animaciones suaves
 * - ✅ Iconos dinámicos (Sol/Luna)
 * - ✅ Tooltip informativo
 * - ✅ Feature flag integration
 * - ✅ Accessibility compliant
 * - ✅ Responsive design
 *
 * Created: 2025-01-17 - Dark mode implementation
 */

"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/shared/utils";
import { useDarkMode } from "@/shared/hooks";

// 🎯 Types
interface DarkModeToggleProps {
  size?: "sm" | "md" | "lg";
  variant?: "button" | "switch" | "icon";
  showTooltip?: boolean;
  className?: string;
  disabled?: boolean;
}

// 🎨 Size configurations
const SIZE_CONFIG = {
  sm: {
    button: "h-8 w-8 p-1.5",
    icon: "w-4 h-4",
    text: "text-xs",
  },
  md: {
    button: "h-10 w-10 p-2",
    icon: "w-5 h-5",
    text: "text-sm",
  },
  lg: {
    button: "h-12 w-12 p-2.5",
    icon: "w-6 h-6",
    text: "text-base",
  },
} as const;

/**
 * 🌙 DarkModeToggle Component
 *
 * Componente para alternar entre modo claro y oscuro
 */
export function DarkModeToggle({
  size = "md",
  variant = "button",
  showTooltip = true,
  className,
  disabled = false,
}: DarkModeToggleProps) {
  const { isDarkMode, isEnabled, toggle } = useDarkMode();

  // 🚫 No renderizar si el feature flag está desactivado
  if (!isEnabled) {
    return null;
  }

  const sizeConfig = SIZE_CONFIG[size];
  const isDisabled = disabled || !isEnabled;

  // 🎨 Button variant
  if (variant === "button") {
    return (
      <div className="relative group">
        <button
          onClick={toggle}
          disabled={isDisabled}
          className={cn(
            // Base styles
            "relative rounded-lg transition-all duration-300 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",

            // Size
            sizeConfig.button,

            // Colors - Light mode
            "bg-slate-100 hover:bg-slate-200 text-slate-700",
            "border border-slate-200 hover:border-slate-300",

            // Colors - Dark mode
            "dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300",
            "dark:border-slate-700 dark:hover:border-slate-600",

            // Animation
            "transform hover:scale-105 active:scale-95",

            className
          )}
          aria-label={
            isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
          }
          title={
            showTooltip
              ? isDarkMode
                ? "Modo claro"
                : "Modo oscuro"
              : undefined
          }
        >
          {/* Icon with rotation animation */}
          <div className="relative flex items-center justify-center">
            <Sun
              className={cn(
                sizeConfig.icon,
                "absolute transition-all duration-500 ease-in-out",
                isDarkMode
                  ? "opacity-0 rotate-90 scale-0"
                  : "opacity-100 rotate-0 scale-100"
              )}
            />
            <Moon
              className={cn(
                sizeConfig.icon,
                "absolute transition-all duration-500 ease-in-out",
                isDarkMode
                  ? "opacity-100 rotate-0 scale-100"
                  : "opacity-0 -rotate-90 scale-0"
              )}
            />
          </div>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>
    );
  }

  // 🎛️ Switch variant
  if (variant === "switch") {
    return (
      <div className="relative group">
        <button
          onClick={toggle}
          disabled={isDisabled}
          className={cn(
            "relative inline-flex items-center rounded-full transition-all duration-300 ease-in-out",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:opacity-50 disabled:cursor-not-allowed",

            // Size based on size prop
            size === "sm"
              ? "h-6 w-11"
              : size === "lg"
              ? "h-8 w-14"
              : "h-7 w-12",

            // Colors
            isDarkMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-300 hover:bg-slate-400",

            className
          )}
          aria-label={
            isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
          }
          title={
            showTooltip
              ? isDarkMode
                ? "Modo claro"
                : "Modo oscuro"
              : undefined
          }
        >
          {/* Switch knob */}
          <span
            className={cn(
              "inline-block rounded-full bg-white shadow-lg transform transition-all duration-300 ease-in-out",

              // Size
              size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5",

              // Position
              isDarkMode
                ? size === "sm"
                  ? "translate-x-6"
                  : size === "lg"
                  ? "translate-x-8"
                  : "translate-x-7"
                : "translate-x-1",

              // Icon container
              "flex items-center justify-center"
            )}
          >
            {/* Mini icons in switch */}
            <Sun
              className={cn(
                size === "sm"
                  ? "w-2 h-2"
                  : size === "lg"
                  ? "w-3 h-3"
                  : "w-2.5 h-2.5",
                "text-yellow-500 transition-opacity duration-300",
                isDarkMode ? "opacity-0" : "opacity-100"
              )}
            />
            <Moon
              className={cn(
                size === "sm"
                  ? "w-2 h-2"
                  : size === "lg"
                  ? "w-3 h-3"
                  : "w-2.5 h-2.5",
                "text-blue-600 absolute transition-opacity duration-300",
                isDarkMode ? "opacity-100" : "opacity-0"
              )}
            />
          </span>
        </button>

        {/* Tooltip for switch */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        )}
      </div>
    );
  }

  // 🎯 Icon variant (minimal)
  return (
    <button
      onClick={toggle}
      disabled={isDisabled}
      className={cn(
        "p-2 rounded-lg transition-all duration-200 ease-in-out",
        "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
        "dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={
        showTooltip ? (isDarkMode ? "Modo claro" : "Modo oscuro") : undefined
      }
    >
      {isDarkMode ? (
        <Sun className={sizeConfig.icon} />
      ) : (
        <Moon className={sizeConfig.icon} />
      )}
    </button>
  );
}

export default DarkModeToggle;
