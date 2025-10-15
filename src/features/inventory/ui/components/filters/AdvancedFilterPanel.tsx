/**
 * 🔍 ADVANCED FILTER PANEL COMPONENT
 * ==================================
 *
 * Comprehensive filter panel for products with:
 * - Multi-select categories & suppliers
 * - Range filters (price, stock, cost)
 * - Date range filters
 * - Quick filter presets
 * - Collapsible sections
 * - Active filter badges
 * - Dark mode support
 *
 * Created: 2025-01-19 - Advanced Product Filtering
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  X,
  DollarSign,
  Package,
  Calendar,
  Tag,
  Zap,
  AlertTriangle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Image,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { cn } from "@/shared/utils";
import type {
  ProductFilters,
  CategoryWithRelations,
  SupplierWithRelations,
  StockStatus,
} from "../../../types";

// 🎯 Component Props
interface AdvancedFilterPanelProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  categories: CategoryWithRelations[];
  suppliers: SupplierWithRelations[];
  onClose?: () => void;
}

// 🎨 Filter Preset Type
interface FilterPreset {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  filters: Partial<ProductFilters>;
  color: string;
}

// 📋 Predefined Filter Presets
const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "out-of-stock",
    label: "Sin Stock",
    icon: <XCircle className="w-4 h-4" />,
    description: "Productos sin existencias",
    filters: { isOutOfStock: true },
    color: "red",
  },
  {
    id: "low-stock",
    label: "Stock Bajo",
    icon: <AlertTriangle className="w-4 h-4" />,
    description: "Productos con stock bajo",
    filters: { hasLowStock: true },
    color: "yellow",
  },
  {
    id: "critical-stock",
    label: "Stock Crítico",
    icon: <AlertCircle className="w-4 h-4" />,
    description: "Productos con stock crítico",
    filters: { hasCriticalStock: true },
    color: "orange",
  },
  {
    id: "high-value",
    label: "Alto Valor",
    icon: <TrendingUp className="w-4 h-4" />,
    description: "Productos con precio > $1000",
    filters: { minPrice: 1000 },
    color: "green",
  },
  {
    id: "no-images",
    label: "Sin Imágenes",
    icon: <Image className="w-4 h-4" />,
    description: "Productos sin imágenes",
    filters: { hasImages: false },
    color: "gray",
  },
  {
    id: "active",
    label: "Activos",
    icon: <CheckCircle2 className="w-4 h-4" />,
    description: "Solo productos activos",
    filters: { isActive: true },
    color: "blue",
  },
];

// 🎨 Stock Status Options
const STOCK_STATUS_OPTIONS: Array<{
  value: StockStatus;
  label: string;
  color: string;
}> = [
  { value: "IN_STOCK", label: "En Stock", color: "green" },
  { value: "LOW_STOCK", label: "Stock Bajo", color: "yellow" },
  { value: "OUT_OF_STOCK", label: "Sin Stock", color: "red" },
  { value: "CRITICAL_STOCK", label: "Crítico", color: "orange" },
];

/**
 * 🔍 AdvancedFilterPanel Component
 */
export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  categories,
  suppliers,
  onClose,
}) => {
  // 🎛️ Section collapse state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["presets", "categories", "stock"])
  );

  // 🔄 Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // 📊 Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === "search") return false; // Don't count search in filters
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }, [filters]);

  // 🧹 Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // 🎯 Apply preset
  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange({ ...filters, ...preset.filters });
  };

  // 🔄 Update filter value
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // 🗑️ Remove specific filter
  const removeFilter = (key: keyof ProductFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  // 🎨 Toggle array filter value
  const toggleArrayFilter = (
    key: keyof ProductFilters,
    value: string | StockStatus
  ) => {
    const currentArray = (filters[key] as any[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value];
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Filter className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros Avanzados
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeFiltersCount > 0
                  ? `${activeFiltersCount} filtro${activeFiltersCount > 1 ? "s" : ""} activo${activeFiltersCount > 1 ? "s" : ""}`
                  : "Ningún filtro aplicado"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Limpiar Todo
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="max-h-[70vh] overflow-y-auto">
        {/* Quick Presets */}
        <FilterSection
          id="presets"
          title="Filtros Rápidos"
          icon={<Zap className="w-4 h-4" />}
          expanded={expandedSections.has("presets")}
          onToggle={() => toggleSection("presets")}
        >
          <div className="grid grid-cols-2 gap-2">
            {FILTER_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  `hover:border-${preset.color}-300 dark:hover:border-${preset.color}-600`,
                  "border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-gray-900"
                )}
                title={preset.description}
              >
                <div
                  className={cn(
                    "p-1.5 rounded",
                    `bg-${preset.color}-100 dark:bg-${preset.color}-900/20`,
                    `text-${preset.color}-600 dark:text-${preset.color}-400`
                  )}
                >
                  {preset.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Categories Filter */}
        <FilterSection
          id="categories"
          title="Categorías"
          icon={<Tag className="w-4 h-4" />}
          expanded={expandedSections.has("categories")}
          onToggle={() => toggleSection("categories")}
          badge={filters.categoryIds?.length}
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No hay categorías disponibles
              </p>
            ) : (
              categories.map((category) => {
                const isSelected = filters.categoryIds?.includes(category.id);
                return (
                  <label
                    key={category.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      isSelected &&
                        "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleArrayFilter("categoryIds", category.id)
                      }
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1 flex items-center gap-2">
                      {category.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </span>
                    </div>
                    {category._count?.products !== undefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {category._count.products}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </FilterSection>

        {/* Suppliers Filter */}
        <FilterSection
          id="suppliers"
          title="Proveedores"
          icon={<Package className="w-4 h-4" />}
          expanded={expandedSections.has("suppliers")}
          onToggle={() => toggleSection("suppliers")}
          badge={filters.supplierIds?.length}
        >
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {suppliers.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No hay proveedores disponibles
              </p>
            ) : (
              suppliers.map((supplier) => {
                const isSelected = filters.supplierIds?.includes(supplier.id);
                return (
                  <label
                    key={supplier.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                      "hover:bg-gray-50 dark:hover:bg-gray-800",
                      isSelected &&
                        "bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleArrayFilter("supplierIds", supplier.id)
                      }
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {supplier.name}
                    </span>
                    {supplier._count?.products !== undefined && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {supplier._count.products}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </FilterSection>

        {/* Stock Status Filter */}
        <FilterSection
          id="stock"
          title="Estado de Stock"
          icon={<Package className="w-4 h-4" />}
          expanded={expandedSections.has("stock")}
          onToggle={() => toggleSection("stock")}
          badge={filters.stockStatuses?.length}
        >
          <div className="grid grid-cols-2 gap-2">
            {STOCK_STATUS_OPTIONS.map((option) => {
              const isSelected = filters.stockStatuses?.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter("stockStatuses", option.value)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  )}
                >
                  <div
                    className={cn(
                      "w-3 h-3 rounded-full",
                      `bg-${option.color}-500`
                    )}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {option.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 ml-auto text-current" />
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection
          id="price"
          title="Rango de Precio"
          icon={<DollarSign className="w-4 h-4" />}
          expanded={expandedSections.has("price")}
          onToggle={() => toggleSection("price")}
          badge={
            (filters.minPrice !== undefined || filters.maxPrice !== undefined)
              ? 1
              : undefined
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Mínimo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.minPrice ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "minPrice",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="$0.00"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio Máximo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.maxPrice ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "maxPrice",
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                placeholder="$999,999.99"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </FilterSection>

        {/* Stock Range Filter */}
        <FilterSection
          id="stockRange"
          title="Rango de Stock"
          icon={<Package className="w-4 h-4" />}
          expanded={expandedSections.has("stockRange")}
          onToggle={() => toggleSection("stockRange")}
          badge={
            (filters.minStock !== undefined || filters.maxStock !== undefined)
              ? 1
              : undefined
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                min="0"
                value={filters.minStock ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "minStock",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Máximo
              </label>
              <input
                type="number"
                min="0"
                value={filters.maxStock ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "maxStock",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                placeholder="999,999"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </FilterSection>

        {/* Date Range Filter */}
        <FilterSection
          id="dates"
          title="Rango de Fechas"
          icon={<Calendar className="w-4 h-4" />}
          expanded={expandedSections.has("dates")}
          onToggle={() => toggleSection("dates")}
          badge={
            (filters.createdAfter !== undefined ||
              filters.createdBefore !== undefined)
              ? 1
              : undefined
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creado Después De
              </label>
              <input
                type="date"
                value={
                  filters.createdAfter
                    ? new Date(filters.createdAfter)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateFilter(
                    "createdAfter",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Creado Antes De
              </label>
              <input
                type="date"
                value={
                  filters.createdBefore
                    ? new Date(filters.createdBefore)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateFilter(
                    "createdBefore",
                    e.target.value ? new Date(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer with Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (
                key === "search" ||
                value === undefined ||
                value === null ||
                (Array.isArray(value) && value.length === 0)
              ) {
                return null;
              }

              let label = key;
              let displayValue = String(value);

              // Custom labels
              if (key === "categoryIds" && Array.isArray(value)) {
                label = "Categorías";
                displayValue = `${value.length} seleccionada${value.length > 1 ? "s" : ""}`;
              } else if (key === "supplierIds" && Array.isArray(value)) {
                label = "Proveedores";
                displayValue = `${value.length} seleccionado${value.length > 1 ? "s" : ""}`;
              } else if (key === "stockStatuses" && Array.isArray(value)) {
                label = "Estados";
                displayValue = `${value.length} seleccionado${value.length > 1 ? "s" : ""}`;
              }

              return (
                <div
                  key={key}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm"
                >
                  <span className="font-medium">{label}:</span>
                  <span>{displayValue}</span>
                  <button
                    onClick={() => removeFilter(key as keyof ProductFilters)}
                    className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 📦 FilterSection Component - Collapsible section wrapper
 */
interface FilterSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  badge?: number;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  expanded,
  onToggle,
  badge,
  children,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded">
            {icon}
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500 text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Section Content */}
      {expanded && <div className="px-6 pb-4">{children}</div>}
    </div>
  );
};

export default AdvancedFilterPanel;
