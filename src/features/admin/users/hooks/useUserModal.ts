/**
 * 🎭 USER MODAL HOOK - TANSTACK OPTIMIZED
 * ======================================
 *
 * Hook súper optimizado para UserModal usando TanStack Query.
 * Performance enterprise, zero loading states duplicados.
 *
 * Enterprise: 2025-01-17 - TanStack Query Modal optimization
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { createUserAction, updateUserAction } from "../server/actions";
import type { User, CreateUserForm } from "../types";
import { useNotifications } from "@/shared/hooks/useNotifications";

// 🎯 Query keys
const USERS_QUERY_KEYS = {
  all: ["users"] as const,
  lists: () => [...USERS_QUERY_KEYS.all, "list"] as const,
  details: () => [...USERS_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...USERS_QUERY_KEYS.details(), id] as const,
} as const;

// 🎭 Form validation interface
interface FormValidation {
  isValid: boolean;
  errors: Partial<Record<keyof CreateUserForm, string>>;
}

/**
 * 🎭 USE USER MODAL
 *
 * Hook optimizado para UserModal con TanStack Query mutations.
 * Incluye validación, optimistic updates y manejo de estados.
 */
export function useUserModal() {
  const { notify } = useNotifications();
  const queryClient = useQueryClient();

  // 🎛️ Form state
  const [formData, setFormData] = useState<CreateUserForm>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateUserForm, string>>>({});

  // ✅ Form validation
  const validateForm = useCallback(
    (data: CreateUserForm, isEdit = false): FormValidation => {
      const newErrors: Partial<Record<keyof CreateUserForm, string>> = {};

      // Name validation
      if (!data.name.trim()) {
        newErrors.name = "El nombre es requerido";
      } else if (data.name.trim().length < 2) {
        newErrors.name = "El nombre debe tener al menos 2 caracteres";
      } else if (data.name.trim().length > 50) {
        newErrors.name = "El nombre no puede exceder 50 caracteres";
      }

      // Email validation
      if (!data.email.trim()) {
        newErrors.email = "El email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = "El formato del email no es válido";
      }

      // Role validation
      if (!["user", "admin", "super_admin"].includes(data.role)) {
        newErrors.role = "El rol seleccionado no es válido";
      }

      // Password validation (only for new users)
      if (!isEdit && !data.password) {
        newErrors.password = "La contraseña es requerida";
      } else if (!isEdit && data.password && data.password.length < 8) {
        newErrors.password = "La contraseña debe tener al menos 8 caracteres";
      } else if (
        !isEdit &&
        data.password &&
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)
      ) {
        newErrors.password =
          "La contraseña debe contener al menos una mayúscula, una minúscula y un número";
      }

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    []
  );

  // ➕ Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserForm) => {
      const validation = validateForm(userData, false);
      if (!validation.isValid) {
        throw new Error("Datos de formulario inválidos");
      }

      const formDataObj = new FormData();
      formDataObj.append("name", userData.name.trim());
      formDataObj.append("email", userData.email.trim().toLowerCase());
      formDataObj.append("password", userData.password);
      formDataObj.append("role", userData.role);

      const result = await createUserAction(formDataObj);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async (newUser) => {
      // 🎯 Optimistic update
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🚀 Optimistic user
      const optimisticUser: User = {
        id: `temp-${Date.now()}`,
        name: newUser.name.trim(),
        email: newUser.email.trim().toLowerCase(),
        emailVerified: false,
        role: newUser.role,
        image: null,
        banned: false,
        banReason: null,
        banExpires: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<User[]>(USERS_QUERY_KEYS.lists(), (old) => [
        ...(old || []),
        optimisticUser,
      ]);

      return { previousUsers };
    },
    onError: (err, newUser, context) => {
      // 🔙 Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSuccess: () => {
      // 🎉 Success actions
      setFormData({ name: "", email: "", password: "", role: "user" });
      setErrors({});
    },
    onSettled: () => {
      // 🔄 Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // ✏️ Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({
      user,
      updates,
    }: {
      user: User;
      updates: Partial<CreateUserForm>;
    }) => {
      const validation = validateForm(
        { ...user, ...updates } as CreateUserForm,
        true
      );
      if (!validation.isValid) {
        throw new Error("Datos de formulario inválidos");
      }

      const formDataObj = new FormData();
      formDataObj.append("id", user.id);
      if (updates.name) formDataObj.append("name", updates.name.trim());
      if (updates.email)
        formDataObj.append("email", updates.email.trim().toLowerCase());
      if (updates.role) formDataObj.append("role", updates.role);
      // Note: Password updates would need special handling

      const result = await updateUserAction(formDataObj);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onMutate: async ({ user, updates }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEYS.lists() });

      const previousUsers = queryClient.getQueryData<User[]>(
        USERS_QUERY_KEYS.lists()
      );

      // 🎯 Optimistic update
      queryClient.setQueryData<User[]>(
        USERS_QUERY_KEYS.lists(),
        (old) =>
          old?.map((u) =>
            u.id === user.id
              ? { ...u, ...updates, updatedAt: new Date().toISOString() }
              : u
          ) || []
      );

      return { previousUsers };
    },
    onError: (err, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(
          USERS_QUERY_KEYS.lists(),
          context.previousUsers
        );
      }
    },
    onSuccess: () => {
      // 🎉 Success actions
      setFormData({ name: "", email: "", password: "", role: "user" });
      setErrors({});
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.lists() });
    },
  });

  // 🎯 Form actions
  const resetForm = useCallback(() => {
    setFormData({ name: "", email: "", password: "", role: "user" });
    setErrors({});
  }, []);

  const loadUser = useCallback((user: User) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "", // Never populate password for editing
    });
    setErrors({});
  }, []);

  const updateField = useCallback(
    (field: keyof CreateUserForm, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  // 🚀 Action wrappers with notifications
  const createUser = useCallback(
    async (userData: CreateUserForm) => {
      const validation = validateForm(userData, false);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      try {
        await notify(
          () => createUserMutation.mutateAsync(userData),
          "Creando usuario...",
          "Usuario creado exitosamente"
        );
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    },
    [createUserMutation, notify, validateForm]
  );

  const updateUser = useCallback(
    async (user: User, updates: Partial<CreateUserForm>) => {
      const validation = validateForm(
        { ...user, ...updates } as CreateUserForm,
        true
      );
      if (!validation.isValid) {
        setErrors(validation.errors);
        return { success: false, errors: validation.errors };
      }

      try {
        await notify(
          () => updateUserMutation.mutateAsync({ user, updates }),
          "Actualizando usuario...",
          "Usuario actualizado exitosamente"
        );
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Error desconocido",
        };
      }
    },
    [updateUserMutation, notify, validateForm]
  );

  return {
    // 📊 Form data
    formData,
    errors,

    // 🔄 States
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isLoading: createUserMutation.isPending || updateUserMutation.isPending,

    // 🎯 Actions
    createUser,
    updateUser,
    resetForm,
    loadUser,
    updateField,
    validateForm: (data: CreateUserForm, isEdit = false) =>
      validateForm(data, isEdit),

    // 🔄 Raw mutations (for advanced usage)
    createUserMutation,
    updateUserMutation,
  };
}
