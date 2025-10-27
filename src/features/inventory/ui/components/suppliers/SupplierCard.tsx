/**
 * 🏢 SUPPLIER CARD COMPONENT
 * ==========================
 *
 * Card component for displaying supplier information in inventory context
 * Extracted from SuppliersTab for maintainability
 *
 * FEATURES:
 * - Displays supplier name, contact, location
 * - Shows product count and rating
 * - Status badge (active/inactive)
 * - Action buttons (view, edit, delete)
 * - Color-coded header
 * - Dark mode compatible
 *
 * Created: 2025-01-27 - Extracted from SuppliersTab
 */

"use client";

import React from "react";
import { Package, Star, Eye } from "lucide-react";
import { cn } from "@/shared/utils";
import { SupplierWithRelations } from "../../../types";

/**
 * SupplierCard Props Interface
 */
export interface SupplierCardProps {
  supplier: SupplierWithRelations;
  onViewDetails: (supplier: SupplierWithRelations) => void;
}

/**
 * SupplierCard Component
 *
 * Displays a supplier card with contact info, product count, rating, and actions
 *
 * @example
 * <SupplierCard
 *   supplier={supplier}
 *   onViewDetails={handleViewDetails}
 * />
 */
export const SupplierCard: React.FC<SupplierCardProps> = React.memo(
  ({ supplier, onViewDetails }) => {
    const productCount = supplier._count?.products || 0;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden group">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {supplier.name}
              </h3>
              {supplier.contactPerson && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {supplier.contactPerson}
                </p>
              )}
            </div>
            {supplier.isActive ? (
              <span className="px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                Activo
              </span>
            ) : (
              <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                Inactivo
              </span>
            )}
          </div>

          {/* Rating */}
          {supplier.rating !== null && supplier.rating > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3.5 h-3.5",
                      i < supplier.rating!
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {supplier.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Product Count - Destacado */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Productos
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {productCount}
                </p>
              </div>
            </div>
            <button
              onClick={() => onViewDetails(supplier)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
              Ver Detalles
            </button>
          </div>
        </div>

        {/* Footer Info */}
        {supplier.paymentTerms && (
          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Términos:</span>{" "}
            {supplier.paymentTerms} días
          </div>
        )}
      </div>
    );
  }
);

SupplierCard.displayName = "SupplierCard";
