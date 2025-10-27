/**
 * 👤 USER CARD COMPONENT
 * ======================
 *
 * Displays user information in grid or list view
 * Extracted from AllUsersTab for maintainability
 *
 * FEATURES:
 * - Grid and list view modes
 * - Action buttons (view, edit, ban, delete)
 * - Dropdown menu for grid view
 * - Role and status badges
 * - Dark mode support
 *
 * Created: 2025-01-27 - Extracted from AllUsersTab
 */

"use client";

import React, { useState } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  UserCheck,
  Ban,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type { User } from "../../../types";
import {
  getRoleColor,
  getStatusColor,
  getUserInitials,
  getStatusDisplayName,
} from "../../../utils/user.helpers";

/**
 * UserCard Props Interface
 */
export interface UserCardProps {
  user: User;
  viewMode: "grid" | "list";
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onToggleBan: (user: User) => void;
}

/**
 * UserCard Component
 *
 * Displays a user card with actions in grid or list view mode
 *
 * @example
 * <UserCard
 *   user={user}
 *   viewMode="grid"
 *   onView={handleView}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onToggleBan={handleToggleBan}
 * />
 */
export const UserCard: React.FC<UserCardProps> = React.memo(
  ({ user, viewMode, onView, onEdit, onDelete, onToggleBan }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // List view
    if (viewMode === "list") {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {getUserInitials(user.name)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getRoleColor(user.role)
                    )}
                  >
                    {user.role}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusColor(user.banned)
                    )}
                  >
                    {getStatusDisplayName(user.banned)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(user)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onEdit(user)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onToggleBan(user)}
                className={cn(
                  "p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors",
                  user.banned
                    ? "text-green-600 dark:text-green-400 hover:text-green-700"
                    : "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700"
                )}
                title={user.banned ? "Desbanear" : "Banear"}
              >
                {user.banned ? (
                  <UserCheck className="w-5 h-5" />
                ) : (
                  <Ban className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => onDelete(user)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow group">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            {getUserInitials(user.name)}
          </div>
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <button
                  onClick={() => {
                    onView(user);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver detalles</span>
                </button>
                <button
                  onClick={() => {
                    onEdit(user);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    onToggleBan(user);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                >
                  {user.banned ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  <span>{user.banned ? "Desbanear" : "Banear"}</span>
                </button>
                <button
                  onClick={() => {
                    onDelete(user);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {user.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getRoleColor(user.role)
              )}
            >
              {user.role}
            </span>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getStatusColor(user.banned)
              )}
            >
              {getStatusDisplayName(user.banned)}
            </span>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Creado: {new Date(user.createdAt).toLocaleDateString()}</p>
            <p>
              Actualizado: {new Date(user.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    );
  }
);

UserCard.displayName = "UserCard";
