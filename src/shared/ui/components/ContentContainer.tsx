/**
 * 📦 CONTENT CONTAINER - REUSABLE COMPONENT
 * ==========================================
 *
 * Container reutilizable para el área de contenido que estandariza
 * padding, spacing y max-width en todas las secciones.
 *
 * Este componente elimina la duplicación del wrapper de contenido
 * que se repite en todas las secciones:
 * - /users
 * - /inventory
 * - /suppliers
 * - /files
 * - /seller-portal
 * - /audit
 *
 * Features:
 * - Responsive padding (mobile-first)
 * - Consistent max-width (1600px)
 * - Two variants: responsive and fixed
 * - Optional additional spacing
 * - Dark mode compatible
 *
 * Usage:
 * ```tsx
 * <ContentContainer>
 *   <TabContent />
 * </ContentContainer>
 * ```
 *
 * With responsive variant:
 * ```tsx
 * <ContentContainer responsive={true}>
 *   <YourContent />
 * </ContentContainer>
 * ```
 *
 * With custom spacing:
 * ```tsx
 * <ContentContainer spacing="lg">
 *   <YourContent />
 * </ContentContainer>
 * ```
 *
 * Created: 2025-01-18
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";

// 🎨 Types
export interface ContentContainerProps {
  /** Content to render */
  children: React.ReactNode;
  /** Use responsive padding (mobile-friendly) */
  responsive?: boolean;
  /** Spacing variant */
  spacing?: "sm" | "md" | "lg";
  /** Additional CSS classes for the outer container */
  className?: string;
  /** Additional CSS classes for the inner container */
  innerClassName?: string;
  /** Custom max width (default: 1600px) */
  maxWidth?: string;
}

// 🎨 Spacing variants
const SPACING_VARIANTS = {
  sm: {
    responsive: "px-3 py-3 sm:px-4 sm:py-4",
    fixed: "px-4 py-4",
  },
  md: {
    responsive: "px-4 py-4 sm:px-6 sm:py-6",
    fixed: "px-6 py-6",
  },
  lg: {
    responsive: "px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-8",
    fixed: "px-8 py-8",
  },
} as const;

/**
 * 📦 ContentContainer Component
 *
 * Proporciona un contenedor consistente para el área de contenido
 * con responsive padding y max-width estandarizado.
 */
export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  responsive = true,
  spacing = "md",
  className,
  innerClassName,
  maxWidth = "1600px",
}) => {
  const spacingClasses = SPACING_VARIANTS[spacing];

  if (responsive) {
    // Responsive variant: w-full with responsive padding
    return (
      <div className={cn("w-full", spacingClasses.responsive, className)}>
        <div
          className={cn("max-w-full mx-auto", innerClassName)}
          style={{ maxWidth: `min(100%, ${maxWidth})` }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Fixed variant: max-width with consistent padding
  return (
    <div
      className={cn("mx-auto", spacingClasses.fixed, className)}
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
};

export default ContentContainer;
