/**
 * 🎭 TAB TRANSITION COMPONENT - USERS MODULE
 * ==========================================
 *
 * Animaciones profesionales y fluidas entre tabs del SPA
 * React 19 + CSS Animations avanzadas para UX premium
 * Basado en el patrón de InventoryContext pero corregido
 *
 * Created: 2025-01-18 - Users SPA Transitions
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Tipos de transición disponibles
export type TransitionType = "slide" | "fade" | "scale" | "slideUp";

interface TabTransitionProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  transitionType?: TransitionType;
  delay?: number;
}

export const TabTransition: React.FC<TabTransitionProps> = ({
  children,
  isActive = true,
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
        return "animate-slideInUp";
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
        "backface-visibility-hidden",
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

// 🌊 Loading Skeleton for Users
export const UsersTabLoadingSkeleton: React.FC<{
  variant?: "overview" | "users" | "grid";
}> = ({ variant = "users" }) => {
  if (variant === "overview") {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"
            />
          ))}
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // Default users list skeleton
  return (
    <div className="p-6 space-y-4">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse"
        >
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
};
