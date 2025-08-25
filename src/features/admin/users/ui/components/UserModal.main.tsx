/**
 * 🎭 USER MODAL - MODERN STANDARD WITH PORTAL
 * ============================================
 *
 * Modal moderno con Portal para renderizar en document.body
 * - React Portal para aparecer sobre toda la aplicación
 * - z-index alto (9999) para máxima visibilidad
 * - react-hook-form + zodResolver
 * - Zod validation schemas
 * - TanStack Query integration
 * - Consistent with inventory modals
 *
 * Created: 2025-01-18 - Modern Modal Standard with Portal
 */

"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User as UserIcon,
  Mail,
  Lock,
  Shield,
  Save,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useUsersContext } from "../../context";
import { z } from "zod";
import type { User, CreateUserForm } from "../../types";

// 🎯 Form schema - dynamic based on mode
const createUserFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().min(1, "Email es requerido").email("Email debe ser válido"),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["user", "admin", "super_admin"]),
});

const editUserFormSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .min(2, "Nombre debe tener al menos 2 caracteres"),
  email: z.string().min(1, "Email es requerido").email("Email debe ser válido"),
  password: z.string().optional(), // Password is optional in edit mode
  role: z.enum(["user", "admin", "super_admin"]),
});

// 🎯 Form data type
type UserFormData =
  | z.infer<typeof createUserFormSchema>
  | z.infer<typeof editUserFormSchema>;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  mode: "create" | "edit";
  title?: string;
}

/**
 * 🎯 UserModal Component with Portal
 */
const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  mode,
  title,
}) => {
  const { users } = useUsersContext();
  const { createUser, updateUser } = users;

  const isEditMode = mode === "edit";

  // 📋 Single form for both create and edit
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(
      isEditMode ? editUserFormSchema : createUserFormSchema
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  // 🔄 Load user data when editing
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && user) {
        // Load existing user data for editing (password not included)
        reset({
          name: user.name,
          email: user.email,
          password: "", // Password is not edited in edit mode
          role: user.role,
        });
      } else {
        // Reset form for creation
        reset({
          name: "",
          email: "",
          password: "",
          role: "user",
        });
      }
    }
  }, [isOpen, isEditMode, user, reset]);

  // 🚀 Form submission handler
  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditMode && user) {
        // Update existing user (exclude password from update)
        const updateData = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        await updateUser(user.id, updateData);
      } else {
        // Create new user with all data including password
        await createUser(data as CreateUserForm);
      }

      onClose();
    } catch (error) {
      console.error("User operation failed:", error);
      // Error is handled by TanStack Query and notifications
    }
  };

  // 🎯 Modal configuration
  const modalTitle = title || (isEditMode ? "Editar Usuario" : "Crear Usuario");
  const modalDescription = isEditMode
    ? "Modifica los datos del usuario seleccionado"
    : "Completa la información para crear un nuevo usuario";

  // 🚫 Don't render if closed or no document (SSR safety)
  if (!isOpen || typeof document === "undefined") return null;

  // 🌐 Use Portal to render modal directly in document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-md max-h-[90vh]",
            "border border-gray-200 dark:border-gray-700",
            "flex flex-col overflow-hidden"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 📋 Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {modalTitle}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {modalDescription}
              </p>
            </div>
          </div>

            {/* Close Button */}
          <button
              type="button"
            onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 📝 Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form 
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              id="user-form"
            >
          {/* 👤 Name Field */}
          <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <UserIcon className="w-4 h-4 mr-2" />
              Nombre completo
            </label>
            <input
              type="text"
                  {...register("name")}
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-all",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                errors.name
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  )}
              placeholder="Ej: Juan Pérez López"
                  disabled={isSubmitting}
            />
            {errors.name && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.name.message}
              </div>
            )}
          </div>

          {/* 📧 Email Field */}
          <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
              Correo electrónico
            </label>
            <input
              type="email"
                  {...register("email")}
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-all",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                    "placeholder-gray-500 dark:placeholder-gray-400",
                errors.email
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  )}
              placeholder="usuario@empresa.com"
                  disabled={isSubmitting}
            />
            {errors.email && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.email.message}
              </div>
            )}
          </div>

          {/* 🔒 Password Field (only for create mode) */}
              {!isEditMode && (
            <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Lock className="w-4 h-4 mr-2" />
                Contraseña
              </label>
              <input
                type="password"
                    {...register("password")}
                    className={cn(
                      "w-full px-4 py-3 border rounded-lg transition-all",
                      "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                      "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                      "placeholder-gray-500 dark:placeholder-gray-400",
                  errors.password
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                placeholder="Mínimo 8 caracteres"
                    disabled={isSubmitting}
              />
              {errors.password && (
                    <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {errors.password.message}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Debe contener al menos 8 caracteres, una mayúscula, una
                    minúscula y un número
                  </p>
                </div>
              )}

              {/* 🔒 Password Notice for Edit Mode */}
              {isEditMode && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Contraseña</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    La contraseña no se puede modificar desde aquí. El usuario
                    debe cambiarla desde su perfil.
              </p>
            </div>
          )}

          {/* 👑 Role Field */}
          <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Shield className="w-4 h-4 mr-2" />
              Rol del usuario
            </label>
            <select
                  {...register("role")}
                  className={cn(
                    "w-full px-4 py-3 border rounded-lg transition-all",
                    "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
                errors.role
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                  disabled={isSubmitting}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
              <option value="super_admin">Super Administrador</option>
            </select>
            {errors.role && (
                  <div className="flex items-center gap-1 mt-2 text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errors.role.message}
                  </div>
                )}
              </div>

              {/* 📋 Additional Info for Edit Mode */}
              {isEditMode && user && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Información del Usuario
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">ID:</span> {user.id}
                    </p>
                    <p>
                      <span className="font-medium">Creado:</span>{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Actualizado:</span>{" "}
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Estado:</span>{" "}
                      <span
                        className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          user.banned
                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        )}
                      >
                        {user.banned ? "Baneado" : "Activo"}
                      </span>
                    </p>
                  </div>
              </div>
            )}
            </form>
          </div>

          {/* 🎯 Footer Actions - FUERA del contenido con scroll */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="user-form"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isEditMode ? "Actualizando..." : "Creando..."}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>
                    {isEditMode ? "Guardar Cambio" : "Crear Usuario"}
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

export default UserModal;
