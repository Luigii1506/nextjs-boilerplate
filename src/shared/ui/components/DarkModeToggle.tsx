/**
 * 🌙 DARK MODE TOGGLE COMPONENT
 * =============================
 *
 * Componente hermoso y funcional para cambiar entre modo claro y oscuro.
 * Actualizado para usar next-themes con feature flag integration.
 *
 * Features:
 * - ✅ Animaciones suaves
 * - ✅ Iconos dinámicos (Sol/Luna)
 * - ✅ Tooltip informativo
 * - ✅ Feature flag integration
 * - ✅ next-themes integration
 * - ✅ Zero FOUC
 * - ✅ Accessibility compliant
 * - ✅ Responsive design
 *
 * Updated: 2025-01-22 - Migrated to next-themes
 */

"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useFeatureFlags } from "@/features/feature-flags";
import { cn } from "@/shared/utils";

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
};

/**
 * 🌙 DarkModeToggle Component
 */
export function DarkModeToggle({
  size = "md",
  variant = "button",
  showTooltip = true,
  className,
  disabled = false,
}: DarkModeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { isEnabled } = useFeatureFlags();
  const [mounted, setMounted] = useState(false);
  const isDarkModeFeatureEnabled = isEnabled("darkMode");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render if feature is disabled or not mounted
  if (!mounted || !isDarkModeFeatureEnabled) {
    return null;
  }

  const isDark = resolvedTheme === "dark";
  const isSystemTheme = theme === "system";

  const toggle = () => {
    if (disabled) return;
    // Force explicit theme, not system
    setTheme(isDark ? "light" : "dark");
  };

  const getTooltipText = () => {
    if (isSystemTheme) {
      return `Tema del sistema (${isDark ? "oscuro" : "claro"})`;
    }
    return isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
  };

  if (variant === "icon") {
    return (
      <button
        onClick={toggle}
        disabled={disabled}
        className={cn(
          "rounded-md transition-colors duration-200",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500",
          SIZE_CONFIG[size].button,
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        title={showTooltip ? getTooltipText() : undefined}
        aria-label={getTooltipText()}
      >
        {isDark ? (
          <Sun className={cn(SIZE_CONFIG[size].icon, "text-yellow-500")} />
        ) : (
          <Moon className={cn(SIZE_CONFIG[size].icon, "text-blue-600")} />
        )}
      </button>
    );
  }

  if (variant === "switch") {
    return (
      <button
        onClick={toggle}
        disabled={disabled}
        className={cn(
          "relative inline-flex items-center justify-center",
          "w-14 h-8 rounded-full transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          isDark
            ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
            : "bg-amber-400 hover:bg-amber-500 focus:ring-amber-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        title={showTooltip ? getTooltipText() : undefined}
        aria-label={getTooltipText()}
        role="switch"
        aria-checked={isDark}
      >
        {/* Switch Track Background */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute inset-0 transition-transform duration-300",
              isDark ? "translate-x-0" : "-translate-x-full"
            )}
          >
            {/* Stars for dark mode */}
            <div className="absolute inset-0 flex items-center justify-around px-2">
              <span className="text-yellow-300 text-xs">✨</span>
              <span className="text-yellow-200 text-[8px]">⭐</span>
            </div>
          </div>
        </div>

        {/* Sliding Thumb */}
        <div
          className={cn(
            "absolute top-1 transition-all duration-300 ease-out",
            "w-6 h-6 rounded-full shadow-lg",
            "flex items-center justify-center",
            isDark
              ? "left-7 bg-slate-800"
              : "left-1 bg-white"
          )}
        >
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-300" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </div>
      </button>
    );
  }

  // Default button variant
  return (
    <button
      onClick={toggle}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        "hover:bg-gray-50 dark:hover:bg-gray-700",
        "focus:outline-none focus:ring-2 focus:ring-blue-500",
        "transition-all duration-200 shadow-sm",
        SIZE_CONFIG[size].text,
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      title={showTooltip ? getTooltipText() : undefined}
      aria-label={getTooltipText()}
    >
      {isDark ? (
        <Sun className={cn(SIZE_CONFIG[size].icon, "text-yellow-500")} />
      ) : (
        <Moon className={cn(SIZE_CONFIG[size].icon, "text-blue-600")} />
      )}
      <span className="text-gray-700 dark:text-gray-300">
        {isDark ? "Claro" : "Oscuro"}
      </span>
    </button>
  );
}

export default DarkModeToggle;
