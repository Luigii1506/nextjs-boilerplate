/**
 * 🌍 I18N TOGGLE COMPONENT
 * ========================
 *
 * Beautiful, accessible component for toggling between languages.
 * Only renders when the i18n feature flag is enabled.
 *
 * Features:
 * - Multiple variants (button, switch, icon)
 * - Multiple sizes (sm, md, lg)
 * - Smooth animations
 * - Tooltips
 * - Accessibility support
 * - Feature flag integration
 * - Cross-tab synchronization
 *
 * Created: 2025-01-17 - I18n feature implementation
 */

"use client";

import React from "react";
import { Languages, Globe } from "lucide-react";
import { useI18n } from "@/shared/hooks/useI18n";
import { cn } from "@/shared/utils/cn";

// 🎨 Component variants
type I18nToggleVariant = "button" | "switch" | "icon";
type I18nToggleSize = "sm" | "md" | "lg";

// 🎯 Component props
interface I18nToggleProps {
  variant?: I18nToggleVariant;
  size?: I18nToggleSize;
  className?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
}

/**
 * 🌍 I18nToggle Component
 *
 * Renders a language toggle control that only appears when the i18n feature flag is enabled.
 * Supports multiple variants and sizes with smooth animations.
 */
export function I18nToggle({
  variant = "button",
  size = "md",
  className,
  showLabel = true,
  showTooltip = true,
}: I18nToggleProps) {
  const { language, isFeatureEnabled, toggleLanguage, getLanguageName, t } =
    useI18n();

  // 🚫 Don't render if feature is disabled
  if (!isFeatureEnabled) {
    return null;
  }

  // 🎨 Size configurations
  const sizeConfig = {
    sm: {
      button: "px-2 py-1 text-xs",
      icon: "w-4 h-4",
      text: "text-xs",
      switch: "w-8 h-4",
      switchThumb: "w-3 h-3",
    },
    md: {
      button: "px-3 py-2 text-sm",
      icon: "w-5 h-5",
      text: "text-sm",
      switch: "w-10 h-5",
      switchThumb: "w-4 h-4",
    },
    lg: {
      button: "px-4 py-3 text-base",
      icon: "w-6 h-6",
      text: "text-base",
      switch: "w-12 h-6",
      switchThumb: "w-5 h-5",
    },
  };

  const config = sizeConfig[size];

  // 🎯 Button variant
  if (variant === "button") {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          // Base styles
          "inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-300",
          "border border-slate-200 bg-white hover:bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-offset-slate-900",

          // Size
          config.button,
          config.text,

          // Custom className
          className
        )}
        title={showTooltip ? t.language.tooltip : undefined}
        aria-label={`${t.language.current}: ${getLanguageName(language)}`}
      >
        <Languages
          className={cn(config.icon, "text-slate-600 dark:text-slate-300")}
        />
        {showLabel && (
          <span className="text-slate-700 dark:text-slate-200">
            {getLanguageName(language)}
          </span>
        )}
      </button>
    );
  }

  // 🔄 Switch variant
  if (variant === "switch") {
    const isEnglish = language === "en";
    const isSpanish = language === "es";

    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          "relative inline-flex items-center justify-center",
          "w-16 h-8 rounded-full transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          isSpanish
            ? "bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 hover:shadow-lg focus:ring-red-400"
            : "bg-gradient-to-r from-blue-600 via-red-500 to-blue-600 hover:shadow-lg focus:ring-blue-400",
          className
        )}
        title={showTooltip ? t.language.tooltip : undefined}
        aria-label={`${t.language.current}: ${getLanguageName(language)}`}
        role="switch"
        aria-checked={isEnglish}
      >
        {/* Flag background indicators */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          {/* Spanish flag emoji */}
          <span
            className={cn(
              "text-lg transition-all duration-300",
              isSpanish ? "scale-100 opacity-100" : "scale-75 opacity-40"
            )}
          >
            🇪🇸
          </span>
          {/* English flag emoji */}
          <span
            className={cn(
              "text-lg transition-all duration-300",
              isEnglish ? "scale-100 opacity-100" : "scale-75 opacity-40"
            )}
          >
            🇺🇸
          </span>
        </div>

        {/* Sliding Thumb with flag */}
        <div
          className={cn(
            "absolute top-0.5 transition-all duration-300 ease-out",
            "w-7 h-7 rounded-full shadow-lg",
            "bg-white",
            "flex items-center justify-center",
            isEnglish ? "left-8" : "left-0.5"
          )}
        >
          <span className="text-xl">{isSpanish ? "🇪🇸" : "🇺🇸"}</span>
        </div>
      </button>
    );
  }

  // 🌐 Icon variant
  if (variant === "icon") {
    return (
      <button
        onClick={toggleLanguage}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-lg transition-all duration-300",
          "border border-slate-200 bg-white hover:bg-slate-50",
          "dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "dark:focus:ring-offset-slate-900",

          // Size
          config.button,

          // Custom className
          className
        )}
        title={
          showTooltip
            ? `${t.language.current}: ${getLanguageName(language)}`
            : undefined
        }
        aria-label={`${t.language.current}: ${getLanguageName(language)}`}
      >
        <div className="relative">
          <Globe
            className={cn(config.icon, "text-slate-600 dark:text-slate-300")}
          />
          {/* Language indicator */}
          <span className="absolute -top-1 -right-1 text-xs font-bold">
            {language === "es" ? "🇪🇸" : "🇺🇸"}
          </span>
        </div>
      </button>
    );
  }

  return null;
}

// 🎯 Export default
export default I18nToggle;
