/**
 * 🏷️ ACTIVE FILTERS BAR COMPONENT
 * ===============================
 *
 * Displays currently active filters as removable badges
 * Shows filter count and provides quick clear all option
 *
 * Created: 2025-01-19 - Active Filters Display
 */

"use client";

import React, { useMemo } from "react";
import { X, Filter, Trash2 } from "lucide-react";
import { cn } from "@/shared/utils";
import type {
  ProductFilters,
  CategoryWithRelations,
  SupplierWithRelations,
} from "../../../types";

interface ActiveFiltersBarProps {
  filters: ProductFilters;
  onFilterRemove: (key: keyof ProductFilters) => void;
  onClearAll: () => void;
  categories?: CategoryWithRelations[];
  suppliers?: SupplierWithRelations[];
  className?: string;
}

export const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  onFilterRemove,
  onClearAll,
  categories = [],
  suppliers = [],
  className,
}) => {
  // 📊 Parse active filters into display items
  const activeFilters = useMemo(() => {
    const items: Array<{
      key: keyof ProductFilters;
      label: string;
      value: string;
      color: string;
    }> = [];

    // Category filters
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const categoryNames = filters.categoryIds
        .map((id) => categories.find((c) => c.id === id)?.name || id)
        .slice(0, 3)
        .join(", ");
      const extraCount =
        filters.categoryIds.length > 3
          ? ` +${filters.categoryIds.length - 3}`
          : "";
      items.push({
        key: "categoryIds",
        label: "Categorías",
        value: `${categoryNames}${extraCount}`,
        color: "blue",
      });
    } else if (filters.categoryId) {
      const category = categories.find((c) => c.id === filters.categoryId);
      items.push({
        key: "categoryId",
        label: "Categoría",
        value: category?.name || filters.categoryId,
        color: "blue",
      });
    }

    // Supplier filters
    if (filters.supplierIds && filters.supplierIds.length > 0) {
      const supplierNames = filters.supplierIds
        .map((id) => suppliers.find((s) => s.id === id)?.name || id)
        .slice(0, 3)
        .join(", ");
      const extraCount =
        filters.supplierIds.length > 3
          ? ` +${filters.supplierIds.length - 3}`
          : "";
      items.push({
        key: "supplierIds",
        label: "Proveedores",
        value: `${supplierNames}${extraCount}`,
        color: "purple",
      });
    } else if (filters.supplierId) {
      const supplier = suppliers.find((s) => s.id === filters.supplierId);
      items.push({
        key: "supplierId",
        label: "Proveedor",
        value: supplier?.name || filters.supplierId,
        color: "purple",
      });
    }

    // Stock status filters
    if (filters.stockStatuses && filters.stockStatuses.length > 0) {
      const statusLabels: Record<string, string> = {
        IN_STOCK: "En Stock",
        LOW_STOCK: "Stock Bajo",
        OUT_OF_STOCK: "Sin Stock",
        CRITICAL_STOCK: "Crítico",
      };
      const statusNames = filters.stockStatuses
        .map((s) => statusLabels[s] || s)
        .join(", ");
      items.push({
        key: "stockStatuses",
        label: "Estados",
        value: statusNames,
        color: "orange",
      });
    } else if (filters.stockStatus) {
      const statusLabels: Record<string, string> = {
        IN_STOCK: "En Stock",
        LOW_STOCK: "Stock Bajo",
        OUT_OF_STOCK: "Sin Stock",
        CRITICAL_STOCK: "Crítico",
      };
      items.push({
        key: "stockStatus",
        label: "Estado",
        value: statusLabels[filters.stockStatus] || filters.stockStatus,
        color: "orange",
      });
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const min = filters.minPrice ? `$${filters.minPrice.toFixed(2)}` : "0";
      const max = filters.maxPrice
        ? `$${filters.maxPrice.toFixed(2)}`
        : "∞";
      items.push({
        key: "minPrice",
        label: "Precio",
        value: `${min} - ${max}`,
        color: "green",
      });
    }

    // Stock range
    if (filters.minStock !== undefined || filters.maxStock !== undefined) {
      const min = filters.minStock ?? 0;
      const max = filters.maxStock ?? "∞";
      items.push({
        key: "minStock",
        label: "Stock",
        value: `${min} - ${max}`,
        color: "cyan",
      });
    }

    // Date range
    if (filters.createdAfter || filters.createdBefore) {
      const after = filters.createdAfter
        ? new Date(filters.createdAfter).toLocaleDateString()
        : "...";
      const before = filters.createdBefore
        ? new Date(filters.createdBefore).toLocaleDateString()
        : "...";
      items.push({
        key: "createdAfter",
        label: "Fecha",
        value: `${after} - ${before}`,
        color: "indigo",
      });
    }

    // Boolean filters
    if (filters.isActive !== undefined) {
      items.push({
        key: "isActive",
        label: "Estado",
        value: filters.isActive ? "Activos" : "Inactivos",
        color: filters.isActive ? "green" : "gray",
      });
    }

    if (filters.hasImages !== undefined) {
      items.push({
        key: "hasImages",
        label: "Imágenes",
        value: filters.hasImages ? "Con imágenes" : "Sin imágenes",
        color: "pink",
      });
    }

    if (filters.isOutOfStock) {
      items.push({
        key: "isOutOfStock",
        label: "Stock",
        value: "Sin stock",
        color: "red",
      });
    }

    if (filters.hasLowStock) {
      items.push({
        key: "hasLowStock",
        label: "Stock",
        value: "Stock bajo",
        color: "yellow",
      });
    }

    if (filters.hasCriticalStock) {
      items.push({
        key: "hasCriticalStock",
        label: "Stock",
        value: "Stock crítico",
        color: "orange",
      });
    }

    // Tags
    if (filters.tags && filters.tags.length > 0) {
      items.push({
        key: "tags",
        label: "Tags",
        value: filters.tags.slice(0, 3).join(", "),
        color: "violet",
      });
    }

    return items;
  }, [filters, categories, suppliers]);

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtros Activos ({activeFilters.length})
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Limpiar Todo
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              "hover:scale-[1.02] active:scale-[0.98]",
              `bg-${filter.color}-50 dark:bg-${filter.color}-900/20`,
              `text-${filter.color}-700 dark:text-${filter.color}-300`,
              `border border-${filter.color}-200 dark:border-${filter.color}-800`
            )}
          >
            <span className="font-semibold">{filter.label}:</span>
            <span className="max-w-[200px] truncate">{filter.value}</span>
            <button
              onClick={() => onFilterRemove(filter.key)}
              className={cn(
                "ml-1 p-0.5 rounded hover:bg-white/50 dark:hover:bg-black/20 transition-colors",
                `hover:text-${filter.color}-900 dark:hover:text-${filter.color}-100`
              )}
              title={`Remover filtro: ${filter.label}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFiltersBar;
