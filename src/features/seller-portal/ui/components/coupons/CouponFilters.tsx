/**
 * 🔍 COUPON FILTERS COMPONENT
 * ============================
 *
 * Filters for coupons list (status and type)
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import type { CouponType } from "../../../types";

export interface CouponFiltersState {
  isActive: boolean | undefined;
  type: CouponType | undefined;
}

export interface CouponFiltersProps {
  filters: CouponFiltersState;
  onFiltersChange: (filters: CouponFiltersState) => void;
}

/**
 * CouponFilters - Status and type filter controls
 */
export const CouponFilters: React.FC<CouponFiltersProps> = React.memo(
  ({ filters, onFiltersChange }) => {
    return (
      <div className="flex gap-4">
        <select
          value={
            filters.isActive === undefined ? "" : filters.isActive.toString()
          }
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              isActive:
                e.target.value === ""
                  ? undefined
                  : e.target.value === "true",
            })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los cupones</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>

        <select
          value={filters.type || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              type: (e.target.value as CouponType) || undefined,
            })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los tipos</option>
          <option value="GENERAL">General</option>
          <option value="FIRST_PURCHASE">Primera Compra</option>
          <option value="LOYALTY">Fidelidad</option>
          <option value="SEASONAL">Temporal</option>
          <option value="CART_ABANDONMENT">Carrito Abandonado</option>
        </select>
      </div>
    );
  }
);

CouponFilters.displayName = "CouponFilters";
