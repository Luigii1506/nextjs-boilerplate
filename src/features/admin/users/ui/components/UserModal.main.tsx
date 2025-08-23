/**
 * 🎭 USER MODAL OPTIMIZED - TANSTACK QUERY
 * ========================================
 *
 * Modal súper optimizado usando TanStack Query mutations.
 * Performance enterprise, zero estados duplicados.
 *
 * Enterprise: 2025-01-17 - TanStack Query Modal optimization
 */

"use client";

import React, { useEffect } from "react";
import { User, CreateUserForm } from "../../types";
import { useUserModal } from "../../hooks/useUserModal";
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Save,
  AlertCircle,
} from "lucide-react";

interface UserModalOptimizedProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  mode: "create" | "edit";
  title?: string;
}

const UserModalOptimized: React.FC<UserModalOptimizedProps> = ({
  isOpen,
  onClose,
  user,
  mode,
  title,
}) => {
  const {
    formData,
    errors,
    isLoading,
    isCreating,
    isUpdating,
    createUser,
    updateUser,
    resetForm,
    loadUser,
    updateField,
  } = useUserModal();

  // 🎛️ Load user data when modal opens for editing
  useEffect(() => {
    if (isOpen && mode === "edit" && user) {
      loadUser(user);
    } else if (isOpen && mode === "create") {
      resetForm();
    }
  }, [isOpen, mode, user, loadUser, resetForm]);

  // 🚀 Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let result;
    if (mode === "create") {
      result = await createUser(formData);
    } else if (mode === "edit" && user) {
      const updates: Partial<CreateUserForm> = {};
      if (formData.name !== user.name) updates.name = formData.name;
      if (formData.email !== user.email) updates.email = formData.email;
      if (formData.role !== user.role) updates.role = formData.role;

      result = await updateUser(user, updates);
    }

    // Close modal on success
    if (result?.success) {
      onClose();
    }
  };

  // 🎨 Get modal title
  const modalTitle =
    title || (mode === "create" ? "Crear Usuario" : "Editar Usuario");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 🎯 Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {modalTitle}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {mode === "create"
                  ? "Completa la información del nuevo usuario"
                  : "Modifica los datos del usuario"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📝 Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[calc(90vh-120px)] overflow-y-auto"
        >
          {/* 👤 Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <UserIcon className="w-4 h-4 inline mr-1" />
              Nombre completo
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.name
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              } text-slate-900 dark:text-slate-100 placeholder-slate-500`}
              placeholder="Ej: Juan Pérez López"
              required
              disabled={isLoading}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </div>
            )}
          </div>

          {/* 📧 Email Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.email
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              } text-slate-900 dark:text-slate-100 placeholder-slate-500`}
              placeholder="usuario@empresa.com"
              required
              disabled={isLoading}
            />
            {errors.email && (
              <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </div>
            )}
          </div>

          {/* 🔒 Password Field (only for create mode) */}
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Lock className="w-4 h-4 inline mr-1" />
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.password
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                } text-slate-900 dark:text-slate-100 placeholder-slate-500`}
                placeholder="Mínimo 8 caracteres"
                required
                disabled={isLoading}
              />
              {errors.password && (
                <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Debe contener al menos una mayúscula, una minúscula y un número
              </p>
            </div>
          )}

          {/* 👑 Role Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Shield className="w-4 h-4 inline mr-1" />
              Rol del usuario
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                updateField("role", e.target.value as CreateUserForm["role"])
              }
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.role
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
              } text-slate-900 dark:text-slate-100`}
              disabled={isLoading}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="super_admin">Super Administrador</option>
            </select>
            {errors.role && (
              <div className="flex items-center gap-1 mt-1 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-3 h-3" />
                {errors.role}
              </div>
            )}
          </div>

          {/* 🎛️ Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === "create"
                    ? isCreating
                      ? "Creando..."
                      : "Procesando..."
                    : isUpdating
                    ? "Actualizando..."
                    : "Procesando..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModalOptimized;
