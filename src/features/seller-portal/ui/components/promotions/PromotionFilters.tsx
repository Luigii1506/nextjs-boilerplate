/**
 * 🔍 PROMOTION FILTERS COMPONENT
 * ================================
 *
 * Filter controls for promotions (status and type)
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";
import { PromotionType } from "../../../types";

export interface PromotionFiltersProps {
  isActiveFilter: boolean | undefined;
  typeFilter: PromotionType | undefined;
  onIsActiveChange: (isActive: boolean | undefined) => void;
  onTypeChange: (type: PromotionType | undefined) => void;
}

/**
 * PromotionFilters - Filter controls for promotions list
 */
export const PromotionFilters: React.FC<PromotionFiltersProps> = React.memo(
  ({ isActiveFilter, typeFilter, onIsActiveChange, onTypeChange }) => {
    return (
      <div className="flex gap-4">
        <select
          value={isActiveFilter === undefined ? "" : isActiveFilter.toString()}
          onChange={(e) =>
            onIsActiveChange(
              e.target.value === ""
                ? undefined
                : e.target.value === "true"
            )
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las promociones</option>
          <option value="true">Solo activas</option>
          <option value="false">Solo inactivas</option>
        </select>

        <select
          value={typeFilter || ""}
          onChange={(e) =>
            onTypeChange(
              (e.target.value as PromotionType) || undefined
            )
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todos los tipos</option>
          <option value="BUY_X_GET_Y">2x1 / 3x2</option>
          <option value="PERCENTAGE_DISCOUNT">Descuento Porcentaje</option>
          <option value="FIXED_DISCOUNT">Descuento Fijo</option>
          <option value="BUNDLE">Bundle</option>
          <option value="FREE_SHIPPING">Envío Gratis</option>
        </select>
      </div>
    );
  }
);

PromotionFilters.displayName = "PromotionFilters";
