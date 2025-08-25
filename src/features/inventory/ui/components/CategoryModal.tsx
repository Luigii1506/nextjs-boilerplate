/**
 * 🏷️ CATEGORY MODAL COMPONENT
 * ===========================
 *
 * Modal completo para crear/editar categorías con validaciones
 * Usa BaseModal como estándar, diseño hermoso con dark mode y UX fluida
 *
 * Created: 2025-01-17 - Category Management UI
 */

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FolderPlus,
  Palette,
  Hash,
  Loader2,
  AlertTriangle,
  Check,
  Tag,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  BaseModal,
  BaseModalActions,
  BaseModalButton,
} from "@/shared/ui/components";
import { useInventoryContext } from "../../context";
import {
  useCreateCategoryModal,
  useUpdateCategoryModal,
  useCategoriesQuery,
} from "../../hooks";
import { createCategorySchema } from "../../schemas";
import type { z } from "zod";

// 🎯 Form data type - derived from Zod schema
type CategoryFormData = z.infer<typeof createCategorySchema>;

// 🎨 Predefined color options for categories
const CATEGORY_COLORS = [
  { value: "#3B82F6", label: "Azul", class: "bg-blue-500" },
  { value: "#10B981", label: "Verde", class: "bg-green-500" },
  { value: "#F59E0B", label: "Amarillo", class: "bg-yellow-500" },
  { value: "#EF4444", label: "Rojo", class: "bg-red-500" },
  { value: "#8B5CF6", label: "Morado", class: "bg-purple-500" },
  { value: "#EC4899", label: "Rosa", class: "bg-pink-500" },
  { value: "#06B6D4", label: "Cian", class: "bg-cyan-500" },
  { value: "#84CC16", label: "Lima", class: "bg-lime-500" },
  { value: "#F97316", label: "Naranja", class: "bg-orange-500" },
  { value: "#6B7280", label: "Gris", class: "bg-gray-500" },
];

// 🎯 Icon options for categories
const CATEGORY_ICONS = [
  { value: "Tag", label: "Etiqueta" },
  { value: "Folder", label: "Carpeta" },
  { value: "Package", label: "Paquete" },
  { value: "ShoppingCart", label: "Carrito" },
  { value: "Monitor", label: "Monitor" },
  { value: "Smartphone", label: "Teléfono" },
  { value: "Laptop", label: "Laptop" },
  { value: "Headphones", label: "Audífonos" },
  { value: "Camera", label: "Cámara" },
  { value: "Gamepad2", label: "Videojuego" },
  { value: "Book", label: "Libro" },
  { value: "Music", label: "Música" },
  { value: "Shirt", label: "Ropa" },
  { value: "Home", label: "Casa" },
  { value: "Car", label: "Auto" },
  { value: "Utensils", label: "Comida" },
  { value: "Coffee", label: "Bebidas" },
  { value: "Wrench", label: "Herramientas" },
];

/**
 * 🏷️ CategoryModal Component
 */
export const CategoryModal: React.FC = () => {
  const {
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    editingCategory,
    isEditCategoryMode,
    closeEditCategoryModal,
  } = useInventoryContext();

  // 🌐 Parent categories data
  const {
    categories: parentCategories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategoriesQuery({ enabled: isCategoryModalOpen });

  // 🚀 Category hooks - create or update based on mode
  const createCategory = useCreateCategoryModal();
  const updateCategory = useUpdateCategoryModal();

  const {
    handleCreateCategory,
    handleUpdateCategory,
    isLoading: isSubmitting,
    error: submitError,
    reset: resetMutation,
  } = isEditCategoryMode
    ? {
        handleCreateCategory: () => Promise.resolve(false),
        handleUpdateCategory: updateCategory.handleUpdateCategory,
        isLoading: updateCategory.isLoading,
        error: updateCategory.error,
        reset: updateCategory.reset,
      }
    : {
        handleCreateCategory: createCategory.handleCreateCategory,
        handleUpdateCategory: () => Promise.resolve(false),
        isLoading: createCategory.isLoading,
        error: createCategory.error,
        reset: createCategory.reset,
      };

  // 🎛️ Form configuration with dynamic default values
  const getDefaultValues = useCallback((): CategoryFormData => {
    if (isEditCategoryMode && editingCategory) {
      return {
        name: editingCategory.name,
        description: editingCategory.description ?? "",
        parentId: editingCategory.parentId ?? "",
        color: editingCategory.color ?? "#3B82F6",
        icon: editingCategory.icon ?? "",
        sortOrder: editingCategory.sortOrder ?? 0,
      };
    }

    // Default values for create mode
    return {
      name: "",
      description: "",
      parentId: "",
      color: "#3B82F6", // Default blue color
      icon: "",
      sortOrder: 0,
    };
  }, [isEditCategoryMode, editingCategory]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(createCategorySchema),
    defaultValues: getDefaultValues(),
    mode: "all" as const,
  });

  const watchedColor = watch("color");
  const watchedIcon = watch("icon");

  // 🔄 Reset form when editing category changes
  useEffect(() => {
    if (isCategoryModalOpen) {
      const defaultValues = getDefaultValues();

      // First reset with default values
      reset(defaultValues);

      // 🔧 Set values explicitly for edit mode
      if (isEditCategoryMode && editingCategory) {
        setValue("name", editingCategory.name);
        setValue("description", editingCategory.description ?? "");
        setValue("parentId", editingCategory.parentId ?? "");
        setValue("color", editingCategory.color ?? "#3B82F6");
        setValue("icon", editingCategory.icon ?? "");
        setValue("sortOrder", editingCategory.sortOrder ?? 0);

        // Force revalidation
        setTimeout(() => {
          trigger();
        }, 50);
      }
    }
  }, [
    isCategoryModalOpen,
    isEditCategoryMode,
    editingCategory?.id,
    reset,
    setValue,
    trigger,
    getDefaultValues,
  ]);

  // 🎯 Close modal handler
  const handleClose = () => {
    if (
      isDirty &&
      !window.confirm(
        "¿Estás seguro de que quieres cerrar? Se perderán los cambios."
      )
    ) {
      return;
    }

    if (isEditCategoryMode) {
      closeEditCategoryModal();
    } else {
      setIsCategoryModalOpen(false);
    }

    reset();
    resetMutation();
  };

  // 🎯 Submit handler
  const onSubmit = async (data: CategoryFormData) => {
    let success = false;

    // Clean data - convert empty strings to null/undefined for optional fields
    const cleanData = {
      ...data,
      description: data.description || undefined,
      parentId: data.parentId || undefined,
      icon: data.icon || undefined,
      // Keep color as is since it always has a value
      sortOrder: data.sortOrder || 0,
    };

    if (isEditCategoryMode && editingCategory) {
      // For update, add the id to the data
      const updateData = { ...cleanData, id: editingCategory.id };

      success = await handleUpdateCategory(editingCategory.id, updateData);
    } else {
      // Use cleaned form data for create operation
      success = await handleCreateCategory(cleanData);
    }

    if (success) {
      // Success - close modal and reset form
      if (isEditCategoryMode) {
        closeEditCategoryModal();
      } else {
        setIsCategoryModalOpen(false);
      }
      reset();
    }
    // Error handling is done by the hooks
  };

  // 🎨 Get available parent categories (exclude current category and its descendants)
  const availableParentCategories = useMemo(() => {
    if (!parentCategories) return [];

    // If editing, exclude current category and its descendants
    if (isEditCategoryMode && editingCategory) {
      return parentCategories.filter(
        (cat) =>
          cat.id !== editingCategory.id && cat.parentId !== editingCategory.id
      );
    }

    return parentCategories;
  }, [parentCategories, isEditCategoryMode, editingCategory]);

  return (
    <BaseModal
      isOpen={isCategoryModalOpen}
      onClose={handleClose}
      title={isEditCategoryMode ? "Editar Categoría" : "Agregar Categoría"}
      description={
        isEditCategoryMode
          ? `Modifica la información de "${editingCategory?.name}"`
          : "Completa la información de la nueva categoría"
      }
      icon={<FolderPlus className="w-5 h-5 text-white" />}
      isDirty={isDirty}
      isLoading={isSubmitting}
      maxWidth="2xl"
      actions={
        <BaseModalActions align="between">
          {/* Validation Summary */}
          <div className="flex items-center gap-4">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span>
                  {Object.keys(errors).length} error(es) en el formulario
                </span>
              </div>
            )}
            {isValid && isDirty && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span>Formulario válido</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <BaseModalButton
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </BaseModalButton>

            <BaseModalButton
              variant="primary"
              type="submit"
              disabled={!isValid || isSubmitting || categoriesLoading}
              loading={isSubmitting || categoriesLoading}
              onClick={handleSubmit(onSubmit)}
            >
              {isEditCategoryMode ? (
                <>
                  <Tag className="w-4 h-4" />
                  Actualizar Categoría
                </>
              ) : (
                <>
                  <FolderPlus className="w-4 h-4" />
                  Crear Categoría
                </>
              )}
            </BaseModalButton>
          </div>
        </BaseModalActions>
      }
    >
      {/* 🚨 Error Alert */}
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 dark:text-red-400">
              {submitError}
            </p>
          </div>
        </div>
      )}

      {/* 📝 Form Content */}
      <form
        id="category-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* 🏷️ Basic Information */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-500" />
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                {...register("name")}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                  "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                  "placeholder-gray-500 dark:placeholder-gray-400",
                  errors.name
                    ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                    : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                  "focus:outline-none focus:ring-4"
                )}
                placeholder="Ej: Electrónicos"
                autoComplete="off"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Parent Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría Padre
              </label>
              <select
                {...register("parentId")}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                  "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                  "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                  "focus:outline-none focus:ring-4"
                )}
              >
                <option value="">
                  {categoriesLoading
                    ? "Cargando categorías..."
                    : "Sin categoría padre"}
                </option>
                {categoriesError ? (
                  <option value="" disabled>
                    Error al cargar categorías
                  </option>
                ) : (
                  availableParentCategories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className={cn(
                "w-full px-4 py-3 rounded-lg border transition-colors duration-200 resize-none",
                "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                "placeholder-gray-500 dark:placeholder-gray-400",
                errors.description
                  ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                "focus:outline-none focus:ring-4"
              )}
              placeholder="Descripción de la categoría..."
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* 🎨 Appearance */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-500" />
            Apariencia
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setValue("color", color.value)}
                    className={cn(
                      "w-10 h-10 rounded-lg transition-all duration-200",
                      "border-2 hover:scale-105",
                      color.class,
                      watchedColor === color.value
                        ? "border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-500 dark:ring-gray-400"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                    title={color.label}
                  />
                ))}
              </div>
              <div className="mt-2">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: watchedColor }}
                >
                  Vista previa
                </div>
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ícono
              </label>
              <select
                {...register("icon")}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                  "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                  "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                  "focus:outline-none focus:ring-4"
                )}
              >
                <option value="">Sin ícono</option>
                {CATEGORY_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ⚙️ Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Hash className="w-5 h-5 text-green-500" />
            Configuración
          </h3>

          {/* Sort Order */}
          <div className="max-w-sm">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Orden de Clasificación
            </label>
            <input
              {...register("sortOrder", { valueAsNumber: true })}
              type="number"
              min="0"
              max="9999"
              step="1"
              className={cn(
                "w-full px-4 py-3 rounded-lg border transition-colors duration-200",
                "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                "placeholder-gray-500 dark:placeholder-gray-400",
                errors.sortOrder
                  ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-500/20"
                  : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20",
                "focus:outline-none focus:ring-4"
              )}
              placeholder="0"
            />
            {errors.sortOrder && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.sortOrder.message}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Menor número = mayor prioridad en el ordenamiento
            </p>
          </div>
        </div>
      </form>
    </BaseModal>
  );
};

export default CategoryModal;

