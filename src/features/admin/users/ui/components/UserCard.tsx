"use client";

import React, { useState } from "react";
import { User } from "../../types";
import Image from "next/image";
import {
  MoreVertical,
  User as UserIcon,
  Crown,
  Ban,
  Trash2,
  Edit,
  Calendar,
  Clock,
  Mail,
  UserCheck,
} from "lucide-react";

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onToggleBan: (userId: string) => void; // Backward compatibility
  onChangeRole: (userId: string, role: User["role"]) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onBan,
  onUnban,
  onToggleBan: _, // Backward compatibility (unused)
  onChangeRole,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getRoleIcon = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <UserIcon className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "admin":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getStatusColor = (banned: boolean) => {
    return banned
      ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
      : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 p-5 hover:shadow-md dark:hover:shadow-xl transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Usuario"}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(user.name)}
            </div>
          )}

          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight">
              {user.name}
            </h3>
            <div className="flex items-center gap-1 text-slate-500 dark:text-gray-400 text-sm mt-1">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </div>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-slate-400 dark:text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-2xl border border-slate-200 dark:border-gray-700 py-1">
                <button
                  onClick={() => {
                    onEdit(user);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>

                <button
                  onClick={() => {
                    onChangeRole(
                      user.id,
                      user.role === "admin" ? "user" : "admin"
                    );
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                >
                  {user.role === "admin" ? (
                    <UserIcon className="w-4 h-4" />
                  ) : (
                    <Crown className="w-4 h-4" />
                  )}
                  {user.role === "admin" ? "Hacer Usuario" : "Hacer Admin"}
                </button>

                <hr className="my-1 border-slate-100 dark:border-gray-700" />

                <button
                  onClick={() => {
                    if (user.banned) {
                      onUnban(user.id);
                    } else {
                      onBan(user.id);
                    }
                    setShowMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-gray-700/50 ${
                    user.banned
                      ? "text-green-600 dark:text-green-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {user.banned ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <Ban className="w-4 h-4" />
                  )}
                  {user.banned ? "✅ Desbanear" : "🚫 Banear (con razón)"}
                </button>

                <button
                  onClick={() => {
                    onDelete(user.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status and Role Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleColor(
            user.role
          )}`}
        >
          {getRoleIcon(user.role)}
          {user.role === "admin" ? "Administrador" : "Usuario"}
        </span>

        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
            user.banned
          )}`}
        >
          {user.banned ? "Baneado" : "Activo"}
        </span>

        {user.emailVerified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
            <UserCheck className="w-3 h-3" />
            Verificado
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-3 border-t border-slate-100 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          Registro: {formatDate(user.createdAt)}
        </div>

        {user.lastLogin && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Último: {new Date(user.lastLogin).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Ban Reason */}
      {user.banned && user.banReason && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-xs text-red-700 dark:text-red-300 font-medium">
            Motivo del baneo:
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {user.banReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserCard;
