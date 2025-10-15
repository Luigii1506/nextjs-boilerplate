/**
 * 📦 PRODUCTS TAB COMPONENT
 * =========================
 *
 * Gestión completa de productos con filtros avanzados
 * Búsqueda, paginación, modals y acciones bulk
 *
 * Created: 2025-01-17 - Inventory Products Tab
 */

"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  Edit3,
  Trash2,
  Eye,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../../context";
import { ProductCard, StockIndicator, CategoryBadge } from "..";
import { TabTransition } from "../shared/TabTransition";
import { QuickStockAdjustModal, ExportModal, ImportModal, SavePresetModal } from "../modals";
import { AdvancedFilterPanel } from "../filters/AdvancedFilterPanel";
import { ActiveFiltersBar } from "../filters/ActiveFiltersBar";
import { FilterPresetsDropdown } from "../filters/FilterPresetsDropdown";
import { BulkSelectionBar } from "../bulk/BulkSelectionBar";
import { BulkActionsModal } from "../bulk/BulkActionsModal";
import type { ProductWithRelations, BulkOperationType, FilterPreset, SavePresetInput } from "../../../types";
import type { ImportedProduct } from "../../../utils/import";
import {
  getFilterPresets,
  saveFilterPreset,
  updateFilterPreset,
  deleteFilterPreset,
  duplicateFilterPreset,
  setDefaultPreset,
  getDefaultPreset,
} from "../../../utils/filterPresets";
import {
  bulkDeleteProductsAction,
  bulkUpdateCategoryAction,
  bulkUpdateSupplierAction,
  bulkAdjustPricesAction,
  bulkActivateProductsAction,
  bulkDeactivateProductsAction,
  bulkImportProductsAction,
  type ImportProductInput,
} from "../../../actions";

// 🔍 Advanced Search & Filter Component
const ProductFilters: React.FC = () => {
  const {
    globalSearchTerm,
    setGlobalSearchTerm,
    productFilters,
    setProductFilters,
    inventory,
    viewMode,
    setViewMode,
    clearAllFilters,
    setIsProductModalOpen,
  } = useInventoryContext();

  const { categories, suppliers } = inventory;
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = useMemo(() => {
    return Object.entries(productFilters).filter(([key, value]) => {
      if (key === "search") return false; // Don't count search
      if (value === undefined || value === null) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }).length;
  }, [productFilters]);

  const handleFilterRemove = (key: keyof typeof productFilters) => {
    const newFilters = { ...productFilters };
    delete newFilters[key];
    setProductFilters(newFilters);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Primary Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos por nombre, SKU o código de barras..."
              value={globalSearchTerm}
              onChange={(e) => setGlobalSearchTerm(e.target.value)}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600",
                "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400"
              )}
            />
            {globalSearchTerm && (
              <button
                onClick={() => setGlobalSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-3 border rounded-lg flex items-center space-x-2 transition-all duration-200",
                "hover:scale-[1.02] active:scale-[0.98]",
                showFilters || activeFiltersCount > 0
                  ? "border-blue-300 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
              )}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "px-3 py-3 flex items-center transition-colors",
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "px-3 py-3 flex items-center border-l border-gray-300 dark:border-gray-600 transition-colors",
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={() => setIsProductModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFiltersCount > 0 && (
        <ActiveFiltersBar
          filters={productFilters}
          onFilterRemove={handleFilterRemove}
          onClearAll={clearAllFilters}
          categories={categories}
          suppliers={suppliers}
        />
      )}

      {/* Advanced Filter Panel */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showFilters ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {showFilters && (
          <AdvancedFilterPanel
            filters={productFilters}
            onFiltersChange={setProductFilters}
            categories={categories}
            suppliers={suppliers}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>
    </div>
  );
};

// 📦 Products Display Component
const ProductsDisplay: React.FC<{
  onQuickAdjust?: (product: ProductWithRelations) => void;
  selectedProductIds: Set<string>;
  onToggleSelection: (productId: string) => void;
  showCheckbox: boolean;
}> = ({ onQuickAdjust, selectedProductIds, onToggleSelection, showCheckbox }) => {
  const {
    inventory,
    viewMode,
    openEditModal,
    openDeleteConfirm,
    openViewModal,
    setIsProductModalOpen,
  } = useInventoryContext();
  const { products, isLoading } = inventory;

  const handleViewProduct = useCallback(
    (product: ProductWithRelations) => {
      openViewModal(product);
    },
    [openViewModal]
  );

  const handleEditProduct = useCallback(
    (product: ProductWithRelations) => {
      openEditModal(product);
    },
    [openEditModal]
  );

  const handleDeleteProduct = useCallback(
    (product: ProductWithRelations) => {
      openDeleteConfirm(product);
    },
    [openDeleteConfirm]
  );

  if (isLoading) {
    return (
      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        )}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse",
              viewMode === "grid" ? "h-80" : "h-24"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          No hay productos que coincidan con tus criterios de búsqueda. Intenta
          ajustar los filtros o agregar productos nuevos.
        </p>
        <button
          onClick={() => setIsProductModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 mx-auto transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar Primer Producto</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      )}
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          className={cn(
            "transition-all duration-200",
            viewMode === "list" &&
              "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md"
          )}
          style={{
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {viewMode === "grid" ? (
            <ProductCard
              product={product}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onQuickAdjust={onQuickAdjust}
              showCheckbox={showCheckbox}
              isSelected={selectedProductIds.has(product.id)}
              onToggleSelection={onToggleSelection}
              className="h-full hover:scale-[1.02] transition-transform duration-200"
            />
          ) : (
            // List view layout
            <div className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center space-x-4">
                {/* Checkbox for list view */}
                {showCheckbox && (
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={selectedProductIds.has(product.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelection(product.id);
                      }}
                      className={cn(
                        "w-5 h-5 rounded border-2 cursor-pointer transition-all",
                        "focus:ring-2 focus:ring-blue-500",
                        selectedProductIds.has(product.id)
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      )}
                    />
                  </div>
                )}

                <div className="flex-shrink-0">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        SKU: {product.sku}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <CategoryBadge
                          category={product.category}
                          size="sm"
                          showIcon={false}
                        />
                        <StockIndicator
                          stock={product.stock}
                          minStock={product.minStock}
                          maxStock={product.maxStock}
                          size="sm"
                          showLabel={true}
                        />
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        ${product.price.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Costo: ${product.cost.toLocaleString()}
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// 🎯 OPTIMIZED PRODUCTS TAB - Memoized for SPA Performance
const ProductsTab: React.FC = React.memo(function ProductsTab() {
  const { inventory } = useInventoryContext();
  const [stockAdjustModalOpen, setStockAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎯 Bulk operations state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<BulkOperationType | null>(null);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  // 📤 Export/Import state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // 💾 Filter Presets state
  const [filterPresets, setFilterPresets] = useState<FilterPreset[]>([]);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<FilterPreset | null>(null);
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>();

  // Load presets on mount
  useState(() => {
    setFilterPresets(getFilterPresets());
  });

  const handleOpenStockAdjust = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setStockAdjustModalOpen(true);
  };

  const handleCloseStockAdjust = () => {
    setStockAdjustModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSubmitStockAdjust = async (data: {
    productId: string;
    type: "IN" | "OUT" | "ADJUSTMENT";
    quantity: number;
    reason: string;
  }) => {
    try {
      setIsSubmitting(true);

      // Use the mutation from inventory hook - this will invalidate all caches including stock movements
      const result = await inventory.addStockMovement({
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
      });

      if (!result.success) {
        throw new Error(result.error || "Error al ajustar stock");
      }

      // The mutation already refetches and shows notification
      handleCloseStockAdjust();
    } catch (error) {
      console.error("Error ajustando stock:", error);
      alert(error instanceof Error ? error.message : "Error al ajustar stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🎯 Bulk operations handlers
  const handleToggleSelection = useCallback((productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = new Set<string>(inventory.products.map((p) => p.id));
    setSelectedProductIds(allIds);
  }, [inventory.products]);

  const handleDeselectAll = useCallback(() => {
    setSelectedProductIds(new Set());
  }, []);

  const handleBulkDelete = () => {
    setBulkOperation("delete");
    setShowBulkActions(true);
  };

  const handleBulkUpdateCategory = () => {
    setBulkOperation("updateCategory");
    setShowBulkActions(true);
  };

  const handleBulkUpdateSupplier = () => {
    setBulkOperation("updateSupplier");
    setShowBulkActions(true);
  };

  const handleBulkUpdatePrice = () => {
    setBulkOperation("updatePrice");
    setShowBulkActions(true);
  };

  const handleBulkActivate = () => {
    setBulkOperation("activate");
    setShowBulkActions(true);
  };

  const handleBulkDeactivate = () => {
    setBulkOperation("deactivate");
    setShowBulkActions(true);
  };

  const handleBulkExecute = async (operationData: {
    categoryId?: string;
    supplierId?: string;
    priceAdjustment?: {
      type: "percentage" | "fixed";
      value: number;
      operation: "increase" | "decrease";
    };
  }) => {
    if (!bulkOperation) return;

    try {
      setIsBulkLoading(true);
      const productIds = Array.from(selectedProductIds);
      let result;

      switch (bulkOperation) {
        case "delete":
          result = await bulkDeleteProductsAction(productIds);
          break;
        case "updateCategory":
          if (!operationData.categoryId) {
            throw new Error("Debe seleccionar una categoría");
          }
          result = await bulkUpdateCategoryAction(productIds, operationData.categoryId);
          break;
        case "updateSupplier":
          if (!operationData.supplierId) {
            throw new Error("Debe seleccionar un proveedor");
          }
          result = await bulkUpdateSupplierAction(productIds, operationData.supplierId);
          break;
        case "updatePrice":
          if (!operationData.priceAdjustment) {
            throw new Error("Debe especificar el ajuste de precio");
          }
          result = await bulkAdjustPricesAction(productIds, operationData.priceAdjustment);
          break;
        case "activate":
          result = await bulkActivateProductsAction(productIds);
          break;
        case "deactivate":
          result = await bulkDeactivateProductsAction(productIds);
          break;
        default:
          throw new Error("Operación no válida");
      }

      if (!result.success) {
        throw new Error(result.error || "Error al ejecutar operación");
      }

      // Refetch inventory data
      await inventory.refetch();

      // Clear selection and close modal
      setSelectedProductIds(new Set());
      setShowBulkActions(false);
      setBulkOperation(null);

      alert(
        `Operación completada: ${result.data?.successCount || 0} productos actualizados`
      );
    } catch (error) {
      console.error("Error en operación bulk:", error);
      alert(error instanceof Error ? error.message : "Error al ejecutar operación");
    } finally {
      setIsBulkLoading(false);
    }
  };

  // 📥 Import handler
  const handleImport = async (products: ImportedProduct[]) => {
    try {
      const importData: ImportProductInput[] = products.map((p) => ({
        sku: p.sku,
        name: p.name,
        description: p.description,
        categoryName: p.categoryName,
        supplierName: p.supplierName,
        price: p.price,
        cost: p.cost,
        stock: p.stock,
        minStock: p.minStock,
        maxStock: p.maxStock,
        unit: p.unit,
        barcode: p.barcode,
        location: p.location,
        weight: p.weight,
        isActive: p.isActive,
      }));

      const result = await bulkImportProductsAction(importData);

      if (!result.success) {
        throw new Error(result.error || "Error al importar productos");
      }

      // Refetch inventory
      await inventory.refetch();

      if (result.data && result.data.errors.length > 0) {
        alert(
          `Importación completada con advertencias:\n` +
            `✓ ${result.data.successCount} productos importados\n` +
            `✗ ${result.data.failedCount} productos con errores\n\n` +
            `Errores:\n${result.data.errors
              .slice(0, 5)
              .map((e) => `- ${e.sku}: ${e.error}`)
              .join("\n")}` +
            (result.data.errors.length > 5
              ? `\n... y ${result.data.errors.length - 5} más`
              : "")
        );
      } else {
        alert(`✓ ${result.data?.successCount || 0} productos importados correctamente`);
      }
    } catch (error) {
      console.error("Error importing products:", error);
      throw error;
    }
  };

  // 💾 Preset handlers
  const {productFilters, setProductFilters} = useInventoryContext();

  const handleSavePreset = (input: SavePresetInput) => {
    const preset = saveFilterPreset(input);
    setFilterPresets(getFilterPresets());
    setCurrentPresetId(preset.id);
  };

  const handleSelectPreset = (preset: FilterPreset) => {
    setProductFilters(preset.filters);
    setCurrentPresetId(preset.id);
  };

  const handleEditPreset = (preset: FilterPreset) => {
    setEditingPreset(preset);
    setShowSavePresetModal(true);
  };

  const handleDeletePreset = (presetId: string) => {
    deleteFilterPreset(presetId);
    setFilterPresets(getFilterPresets());
    if (currentPresetId === presetId) {
      setCurrentPresetId(undefined);
    }
  };

  const handleDuplicatePreset = (presetId: string) => {
    const duplicate = duplicateFilterPreset(presetId);
    if (duplicate) {
      setFilterPresets(getFilterPresets());
    }
  };

  const handleSetDefaultPreset = (presetId: string) => {
    setDefaultPreset(presetId);
    setFilterPresets(getFilterPresets());
  };

  return (
    <TabTransition isActive={true} transitionType="fade" delay={50}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInUp stagger-1">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Gestión de Productos
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Administra tu catálogo y ajusta stock directamente
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Filter Presets Dropdown */}
            <FilterPresetsDropdown
              presets={filterPresets}
              onSelectPreset={handleSelectPreset}
              onEditPreset={handleEditPreset}
              onDeletePreset={handleDeletePreset}
              onDuplicatePreset={handleDuplicatePreset}
              onSetDefault={handleSetDefaultPreset}
              currentPresetId={currentPresetId}
            />

            {/* Save Current Filters as Preset */}
            <button
              onClick={() => {
                setEditingPreset(null);
                setShowSavePresetModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Guardar filtros actuales como preset"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Preset</span>
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="animate-slideInDown stagger-2">
          <ProductFilters />
        </div>

        {/* Products Display */}
        <div className="animate-fadeInScale stagger-3">
          <ProductsDisplay
            onQuickAdjust={handleOpenStockAdjust}
            selectedProductIds={selectedProductIds}
            onToggleSelection={handleToggleSelection}
            showCheckbox={true}
          />
        </div>

        {/* Stock Adjustment Modal */}
        <QuickStockAdjustModal
          product={selectedProduct}
          isOpen={stockAdjustModalOpen}
          onClose={handleCloseStockAdjust}
          onSubmit={handleSubmitStockAdjust}
          isLoading={isSubmitting}
        />

        {/* Bulk Selection Bar */}
        <BulkSelectionBar
          selectedCount={selectedProductIds.size}
          totalCount={inventory.products.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onDelete={handleBulkDelete}
          onUpdateCategory={handleBulkUpdateCategory}
          onUpdateSupplier={handleBulkUpdateSupplier}
          onUpdatePrice={handleBulkUpdatePrice}
          onActivate={handleBulkActivate}
          onDeactivate={handleBulkDeactivate}
        />

        {/* Bulk Actions Modal */}
        <BulkActionsModal
          isOpen={showBulkActions}
          onClose={() => {
            setShowBulkActions(false);
            setBulkOperation(null);
          }}
          selectedCount={selectedProductIds.size}
          operationType={bulkOperation}
          categories={inventory.categories}
          suppliers={inventory.suppliers}
          onExecute={handleBulkExecute}
          isLoading={isBulkLoading}
        />

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          products={inventory.products}
        />

        {/* Import Modal */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />

        {/* Save Preset Modal */}
        <SavePresetModal
          isOpen={showSavePresetModal}
          onClose={() => {
            setShowSavePresetModal(false);
            setEditingPreset(null);
          }}
          onSave={handleSavePreset}
          currentFilters={productFilters}
          editingPreset={
            editingPreset
              ? {
                  id: editingPreset.id,
                  name: editingPreset.name,
                  description: editingPreset.description,
                  color: editingPreset.color,
                }
              : undefined
          }
        />
      </div>
    </TabTransition>
  );
});

export default ProductsTab;
