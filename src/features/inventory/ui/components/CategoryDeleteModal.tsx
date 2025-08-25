/**
 * 🗑️ DELETE CATEGORY MODAL
 * ========================
 *
 * Modal de confirmación para eliminar categorías con animaciones
 * UX amigable con información de la categoría y confirmación segura
 * Incluye validaciones para categorías con productos o subcategorías
 *
 * Created: 2025-01-18 - Category Delete Confirmation
 */

"use client";

import React from "react";
import {
  Trash2,
  AlertTriangle,
  Layers3,
  X,
  Loader2,
  Package,
  TreeDeciduous,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import { useDeleteCategoryModal } from "../../hooks";

/**
 * 🎯 CategoryDeleteModal Component
 */
export const CategoryDeleteModal: React.FC = () => {
  const {
    isCategoryDeleteConfirmOpen,
    deletingCategory,
    closeDeleteCategoryConfirm,
  } = useInventoryContext();

  // 🚀 Delete category hook
  const {
    handleDeleteCategory,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetMutation,
  } = useDeleteCategoryModal();

  // 🎯 Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    const success = await handleDeleteCategory(deletingCategory.id);

    if (success) {
      closeDeleteCategoryConfirm();
    }
    // Error handling is done by the hook
  };

  // 🎯 Cancel handler
  const handleCancel = () => {
    if (!isDeleting) {
      closeDeleteCategoryConfirm();
      resetMutation();
    }
  };

  // 🚫 Don't render if modal is closed
  if (!isCategoryDeleteConfirmOpen || !deletingCategory) return null;

  // 📊 Computed props
  const hasProducts = (deletingCategory._count?.products || 0) > 0;
  const hasChildren = (deletingCategory._count?.children || 0) > 0;
  const canDelete = !hasProducts && !hasChildren;
  const totalProducts = deletingCategory._count?.products || 0;
  const totalChildren = deletingCategory._count?.children || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-fadeIn"
        onClick={handleCancel}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "w-full max-w-lg",
            "transform transition-all duration-300 animate-slideInUp"
          )}
        >
          {/* ❌ Close button */}
          <button
            onClick={handleCancel}
            disabled={isDeleting}
            className={cn(
              "absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center",
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* 🚨 Header */}
            <div className="flex items-center gap-4 mb-6">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  canDelete
                    ? "bg-red-100 dark:bg-red-900/20"
                    : "bg-amber-100 dark:bg-amber-900/20"
                )}
              >
                {canDelete ? (
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {canDelete ? "Eliminar Categoría" : "No se puede eliminar"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {canDelete
                    ? "Esta acción no se puede deshacer"
                    : "La categoría tiene dependencias"}
                </p>
              </div>
            </div>

            {/* 🚨 Error Alert */}
            {deleteError && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {deleteError}
                  </p>
                </div>
              </div>
            )}

            {/* 🏷️ Category Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg flex items-center justify-center",
                    deletingCategory.color
                      ? "border-2 border-white dark:border-gray-600"
                      : "bg-gray-200 dark:bg-gray-600"
                  )}
                  style={
                    deletingCategory.color
                      ? { backgroundColor: deletingCategory.color }
                      : undefined
                  }
                >
                  <Layers3
                    className={cn(
                      "w-6 h-6",
                      deletingCategory.color ? "text-white" : "text-gray-400"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {deletingCategory.name}
                  </h3>
                  {deletingCategory.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {deletingCategory.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Orden: #{deletingCategory.sortOrder}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <Package className="w-4 h-4" />
                    <span>{totalProducts} productos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <TreeDeciduous className="w-4 h-4" />
                    <span>{totalChildren} subcategorías</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚧 Blocking Conditions */}
            {!canDelete && (
              <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">
                      Esta categoría no se puede eliminar
                    </h4>
                  </div>

                  <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                    {hasProducts && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>
                          Contiene {totalProducts} producto
                          {totalProducts !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {hasChildren && (
                      <div className="flex items-center gap-2">
                        <TreeDeciduous className="w-4 h-4" />
                        <span>
                          Tiene {totalChildren} subcategoría
                          {totalChildren !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    <p className="mt-2 text-sm">
                      Para eliminar esta categoría, primero debe:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      {hasProducts && (
                        <li>Reasignar o eliminar todos los productos</li>
                      )}
                      {hasChildren && (
                        <li>Reasignar o eliminar todas las subcategorías</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 📝 Confirmation Message for deletable categories */}
            {canDelete && (
              <div className="mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  ¿Estás seguro de que deseas eliminar la categoría{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    &ldquo;{deletingCategory.name}&rdquo;
                  </span>
                  ?
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Esta acción es permanente y no se puede deshacer.
                </p>
              </div>
            )}

            {/* 🎯 Action Buttons */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg",
                  "text-gray-700 dark:text-gray-300",
                  "bg-gray-100 dark:bg-gray-700",
                  "hover:bg-gray-200 dark:hover:bg-gray-600",
                  "border border-gray-200 dark:border-gray-600",
                  "transition-colors duration-200",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {canDelete ? "Cancelar" : "Cerrar"}
              </button>

              {canDelete && (
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className={cn(
                    "px-6 py-2 text-sm font-medium rounded-lg",
                    "text-white bg-red-600 hover:bg-red-700",
                    "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-colors duration-200",
                    "flex items-center gap-2"
                  )}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Eliminar Categoría
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDeleteModal;
