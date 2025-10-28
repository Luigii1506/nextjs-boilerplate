/**
 * 📋 PROMOTION TABLE COMPONENT
 * ==============================
 *
 * Table displaying promotions with actions
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { getPromotionTypeLabel, formatDiscount, formatUsageCount } from "../../../utils/promotions.helpers";

export interface Promotion {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  startAt: Date | string;
  endAt?: Date | string | null;
  usageCount: number;
  maxUsesTotal?: number | null;
  isActive: boolean;
}

export interface PromotionTableProps {
  promotions: Promotion[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  isTogglingActive?: boolean;
  isDuplicating?: boolean;
  isDeleting?: boolean;
}

/**
 * PromotionTable - Displays promotions with inline actions
 */
export const PromotionTable: React.FC<PromotionTableProps> = React.memo(
  ({
    promotions,
    onToggleActive,
    onDuplicate,
    onDelete,
    isTogglingActive = false,
    isDuplicating = false,
    isDeleting = false,
  }) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Descuento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Vigencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Usos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {promotions.map((promotion) => (
              <tr
                key={promotion.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {promotion.name}
                  </div>
                  {promotion.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {promotion.description}
                    </div>
                  )}
                </td>

                {/* Type */}
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {getPromotionTypeLabel(promotion.type)}
                </td>

                {/* Discount */}
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {formatDiscount(promotion.discountType, promotion.discountValue)}
                </td>

                {/* Validity Period */}
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    {new Date(promotion.startAt).toLocaleDateString("es-MX")}
                  </div>
                  {promotion.endAt && (
                    <div className="text-xs">
                      {new Date(promotion.endAt).toLocaleDateString("es-MX")}
                    </div>
                  )}
                </td>

                {/* Usage Count */}
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  {formatUsageCount(promotion.usageCount, promotion.maxUsesTotal)}
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  {promotion.isActive ? (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                      Activa
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                      Inactiva
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() =>
                      onToggleActive(promotion.id, !promotion.isActive)
                    }
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    disabled={isTogglingActive}
                  >
                    {promotion.isActive ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={() => onDuplicate(promotion.id)}
                    className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-100"
                    disabled={isDuplicating}
                  >
                    Duplicar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("¿Eliminar esta promoción?")) {
                        onDelete(promotion.id);
                      }
                    }}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    disabled={isDeleting}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

PromotionTable.displayName = "PromotionTable";
