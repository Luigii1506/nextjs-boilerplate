/**
 * 👁️ USER VIEW MODAL - DETALLES COMPLETOS
 * =======================================
 *
 * Modal para visualizar información detallada del usuario con React Portal
 * - Renderizado en document.body para aparecer sobre toda la app
 * - Z-index máximo para garantizar visibilidad
 * - Vista completa de información del usuario
 * - Diseño elegante y organizado
 * - Dark mode y responsive design
 *
 * Created: 2025-01-18 - Portal Modal for User Details
 */

"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
  User as UserIcon,
  X,
  Mail,
  Shield,
  Calendar,
  Clock,
  Ban,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { User } from "../../types";

interface UserViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onBan?: (user: User) => void;
}

/**
 * 🎯 UserViewModal Component with Portal
 */
const UserViewModal: React.FC<UserViewModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onDelete,
  onBan,
}) => {
  // 🚫 Don't render if closed, no user, or no document (SSR safety)
  if (!isOpen || !user || typeof document === "undefined") return null;

  const handleEdit = () => {
    onEdit?.(user);
    onClose();
  };

  const handleDelete = () => {
    onDelete?.(user);
    onClose();
  };

  const handleBan = () => {
    onBan?.(user);
    onClose();
  };

  // 🎯 Helper function to get role display
  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "user":
        return {
          label: "Usuario",
          color:
            "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        };
      case "admin":
        return {
          label: "Administrador",
          color:
            "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        };
      case "super_admin":
        return {
          label: "Super Admin",
          color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
        };
      default:
        return {
          label: role,
          color:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        };
    }
  };

  const roleDisplay = getRoleDisplay(user.role);

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
            "w-full max-w-2xl max-h-[90vh]",
            "transform transition-all duration-300 animate-slideInUp",
            "border border-gray-200 dark:border-gray-700",
            "flex flex-col overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 📋 Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                {/* Status indicator */}
                <div
                  className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center",
                    user.banned ? "bg-red-500" : "bg-green-500"
                  )}
                >
                  {user.banned ? (
                    <Ban className="w-3 h-3 text-white" />
                  ) : (
                    <CheckCircle className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* 📝 Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Rol y Permisos
                  </h4>
                </div>
                <div className="space-y-2">
                  <span
                    className={cn(
                      "inline-flex px-3 py-1 rounded-full text-sm font-medium",
                      roleDisplay.color
                    )}
                  >
                    {roleDisplay.label}
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Estado de la Cuenta
                  </h4>
                </div>
                <div className="space-y-2">
                  <span
                    className={cn(
                      "inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium",
                      user.banned
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    )}
                  >
                    {user.banned ? (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>Baneado</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Activo</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Información Personal */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Información Personal</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nombre Completo
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {user.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Correo Electrónico
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    ID de Usuario
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm mt-1">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Rol del Sistema
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {roleDisplay.label}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de Fechas */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Registro y Actividad</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Fecha de Registro
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(user.createdAt).toLocaleDateString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleTimeString("es-ES")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Última Actualización
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(user.updatedAt).toLocaleDateString("es-ES")}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.updatedAt).toLocaleTimeString("es-ES")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 Footer Actions */}
          {(onEdit || onDelete || onBan) && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Acciones disponibles:
                </span>
              </div>
              <div className="flex items-center space-x-3">
                {onEdit && (
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 text-blue-600 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
                {onBan && (
                  <button
                    onClick={handleBan}
                    className={cn(
                      "px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 border",
                      user.banned
                        ? "text-green-600 border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        : "text-yellow-600 border-yellow-200 dark:border-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                    )}
                  >
                    {user.banned ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Desbanear</span>
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4" />
                        <span>Banear</span>
                      </>
                    )}
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserViewModal;
