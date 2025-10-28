/**
 * 📋 COUPON TABLE COMPONENT
 * ==========================
 *
 * Table displaying all coupons with actions
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import {
  getCouponTypeLabel,
  formatDiscount,
  formatUsage,
} from "../../../utils/coupons.helpers";
import type { CouponListItem } from "../../../types";

export type Coupon = CouponListItem;

export interface CouponTableProps {
  coupons: Coupon[];
  onToggleActive: (id: string, isActive: boolean) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, code: string) => void;
  isTogglingActive?: boolean;
  isDuplicating?: boolean;
  isDeleting?: boolean;
}

/**
 * CouponTable - Displays coupons in table format with actions
 */
export const CouponTable: React.FC<CouponTableProps> = React.memo(
  ({
    coupons,
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
                Código
              </th>
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
            {coupons.map((coupon) => {
              const usage = formatUsage(
                coupon.usageCount,
                coupon.maxUsesTotal,
                coupon.maxUsesPerUser
              );

              return (
                <tr
                  key={coupon.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-blue-600">
                      {coupon.code}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {coupon.name}
                    </div>
                    {coupon.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {coupon.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {getCouponTypeLabel(coupon.type)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {formatDiscount(coupon.discountType, coupon.discountValue)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {coupon.startAt && (
                      <div>
                        {new Date(coupon.startAt).toLocaleDateString("es-MX")}
                      </div>
                    )}
                    {coupon.endAt && (
                      <div className="text-xs">
                        {new Date(coupon.endAt).toLocaleDateString("es-MX")}
                      </div>
                    )}
                    {!coupon.startAt && !coupon.endAt && (
                      <div className="text-gray-400">Sin límite</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {usage.main}
                    {usage.subtitle && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {usage.subtitle}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {coupon.isActive ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs font-medium rounded-full">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() =>
                        onToggleActive(coupon.id, !coupon.isActive)
                      }
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      disabled={isTogglingActive}
                    >
                      {coupon.isActive ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => onDuplicate(coupon.id)}
                      className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-100"
                      disabled={isDuplicating}
                    >
                      Duplicar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar cupón ${coupon.code}?`)) {
                          onDelete(coupon.id, coupon.code);
                        }
                      }}
                      className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      disabled={isDeleting}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
);

CouponTable.displayName = "CouponTable";
