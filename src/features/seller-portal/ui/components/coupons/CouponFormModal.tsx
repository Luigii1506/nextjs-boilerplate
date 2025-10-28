/**
 * 📝 COUPON FORM MODAL COMPONENT
 * ================================
 *
 * Modal form for creating/editing coupons
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import type {
  CouponType,
  DiscountType,
  AppliesTo,
  CouponFormData,
} from "../../../types";
import { formatCouponCode } from "../../../utils/coupons.helpers";

export interface CouponFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CouponFormData) => void | Promise<void>;
  formData: Partial<CouponFormData>;
  setFormData: (data: Partial<CouponFormData>) => void;
  isSubmitting?: boolean;
}

/**
 * CouponFormModal - Create/edit coupon modal
 */
export const CouponFormModal: React.FC<CouponFormModalProps> = React.memo(
  ({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting = false }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black dark:bg-opacity-70 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Nuevo Cupón
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Código del Cupón * (mayúsculas, alfanumérico)
              </label>
              <input
                type="text"
                value={formData.code || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: formatCouponCode(e.target.value),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md font-mono"
                placeholder="SUMMER2024"
                required
                maxLength={20}
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Mínimo 3 caracteres, solo letras y números
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Interno *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="Promoción Verano 2024"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                rows={2}
                placeholder="Descripción para el cliente"
              />
            </div>

            {/* Type and Discount Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Cupón *
                </label>
                <select
                  value={formData.type || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as CouponType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  required
                >
                  <option value="GENERAL">General</option>
                  <option value="FIRST_PURCHASE">Primera Compra</option>
                  <option value="LOYALTY">Fidelidad</option>
                  <option value="SEASONAL">Temporal</option>
                  <option value="CART_ABANDONMENT">Carrito Abandonado</option>
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
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

            {/* Max Uses */}
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  min="0"
                  placeholder="Ilimitado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usos por Usuario *
                </label>
                <input
                  type="number"
                  value={formData.maxUsesPerUser || 1}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsesPerUser: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  min="1"
                  required
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
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-gray-300 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  Activar cupón inmediatamente
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-4 border-t dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                onClick={() => onSubmit(formData as CouponFormData)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creando..." : "Crear Cupón"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

CouponFormModal.displayName = "CouponFormModal";
