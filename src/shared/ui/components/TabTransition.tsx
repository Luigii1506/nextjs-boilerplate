/**
 * 🎭 TAB TRANSITION COMPONENT - SHARED
 * ====================================
 *
 * Animaciones profesionales y fluidas entre tabs del SPA
 * React 19 + CSS Animations avanzadas para UX premium
 * Componente compartido usado por todos los módulos
 *
 * Created: 2025-01-27 - Shared Tab Transitions
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
