/**
 * 📦 TAB WRAPPER COMPONENT
 * ========================
 *
 * Wrapper estándar para todos los tabs con transición y padding consistente
 * Combina TabTransition + contenedor con padding responsive
 *
 * Created: 2025-01-27 - Tab Wrapper Component
 */

"use client";

import React from "react";
import { TabTransition } from "../../shared/TabTransition";
import { cn } from "@/shared/utils";

export interface TabWrapperProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Si es true, usa padding responsive (p-0 md:p-6)
   * Si es false, usa padding fijo (p-6)
   * @default true
   */
  responsive?: boolean;
  /**
   * Espaciado vertical entre elementos
   * @default "space-y-8"
   */
  spacing?: "space-y-4" | "space-y-6" | "space-y-8";
  /**
   * Deshabilitar la transición de entrada
   * @default false
   */
  noTransition?: boolean;
}

/**
 * TabWrapper - Wrapper estándar para contenido de tabs
 *
 * @example
 * ```tsx
 * <TabWrapper>
 *   <TabHeader title="Mi Tab" />
 *   <div>Contenido del tab...</div>
 * </TabWrapper>
 * ```
 *
 * @example Con opciones personalizadas
 * ```tsx
 * <TabWrapper responsive={false} spacing="space-y-6">
 *   <TabHeader title="Mi Tab" />
 *   <div>Contenido del tab...</div>
 * </TabWrapper>
 * ```
 */
export const TabWrapper: React.FC<TabWrapperProps> = ({
  children,
  className,
  responsive = true,
  spacing = "space-y-8",
  noTransition = false,
}) => {
  const content = (
    <div className={cn(responsive ? "p-0 md:p-6" : "p-6", spacing, className)}>
      {children}
    </div>
  );

  if (noTransition) {
    return content;
  }

  return <TabTransition>{content}</TabTransition>;
};

export default TabWrapper;
