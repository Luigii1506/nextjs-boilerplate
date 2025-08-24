/**
 * 🎭 TAB TRANSITION COMPONENT
 * ==========================
 *
 * Animaciones profesionales y fluidas entre tabs del SPA
 * React 19 + CSS Animations avanzadas para UX premium
 *
 * Created: 2025-01-17 - Inventory SPA Transitions
 * Updated: 2025-01-17 - Enhanced smooth transitions
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Tipos de transición disponibles
export type TransitionType = "slide" | "fade" | "scale" | "slideUp";

interface TabTransitionProps {
  children: React.ReactNode;
  isActive: boolean;
  className?: string;
  transitionType?: TransitionType;
  delay?: number;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  isActive,
  className,
  transitionType = "slideUp",
  delay = 0,
}) => {
  // 🚀 Simplified for True SPA - Always render active content instantly
  // Transitions are purely visual, no delays or complex state management

  if (!isActive) {
    return null; // Don't render inactive tabs
  }

  // 🎨 Simple CSS-only transitions
  const getTransitionClass = () => {
    switch (transitionType) {
      case "fade":
        return "animate-fadeInScale";
      case "slide":
        return "animate-slideInLeft";
      case "scale":
        return "animate-scaleIn";
      case "slideUp":
      default:
        return "animate-fadeInUp";
    }
  };

  return (
    <div
      className={cn(
        // Base classes for smooth rendering
        "transform-gpu opacity-100 translate-y-0",
        // Animation class
        getTransitionClass(),
        // Performance optimizations
        "backface-hidden",
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
        willChange: "transform, opacity", // Optimize for animations
      }}
    >
      {children}
    </div>
  );
};

// 🌊 Enhanced Loading Skeleton with Staggered Animations
export const TabLoadingSkeleton: React.FC<{
  variant?: "overview" | "products" | "grid";
}> = ({ variant = "grid" }) => (
  <div className="space-y-6 p-6">
    {/* Header Skeleton */}
    <div
      className="flex justify-between items-center animate-fadeInUp"
      style={{ animationDelay: "0ms" }}
    >
      <div className="space-y-3">
        <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-64 shimmer" />
        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded w-40 shimmer" />
      </div>
      <div className="h-11 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg w-36 shimmer" />
    </div>

    {/* Dynamic Content Based on Variant */}
    {variant === "overview" && (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInUp"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInLeft"
            style={{ animationDelay: "500ms" }}
          />
          <div
            className="lg:col-span-2 h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInRight"
            style={{ animationDelay: "600ms" }}
          />
        </div>
      </>
    )}

    {variant === "products" && (
      <>
        {/* Filters Bar */}
        <div
          className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-slideInDown"
          style={{ animationDelay: "200ms" }}
        />

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-scaleIn"
              style={{ animationDelay: `${300 + i * 75}ms` }}
            />
          ))}
        </div>
      </>
    )}

    {variant === "grid" && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl shimmer animate-fadeInScale"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    )}
  </div>
);

// 🎨 Enhanced Tab Badge with Smooth Animations
interface TabBadgeProps {
  isActive: boolean;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  hasNotification?: boolean;
  notificationCount?: number;
}

export const TabBadge: React.FC<TabBadgeProps> = ({
  isActive,
  label,
  icon,
  color,
  onClick,
  hasNotification = false,
  notificationCount = 0,
}) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-blue-500/10",
    green:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 shadow-green-500/10",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 shadow-purple-500/10",
    orange:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 shadow-orange-500/10",
    indigo:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-indigo-500/10",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800 shadow-pink-500/10",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center space-x-2 px-4 py-3 rounded-lg font-medium group",
        "transition-all duration-300 ease-out transform-gpu",
        "border-2 backdrop-blur-sm",
        // Hover effects
        "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        // Active state with enhanced styling
        isActive
          ? `${
              colorClasses[color as keyof typeof colorClasses] ||
              colorClasses.blue
            } shadow-lg scale-[1.01]`
          : "border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md",
        // Focus states for accessibility
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      )}
    >
      {/* Icon with rotation on active */}
      <span
        className={cn(
          "flex-shrink-0 transition-transform duration-300",
          isActive && "scale-110"
        )}
      >
        {icon}
      </span>

      {/* Label with slight animation */}
      <span className="whitespace-nowrap font-medium transition-all duration-200">
        {label}
      </span>

      {/* Notification Badge with bounce animation */}
      {hasNotification && (
        <div
          className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full",
            "bg-red-500 text-white text-[10px] font-bold",
            "flex items-center justify-center",
            "animate-bounce shadow-lg ring-2 ring-white dark:ring-gray-800",
            "transition-all duration-200 group-hover:scale-110"
          )}
        >
          {notificationCount > 99 ? "99+" : notificationCount || ""}
        </div>
      )}

      {/* Enhanced Active Indicator */}
      {isActive && (
        <>
          {/* Bottom border indicator */}
          <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-current rounded-full transition-all duration-300" />

          {/* Subtle glow effect */}
          <div className="absolute inset-0 rounded-lg bg-current opacity-5 transition-opacity duration-300" />
        </>
      )}

      {/* Ripple effect on click */}
      <div className="absolute inset-0 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-current opacity-0 group-active:opacity-10 transition-opacity duration-150 rounded-lg" />
      </div>
    </button>
  );
};
