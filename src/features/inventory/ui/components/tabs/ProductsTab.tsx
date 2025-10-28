/**
 * 📦 PRODUCTS TAB COMPONENT
 * =========================
 *
 * Clean tab for product management with extracted components
 * Orchestrates product display, filtering, and CRUD operations
 *
 * ARCHITECTURE:
 * - Uses TabHeader component for consistent header
 * - Uses extracted ProductFilters component for search and filters
 * - Uses extracted ProductListItem component for list view
 * - Uses ProductCard component for grid view
 * - Handles bulk operations and import/export
 * - BulkSelectionBar positioned outside TabWrapper for proper layout
 *
 * Created: 2025-01-17
 * Last Updated: 2025-01-27
 */

"use client";

import React, { useState, useCallback } from "react";
import { Package, Plus, Download, Upload, Save } from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../../context";
import { ProductCard } from "..";
import { ProductFilters, ProductListItem } from "../products";
import {
  TabWrapper,
  TabHeader,
  TabEmptyState,
  TabLoadingSkeleton,
} from "@/shared/ui/components/tabs";
import {
  QuickStockAdjustModal,
  ExportModal,
  ImportModal,
  SavePresetModal,
} from "../modals";
import { FilterPresetsDropdown } from "../filters/FilterPresetsDropdown";
import { BulkSelectionBar } from "../bulk/BulkSelectionBar";
import { BulkActionsModal } from "../bulk/BulkActionsModal";
import type {
  ProductWithRelations,
  BulkOperationType,
  FilterPreset,
  SavePresetInput,
} from "../../../types";
import type { ImportedProduct } from "../../../utils/import";
import {
  getFilterPresets,
  saveFilterPreset,
  deleteFilterPreset,
  duplicateFilterPreset,
  setDefaultPreset,
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

/**
 * 📦 Products Display Component
 *
 * Handles the rendering of products in grid or list view
 * Manages loading and empty states
 */
const ProductsDisplay: React.FC<{
  onQuickAdjust?: (product: ProductWithRelations) => void;
  selectedProductIds: Set<string>;
  onToggleSelection: (productId: string) => void;
  showCheckbox: boolean;
}> = ({
  onQuickAdjust,
  selectedProductIds,
  onToggleSelection,
  showCheckbox,
}) => {
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
      <TabLoadingSkeleton
        type={viewMode === "grid" ? "grid" : "list"}
        count={8}
      />
    );
  }

  if (products.length === 0) {
    return (
      <TabEmptyState
        icon={<Package className="w-20 h-20" />}
        title="No se encontraron productos"
        description="No hay productos que coincidan con tus criterios de búsqueda. Intenta ajustar los filtros o agregar productos nuevos."
        action={{
          label: "Agregar Primer Producto",
          onClick: () => setIsProductModalOpen(true),
          icon: <Plus className="w-5 h-5" />,
        }}
      />
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
            // 🔥 Extracted ProductListItem component
            <ProductListItem
              product={product}
              onView={handleViewProduct}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              showCheckbox={showCheckbox}
              isSelected={selectedProductIds.has(product.id)}
              onToggleSelection={onToggleSelection}
            />
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * 🎯 OPTIMIZED PRODUCTS TAB - Memoized for SPA Performance
 */
const ProductsTab: React.FC = React.memo(function ProductsTab() {
  const {
    inventory,
    globalSearchTerm,
    setGlobalSearchTerm,
    productFilters,
    setProductFilters,
    clearAllFilters,
    viewMode,
    setViewMode,
    setIsProductModalOpen,
  } = useInventoryContext();

  const [stockAdjustModalOpen, setStockAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎯 Bulk operations state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    new Set()
  );
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<
    BulkOperationType | undefined
  >(undefined);
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
          result = await bulkUpdateCategoryAction(
            productIds,
            operationData.categoryId
          );
          break;
        case "updateSupplier":
          if (!operationData.supplierId) {
            throw new Error("Debe seleccionar un proveedor");
          }
          result = await bulkUpdateSupplierAction(
            productIds,
            operationData.supplierId
          );
          break;
        case "updatePrice":
          if (!operationData.priceAdjustment) {
            throw new Error("Debe especificar el ajuste de precio");
          }
          result = await bulkAdjustPricesAction(
            productIds,
            operationData.priceAdjustment
          );
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
      setBulkOperation(undefined);

      alert(
        `Operación completada: ${
          result.data?.successCount || 0
        } productos actualizados`
      );
    } catch (error) {
      console.error("Error en operación bulk:", error);
      alert(
        error instanceof Error ? error.message : "Error al ejecutar operación"
      );
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
        alert(
          `✓ ${
            result.data?.successCount || 0
          } productos importados correctamente`
        );
      }
    } catch (error) {
      console.error("Error importing products:", error);
      throw error;
    }
  };

  // 💾 Preset handlers
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
    <>
      <TabWrapper spacing="space-y-6">
        {/* 🔥 Using TabHeader component */}
        <TabHeader
          icon={
            <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          }
          title="Gestión de Productos"
          description="Administra tu catálogo y ajusta stock directamente"
          customActions={
            <FilterPresetsDropdown
              presets={filterPresets}
              onSelectPreset={handleSelectPreset}
              onEditPreset={handleEditPreset}
              onDeletePreset={handleDeletePreset}
              onDuplicatePreset={handleDuplicatePreset}
              onSetDefault={handleSetDefaultPreset}
              currentPresetId={currentPresetId}
            />
          }
          actions={[
            {
              label: "Guardar Preset",
              icon: <Save className="w-4 h-4" />,
              onClick: () => {
                setEditingPreset(null);
                setShowSavePresetModal(true);
              },
              variant: "secondary",
            },
            {
              label: "Exportar",
              icon: <Download className="w-4 h-4" />,
              onClick: () => setShowExportModal(true),
              variant: "secondary",
            },
            {
              label: "Importar",
              icon: <Upload className="w-4 h-4" />,
              onClick: () => setShowImportModal(true),
              variant: "secondary",
            },
          ]}
        />

        {/* 🔥 Extracted ProductFilters component */}
        <ProductFilters
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
          filters={productFilters}
          onFiltersChange={setProductFilters}
          onClearAllFilters={clearAllFilters}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddProduct={() => setIsProductModalOpen(true)}
          categories={inventory.categories}
          suppliers={inventory.suppliers}
        />

        {/* Products Display */}
        <ProductsDisplay
          onQuickAdjust={handleOpenStockAdjust}
          selectedProductIds={selectedProductIds}
          onToggleSelection={handleToggleSelection}
          showCheckbox={true}
        />

        {/* Stock Adjustment Modal */}
        <QuickStockAdjustModal
          product={selectedProduct}
          isOpen={stockAdjustModalOpen}
          onClose={handleCloseStockAdjust}
          onSubmit={handleSubmitStockAdjust}
          isLoading={isSubmitting}
        />

        {/* Bulk Actions Modal */}
        <BulkActionsModal
          isOpen={showBulkActions}
          onClose={() => {
            setShowBulkActions(false);
            setBulkOperation(undefined);
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
          editingPreset={editingPreset || undefined}
        />
      </TabWrapper>

      {/* Bulk Selection Bar - Fixed position, outside TabWrapper */}
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
        onMoreActions={() => {}}
      />
    </>
  );
});

export default ProductsTab;
