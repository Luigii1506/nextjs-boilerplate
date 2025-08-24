/**
 * 🗑️ DELETE PRODUCT MODAL
 * =======================
 *
 * Modal de confirmación para eliminar productos con animaciones
 * UX amigable con información del producto y confirmación segura
 *
 * Created: 2025-01-18 - Product Delete Confirmation
 */

"use client";

import React from "react";
import { Trash2, AlertTriangle, Package, X, Loader2 } from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import { useDeleteProductModal } from "../../hooks";

/**
 * 🎯 DeleteProductModal Component
 */
export const DeleteProductModal: React.FC = () => {
  const { isDeleteConfirmOpen, deletingProduct, closeDeleteConfirm } =
    useInventoryContext();

  // 🚀 Delete product hook
  const {
    handleDeleteProduct,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetMutation,
  } = useDeleteProductModal();

  // 🎯 Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    const success = await handleDeleteProduct(deletingProduct.id);

    if (success) {
      closeDeleteConfirm();
    }
    // Error handling is done by the hook
  };

  // 🎯 Cancel handler
  const handleCancel = () => {
    if (!isDeleting) {
      closeDeleteConfirm();
      resetMutation();
    }
  };

  // 🚫 Don't render if modal is closed
  if (!isDeleteConfirmOpen || !deletingProduct) return null;

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
            "w-full max-w-md",
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
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Eliminar Producto
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta acción no se puede deshacer
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

            {/* 📦 Product Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                  {deletingProduct.images[0] ? (
                    <img
                      src={deletingProduct.images[0]}
                      alt={deletingProduct.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {deletingProduct.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    SKU: {deletingProduct.sku}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Stock: {deletingProduct.stock} {deletingProduct.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    ${deletingProduct.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Costo: ${deletingProduct.cost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* ⚠️ Warning Text */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">
                    ¿Estás seguro de eliminar este producto?
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Se eliminará permanentemente de tu inventario. Si tiene
                    movimientos de stock asociados, también se perderá ese
                    historial.
                  </p>
                </div>
              </div>
            </div>

            {/* 🎯 Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Cancel */}
              <button
                type="button"
                onClick={handleCancel}
                disabled={isDeleting}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200",
                  "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
                  "text-gray-700 dark:text-gray-300",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-4 focus:ring-gray-500/20"
                )}
              >
                Cancelar
              </button>

              {/* Confirm Delete */}
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={cn(
                  "flex-1 px-4 py-3 rounded-lg font-medium transition-colors duration-200",
                  "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700",
                  "text-white focus:outline-none focus:ring-4 focus:ring-red-500/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center justify-center gap-2"
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
                    Eliminar Producto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
