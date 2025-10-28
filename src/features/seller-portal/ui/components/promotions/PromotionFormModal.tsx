/**
 * 📝 PROMOTION FORM MODAL COMPONENT
 * ===================================
 *
 * Modal form for creating/editing promotions
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { PromotionFormData, PromotionType, DiscountType, AppliesTo } from "../../../types";

export interface PromotionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: Partial<PromotionFormData>;
  setFormData: (data: Partial<PromotionFormData>) => void;
  isSubmitting?: boolean;
}

/**
 * PromotionFormModal - Create/edit promotion form modal
 */
export const PromotionFormModal: React.FC<PromotionFormModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting = false }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black dark:bg-opacity-70 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Nueva Promoción
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de la Promoción *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="ej: Black Friday 2x1"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={2}
                placeholder="Descripción de la promoción"
              />
            </div>

            {/* Type and Discount Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Promoción *
                </label>
                <select
                  value={formData.type || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as PromotionType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="BUY_X_GET_Y">2x1 / 3x2</option>
                  <option value="PERCENTAGE_DISCOUNT">
                    Descuento por Porcentaje
                  </option>
                  <option value="FIXED_DISCOUNT">Descuento Monto Fijo</option>
                  <option value="FREE_SHIPPING">Envío Gratis</option>
                  <option value="BUNDLE">Bundle de Productos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Descuento *
                </label>
                <select
                  value={formData.discountType || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountType: e.target.value as DiscountType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="PERCENTAGE">Porcentaje</option>
                  <option value="FIXED_AMOUNT">Monto Fijo</option>
                </select>
              </div>
            </div>

            {/* Discount Value and Applies To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valor del Descuento *
                </label>
                <input
                  type="number"
                  value={formData.discountValue || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountValue: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Se Aplica A *
                </label>
                <select
                  value={formData.appliesTo || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appliesTo: e.target.value as AppliesTo,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="ALL_PRODUCTS">Todos los Productos</option>
                  <option value="SPECIFIC_PRODUCTS">
                    Productos Específicos
                  </option>
                  <option value="SPECIFIC_CATEGORIES">
                    Categorías Específicas
                  </option>
                </select>
              </div>
            </div>

            {/* Start and End Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  value={
                    formData.startAt
                      ? new Date(formData.startAt).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startAt: new Date(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha Fin (Opcional)
                </label>
                <input
                  type="date"
                  value={
                    formData.endAt
                      ? new Date(formData.endAt).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endAt: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Min Purchase Amount and Max Uses */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto Mínimo de Compra
                </label>
                <input
                  type="number"
                  value={formData.minPurchaseAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPurchaseAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usos Máximos Totales
                </label>
                <input
                  type="number"
                  value={formData.maxUsesTotal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsesTotal: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min="0"
                  placeholder="Ilimitado"
                />
              </div>
            </div>

            {/* Active Checkbox */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Activar promoción inmediatamente
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creando..." : "Crear Promoción"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PromotionFormModal.displayName = "PromotionFormModal";
