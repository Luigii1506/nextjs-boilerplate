/**
 * 🏆 TOP SUPPLIER HIGHLIGHT COMPONENT
 * ====================================
 *
 * Highlights the supplier with the most products
 * Extracted from SuppliersTab for maintainability
 *
 * FEATURES:
 * - Shows top supplier by product count
 * - Trophy icon and gradient styling
 * - Dark mode compatible
 * - Null-safe (shows nothing if no suppliers)
 *
 * Created: 2025-01-27 - Extracted from SuppliersTab
 */

"use client";

import React from "react";
import { Star, ChevronRight } from "lucide-react";
import { SupplierWithRelations } from "../../../types";

/**
 * TopSupplierHighlight Props Interface
 */
export interface TopSupplierHighlightProps {
  suppliers: SupplierWithRelations[];
  onViewDetails: (supplier: SupplierWithRelations) => void;
}

/**
 * TopSupplierHighlight Component
 *
 * Displays a highlighted card for the supplier with the most products
 *
 * @example
 * <TopSupplierHighlight suppliers={suppliers} onViewDetails={handleViewDetails} />
 */
export const TopSupplierHighlight: React.FC<TopSupplierHighlightProps> =
  React.memo(({ suppliers, onViewDetails }) => {
    if (suppliers.length === 0) return null;

    const topSupplier = [...suppliers].sort(
      (a, b) => (b._count?.products || 0) - (a._count?.products || 0)
    )[0];

    const productCount = topSupplier?._count?.products || 0;

    if (!topSupplier || productCount === 0) return null;

    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
            <Star className="w-6 h-6 text-amber-600 dark:text-amber-400 fill-amber-600 dark:fill-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100">
              Proveedor Principal
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <span className="font-semibold">{topSupplier.name}</span> con{" "}
              {productCount} productos
            </p>
          </div>
          <button
            onClick={() => onViewDetails(topSupplier)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            Ver Productos
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  });

TopSupplierHighlight.displayName = "TopSupplierHighlight";
