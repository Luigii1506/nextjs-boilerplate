/**
 * 🎭 BASE MODAL COMPONENT
 * =====================
 *
 * Modal base reutilizable con animaciones hermosas, dark mode y UX excepcional
 * Basado en el diseño exitoso de ProductModal.tsx
 *
 * Features:
 * - ✨ Animaciones fluidas (fadeIn, slideInUp)
 * - 🌙 Dark mode completo
 * - 📱 Responsive design
 * - ⌨️ Keyboard navigation
 * - 🎯 Loading states
 * - 💾 Dirty state protection
 * - 🎨 Customizable icons & actions
 *
 * Created: 2025-01-17 - Standardized Modal System
 */

"use client";

import React, { useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/shared/utils";

export interface BaseModalProps {
  /** Control de apertura del modal */
  isOpen: boolean;

  /** Callback para cerrar el modal */
  onClose: () => void;

  /** Título principal del modal */
  title: string;

  /** Descripción opcional bajo el título */
  description?: string;

  /** Ícono opcional para el header */
  icon?: ReactNode;

  /** Contenido principal del modal */
  children: ReactNode;

  /** Acciones del footer (botones) */
  actions?: ReactNode;

  /** Estado de loading */
  isLoading?: boolean;

  /** Si hay cambios pendientes (muestra confirmación al cerrar) */
  isDirty?: boolean;

  /** Mensaje personalizado de confirmación al cerrar */
  confirmOnClose?: string;

  /** Tamaño máximo del modal */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

  /** Callback cuando se confirma el cierre (después de la confirmación) */
  onConfirmClose?: () => void;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  actions,
  isLoading = false,
  isDirty = false,
  confirmOnClose = "¿Estás seguro de que quieres cerrar? Se perderán los cambios.",
  maxWidth = "4xl",
  onConfirmClose,
}) => {
  // 🔒 Handle close with confirmation if dirty
  const handleClose = () => {
    if (isDirty && !window.confirm(confirmOnClose)) {
      return;
    }

    onClose();
    onConfirmClose?.();
  };

  // ⌨️ Keyboard support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDirty, confirmOnClose]);

  // 🚫 Don't render if closed
  if (!isOpen) return null;

  // 🎯 Render to body using portal
  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* 🌫️ Backdrop with fade animation */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-fadeIn"
        onClick={handleClose}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-h-[95vh] sm:max-h-[90vh]",
            maxWidthClasses[maxWidth],
            "transform transition-all duration-300 animate-slideInUp",
            "flex flex-col" // 🎯 Flexbox container for fixed header/footer
          )}
        >
          {/* 📋 Header - FIXED */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl">
            <div className="flex items-center gap-3">
              {/* Icon */}
              {icon && (
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  {icon}
                </div>
              )}

              {/* Title & Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {title}
                </h2>
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
                "hover:bg-gray-100 dark:hover:bg-gray-700",
                "transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📝 Content - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
            <div className="p-6">{children}</div>
          </div>

          {/* 🎯 Footer - FIXED (only if actions provided) */}
          {actions && (
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 rounded-b-2xl">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render modal to document body
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

// 🎨 Pre-built action components for consistency

export interface BaseModalActionsProps {
  children: ReactNode;
  /** Alignment of actions */
  align?: "left" | "center" | "right" | "between";
}

export const BaseModalActions: React.FC<BaseModalActionsProps> = ({
  children,
  align = "right",
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div className={cn("flex items-center gap-3", alignClasses[align])}>
      {children}
    </div>
  );
};

export interface BaseModalButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
}

export const BaseModalButton: React.FC<BaseModalButtonProps> = ({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  loading = false,
  type = "button",
}) => {
  const variantClasses = {
    primary: cn(
      "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700",
      "text-white focus:ring-blue-500/20"
    ),
    secondary: cn(
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
      "text-gray-700 dark:text-gray-300 focus:ring-gray-500/20"
    ),
    danger: cn(
      "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
      "text-white focus:ring-red-500/20"
    ),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-6 py-3 rounded-lg font-medium transition-colors duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-4",
        "flex items-center gap-2",
        variantClasses[variant]
      )}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default BaseModal;

