/**
 * 🎨 REUSABLE TABS COMPONENT
 * =========================
 *
 * Componente de tabs completamente reutilizable con animaciones suaves
 * y sin problemas de z-index o superposiciones
 *
 * Created: 2025-01-17 - Enhanced Reusable Tabs
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Tab Item Interface
export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  hasNotification?: boolean;
  notificationCount?: number;
  disabled?: boolean;
}

// 🎨 Reusable Tabs Props
interface ReusableTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: "default" | "pills" | "underline" | "rounded";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  scrollable?: boolean;
}

export const ReusableTabs: React.FC<ReusableTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = "default",
  size = "md",
  animated = true,
  scrollable = true,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const getTabClasses = (tab: TabItem, isActive: boolean) => {
    const baseClasses = cn(
      "relative flex items-center justify-center space-x-2 font-medium",
      "transition-all duration-200 ease-out transform-gpu",
      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
      sizeClasses[size],
      tab.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
    );

    switch (variant) {
      case "pills":
        return cn(
          baseClasses,
          "rounded-full border-2",
          isActive
            ? cn(
                colorClasses[tab.color as keyof typeof colorClasses] ||
                  colorClasses.blue,
                "shadow-sm"
              )
            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
        );

      case "underline":
        return cn(
          baseClasses,
          "border-b-2 rounded-none",
          isActive
            ? "border-blue-500 text-blue-600 dark:text-blue-400"
            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300"
        );

      case "rounded":
        return cn(
          baseClasses,
          "rounded-lg border-2",
          isActive
            ? cn(
                colorClasses[tab.color as keyof typeof colorClasses] ||
                  colorClasses.blue,
                "shadow-sm"
              )
            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
        );

      default:
        return cn(
          baseClasses,
          "rounded-lg border-2",
          isActive
            ? cn(
                colorClasses[tab.color as keyof typeof colorClasses] ||
                  colorClasses.blue,
                "shadow-sm scale-[1.02]"
              )
            : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.01]"
        );
    }
  };

  return (
    <div
      className={cn(
        "flex space-x-1 bg-white dark:bg-gray-800 p-1 rounded-lg",
        "tabs-container", // Custom CSS class for z-index isolation
        scrollable && "overflow-x-auto scrollbar-hide scrollbar-thin",
        animated && "transform-gpu",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            className={cn(
              getTabClasses(tab, isActive),
              "whitespace-nowrap min-w-0 flex-shrink-0",
              "tab-item", // Custom CSS class for z-index isolation
              isActive && "active-tab-glow",
              animated && "animate-tabSlideIn",
              !tab.disabled && "hover:scale-[1.02] active:scale-[0.98]"
            )}
            style={animated ? { animationDelay: `${index * 50}ms` } : undefined}
            disabled={tab.disabled}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            {/* Icon */}
            {tab.icon && (
              <span
                className={cn(
                  "flex-shrink-0 transition-transform duration-200",
                  isActive && animated && "scale-110"
                )}
              >
                {tab.icon}
              </span>
            )}

            {/* Label */}
            <span className="font-medium transition-all duration-200">
              {tab.label}
            </span>

            {/* Notification Badge - FIXED: No absolute positioning + Custom animation */}
            {tab.hasNotification &&
              tab.notificationCount &&
              tab.notificationCount > 0 && (
                <span
                  className={cn(
                    "ml-2 min-w-[18px] h-[18px] rounded-full",
                    "bg-red-500 text-white text-[10px] font-bold",
                    "flex items-center justify-center",
                    "ring-2 ring-white dark:ring-gray-800",
                    "notification-badge", // Custom pulse animation
                    "shadow-lg",
                    animated && "transition-all duration-200"
                  )}
                >
                  {tab.notificationCount > 99 ? "99+" : tab.notificationCount}
                </span>
              )}

            {/* Active Indicator for underline variant */}
            {variant === "underline" && isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

// 🎨 Tab Panel Component for content
interface TabPanelProps {
  children: React.ReactNode;
  tabId: string;
  activeTab: string;
  className?: string;
  animated?: boolean;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  tabId,
  activeTab,
  className,
  animated = true,
}) => {
  if (activeTab !== tabId) {
    return null;
  }

  return (
    <div
      className={cn(
        "tab-panel transform-gpu",
        animated && "animate-fadeInUp opacity-100 translate-y-0",
        className
      )}
      id={`tabpanel-${tabId}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabId}`}
    >
      {children}
    </div>
  );
};

// 🎨 Complete Tabs System
interface TabSystemProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
  className?: string;
  tabsClassName?: string;
  contentClassName?: string;
  variant?: "default" | "pills" | "underline" | "rounded";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  scrollable?: boolean;
}

export const TabSystem: React.FC<TabSystemProps> = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
  tabsClassName,
  contentClassName,
  variant = "default",
  size = "md",
  animated = true,
  scrollable = true,
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Tabs Header */}
      <ReusableTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        className={tabsClassName}
        variant={variant}
        size={size}
        animated={animated}
        scrollable={scrollable}
      />

      {/* Tabs Content */}
      <div className={cn("mt-6", contentClassName)}>{children}</div>
    </div>
  );
};
