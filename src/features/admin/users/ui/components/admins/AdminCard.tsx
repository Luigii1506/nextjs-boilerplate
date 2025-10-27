/**
 * 👑 ADMIN CARD COMPONENT
 * =======================
 *
 * Card component for displaying admin user information
 * Extracted from AdminsTab for maintainability
 *
 * FEATURES:
 * - Admin avatar with gradient
 * - Role badge and icon
 * - Registration and activity dates
 * - Status indicator (active/suspended)
 * - Action buttons (view, edit, remove admin)
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AdminsTab
 */

"use client";

import React from "react";
import { Eye, Edit, Trash2, Lock, Unlock } from "lucide-react";
import { cn } from "@/shared/utils";
import { RoleBadge, getRoleIcon } from "@/shared/ui/components/RoleBadge";
import type { User } from "../../../types";

/**
 * AdminCard Props Interface
 */
export interface AdminCardProps {
  admin: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onRemoveAdmin: (user: User) => void;
}

/**
 * AdminCard Component
 *
 * Displays an admin user card with actions
 *
 * @example
 * <AdminCard
 *   admin={admin}
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onRemoveAdmin={handleRemoveAdmin}
 * />
 */
export const AdminCard: React.FC<AdminCardProps> = React.memo(
  ({ admin, onView, onEdit, onRemoveAdmin }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>{admin.name}</span>
                {getRoleIcon(
                  admin.role as "super_admin" | "admin" | "moderator" | "user"
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {admin.email}
              </p>
              <div className="mt-2">
                <RoleBadge
                  role={
                    admin.role as "super_admin" | "admin" | "moderator" | "user"
                  }
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(admin)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(admin)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Editar permisos"
            >
              <Edit className="w-4 h-4" />
            </button>
            {admin.role !== "super_admin" && (
              <button
                onClick={() => onRemoveAdmin(admin)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Remover privilegios admin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">
              Registrado:
            </span>
            <span className="text-gray-900 dark:text-white">
              {new Date(admin.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">
              Última actividad:
            </span>
            <span className="text-gray-900 dark:text-white">
              {new Date(admin.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
            <span
              className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                admin.banned
                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              )}
            >
              {admin.banned ? (
                <div className="flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Suspendido</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <Unlock className="w-3 h-3" />
                  <span>Activo</span>
                </div>
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }
);

AdminCard.displayName = "AdminCard";
