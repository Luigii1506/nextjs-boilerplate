/**
 * 🚫 BAN/UNBAN USER CONFIRMATION MODAL
 * ====================================
 *
 * Modal de confirmación para banear/desbanear usuarios con React Portal
 * - Renderizado en document.body para aparecer sobre toda la app
 * - Z-index máximo para garantizar visibilidad
 * - Modo dual: ban y unban con UI contextual
 * - Animaciones fluidas y UX consistente
 * - Dark mode y responsive design
 *
 * Created: 2025-01-18 - Portal Modal for Ban/Unban Confirmation
 */

"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  UserCheck,
  X,
  Loader2,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { User } from "../../types";

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

/**
 * 🎯 BanUserModal Component with Portal
 */
const BanUserModal: React.FC<BanUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  isLoading = false,
}) => {
  // 🚫 Don't render if closed, no user, or no document (SSR safety)
  if (!isOpen || !user || typeof document === "undefined") return null;

  const isBanned = user.banned;
  const action = isBanned ? "desbanear" : "banear";
  const actionTitle = isBanned ? "Desbanear Usuario" : "Banear Usuario";

  const handleConfirm = async () => {
    await onConfirm();
  };

  // 🌐 Use Portal to render modal directly in document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-md",
            "transform transition-all duration-300 animate-slideInUp",
            "border border-gray-200 dark:border-gray-700"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 📋 Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  isBanned
                    ? "bg-green-100 dark:bg-green-900/20"
                    : "bg-yellow-100 dark:bg-yellow-900/20"
                )}
              >
                {isBanned ? (
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Ban className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {actionTitle}
              </h3>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📝 Content */}
          <div className="p-6">
            <div className="flex items-start space-x-3 mb-6">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex-shrink-0 mt-1">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  ¿Estás seguro de que quieres {action} a{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isBanned
                    ? "El usuario podrá volver a acceder al sistema y recuperar todas sus funcionalidades."
                    : "Se te pedirá proporcionar una razón para el baneo. El usuario perderá acceso al sistema."}
                </p>
              </div>
            </div>

            {/* User Info Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Información del usuario:
              </h4>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <span className="font-medium">Email:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">Rol:</span> {user.role}
                </p>
                <p>
                  <span className="font-medium">Estado actual:</span>{" "}
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      isBanned
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    {isBanned ? "Baneado" : "Activo"}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Registro:</span>{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action-specific notice */}
            {!isBanned && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">Razón del baneo</span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Después de confirmar, se te solicitará proporcionar una razón
                  específica para el baneo del usuario.
                </p>
              </div>
            )}
          </div>

          {/* 🎯 Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors text-white flex items-center space-x-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isBanned
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-yellow-600 hover:bg-yellow-700"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isBanned ? "Desbaneando..." : "Baneando..."}</span>
                </>
              ) : (
                <>
                  {isBanned ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  <span>
                    {isBanned ? "Desbanear Usuario" : "Banear Usuario"}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default BanUserModal;
