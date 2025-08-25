/**
 * 🗑️ DELETE SUPPLIER MODAL
 * ========================
 *
 * Modal de confirmación para eliminar proveedores con animaciones
 * UX amigable con información del proveedor y confirmación segura
 * Incluye validaciones para proveedores con productos asociados
 *
 * Created: 2025-01-18 - Supplier Delete Confirmation
 */

"use client";

import React from "react";
import {
  Trash2,
  AlertTriangle,
  Truck,
  X,
  Loader2,
  Package,
  Star,
  Mail,
  Phone,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import { useDeleteSupplierModal } from "../../hooks";

/**
 * 🎯 SupplierDeleteModal Component
 */
export const SupplierDeleteModal: React.FC = () => {
  const {
    isSupplierDeleteConfirmOpen,
    deletingSupplier,
    closeDeleteSupplierConfirm,
  } = useInventoryContext();

  // 🚀 Delete supplier hook
  const {
    handleDeleteSupplier,
    isLoading: isDeleting,
    error: deleteError,
    reset: resetMutation,
  } = useDeleteSupplierModal();

  // 🎯 Confirm delete handler
  const handleConfirmDelete = async () => {
    if (!deletingSupplier) return;

    const success = await handleDeleteSupplier(deletingSupplier.id);

    if (success) {
      closeDeleteSupplierConfirm();
    }
    // Error handling is done by the hook
  };

  // 🎯 Cancel handler
  const handleCancel = () => {
    if (!isDeleting) {
      closeDeleteSupplierConfirm();
      resetMutation();
    }
  };

  // 🚫 Don't render if modal is closed
  if (!isSupplierDeleteConfirmOpen || !deletingSupplier) return null;

  // 📊 Computed props
  const hasProducts = (deletingSupplier._count?.products || 0) > 0;
  const canDelete = !hasProducts;
  const totalProducts = deletingSupplier._count?.products || 0;

  // Rating stars for display
  const ratingStars = deletingSupplier.rating
    ? Array.from({ length: 5 }, (_, i) => i + 1)
    : [];

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
                  {canDelete ? "Eliminar Proveedor" : "No se puede eliminar"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {canDelete
                    ? "Esta acción no se puede deshacer"
                    : "El proveedor tiene productos asociados"}
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

            {/* 🚛 Supplier Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-4">
                {/* Supplier Icon/Avatar */}
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-8 h-8 text-white" />
                </div>

                {/* Supplier Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-1">
                    {deletingSupplier.name}
                  </h3>

                  {/* Contact Info */}
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {deletingSupplier.contactPerson && (
                      <p>👤 {deletingSupplier.contactPerson}</p>
                    )}
                    {deletingSupplier.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{deletingSupplier.email}</span>
                      </div>
                    )}
                    {deletingSupplier.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{deletingSupplier.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Commercial Info */}
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                      <Package className="w-4 h-4" />
                      <span>
                        {totalProducts} producto{totalProducts !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">
                      {deletingSupplier.paymentTerms} días
                    </div>

                    {deletingSupplier.rating && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {ratingStars
                            .slice(0, deletingSupplier.rating)
                            .map((star) => (
                              <Star
                                key={star}
                                className="w-3 h-3 text-yellow-400 fill-current"
                              />
                            ))}
                        </div>
                        <span className="text-gray-600 dark:text-gray-400 text-xs">
                          {deletingSupplier.rating}
                        </span>
                      </div>
                    )}
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
                      Este proveedor no se puede eliminar
                    </h4>
                  </div>

                  <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                    {hasProducts && (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        <span>
                          Tiene {totalProducts} producto
                          {totalProducts !== 1 ? "s" : ""} asociado
                          {totalProducts !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    <p className="mt-2 text-sm">
                      Para eliminar este proveedor, primero debe:
                    </p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      {hasProducts && (
                        <li>
                          Reasignar o eliminar todos los productos de este
                          proveedor
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 📝 Confirmation Message for deletable suppliers */}
            {canDelete && (
              <div className="mb-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  ¿Estás seguro de que deseas eliminar el proveedor{" "}
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    &ldquo;{deletingSupplier.name}&rdquo;
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
                      Eliminar Proveedor
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

export default SupplierDeleteModal;

