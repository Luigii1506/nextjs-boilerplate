/**
 * 🏷️ CATEGORIES TAB COMPONENT
 * ===========================
 *
 * Clean tab for category management with extracted components
 * Orchestrates category display, filtering, and CRUD operations
 *
 * ARCHITECTURE:
 * - Uses useCategoryFilters hook for filtering logic
 * - Uses extracted CategoryCard and CategoryFilters components
 * - Uses shared tab components (TabWrapper, TabHeader, etc.)
 *
 * REFACTORED: 2025-01-27
 * - Reduced from 538 lines to ~200 lines (63% reduction)
 * - Extracted CategoryCard component (167 lines)
 * - Extracted CategoryFilters component (72 lines)
 * - Uses useCategoryFilters hook for state management
 *
 * Created: 2025-01-17 - Category Management UI
 * Updated: 2025-01-27 - Architecture refactor for maintainability
 */

"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
  Tags,
  Eye,
  Edit2,
  Trash2,
  Package,
  FolderPlus,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  TabWrapper,
  TabHeader,
  TabStatsCard,
  TabLoadingSkeleton,
  TabEmptyState,
} from "@/shared/ui/components/tabs";
import { useInventoryContext } from "../../../context";
import { useCategoriesQuery, useCategoryFilters } from "../../../hooks";
import { CategoryCard, CategoryFilters } from "../categories";
import type { CategoryWithRelations } from "../../../types";

/**
 * 🏷️ Categories Display Component
 *
 * Handles the rendering of categories in grid or list view
 * Manages loading, error, and empty states
 */
const CategoriesDisplay: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setIsCategoryModalOpen,
    openEditCategoryModal,
    openDeleteCategoryConfirm,
    openViewCategoryModal,
  } = useInventoryContext();

  // 🌐 Fetch categories
  const { categories, isLoading, error } = useCategoriesQuery();

  // 🔥 Use category filters hook
  const {
    filteredCategories,
    searchTerm,
    setSearchTerm,
    showInactive,
    setShowInactive,
  } = useCategoryFilters(categories || []);

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Action handlers
  const handleViewCategory = useCallback(
    (category: CategoryWithRelations) => {
      openViewCategoryModal(category);
    },
    [openViewCategoryModal]
  );

  const handleEditCategory = useCallback(
    (category: CategoryWithRelations) => {
      openEditCategoryModal(category);
    },
    [openEditCategoryModal]
  );

  const handleDeleteCategory = useCallback(
    (category: CategoryWithRelations) => {
      openDeleteCategoryConfirm(category);
    },
    [openDeleteCategoryConfirm]
  );

  // Loading state
  if (isLoading) {
    return (
      <>
        {/* 🔥 Extracted CategoryFilters component */}
        <CategoryFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showInactive={showInactive}
          onShowInactiveChange={setShowInactive}
          isFilterOpen={isFilterOpen}
          onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddCategory={() => setIsCategoryModalOpen(true)}
        />
        <TabLoadingSkeleton
          type={viewMode === "grid" ? "grid" : "list"}
          count={6}
          className={viewMode === "grid" ? "h-64" : "h-24"}
        />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
        <Tags className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar categorías
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {error.message || "Error desconocido"}
        </p>
      </div>
    );
  }

  // Empty state
  if (!categories || categories.length === 0) {
    return (
      <TabEmptyState
        icon={<Tags className="w-20 h-20" />}
        title="No hay categorías aún"
        description="Comienza organizando tus productos creando categorías para clasificarlos"
        action={{
          label: "Crear Primera Categoría",
          onClick: () => setIsCategoryModalOpen(true),
          icon: <FolderPlus className="w-5 h-5" />,
        }}
      />
    );
  }

  return (
    <>
      {/* 🔥 Extracted CategoryFilters component */}
      <CategoryFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showInactive={showInactive}
        onShowInactiveChange={setShowInactive}
        isFilterOpen={isFilterOpen}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* Categories Grid/List */}
      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        )}
      >
        {filteredCategories.map((category, index) => (
          <div
            key={category.id}
            className="animate-fadeInScale"
            style={{
              animationDelay: `${index * 0.05}s`,
            }}
          >
            {viewMode === "grid" ? (
              // 🔥 Extracted CategoryCard component
              <CategoryCard
                category={category}
                onView={handleViewCategory}
                onEdit={handleEditCategory}
                onDelete={handleDeleteCategory}
              />
            ) : (
              // List View - Keep inline as it's specific and short
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 group overflow-hidden">
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: category.color || "#6B7280" }}
                />
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                      style={{
                        backgroundColor: `${category.color || "#6B7280"}20`,
                      }}
                    >
                      <Tags
                        className="w-6 h-6"
                        style={{ color: category.color || "#6B7280" }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {category._count?.products || 0} productos
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Orden #{category.sortOrder}
                        </span>
                        {!category.isActive && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-full">
                            Inactiva
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewCategory(category)}
                      className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="p-2 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

/**
 * 🎯 Main Categories Tab
 *
 * Orchestrates category management with stats and display
 */
const CategoriesTab: React.FC = React.memo(function CategoriesTab() {
  const { categories = [] } = useCategoriesQuery();

  // Calculate stats
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const activeCategories = categories.filter((c) => c.isActive).length;
    const totalProducts = categories.reduce(
      (sum, c) => sum + (c._count?.products || 0),
      0
    );
    const categoriesWithProducts = categories.filter(
      (c) => (c._count?.products || 0) > 0
    ).length;

    return {
      totalCategories,
      activeCategories,
      totalProducts,
      categoriesWithProducts,
    };
  }, [categories]);

  return (
    <TabWrapper spacing="space-y-6">
      {/* Header */}
      <TabHeader
        icon={<Tags className="w-8 h-8 text-purple-600 dark:text-purple-400" />}
        title="Gestión de Categorías"
        description="Organiza y clasifica tu catálogo de productos"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TabStatsCard
          title="Total Categorías"
          value={stats.totalCategories}
          icon={Tags}
          color="purple"
          description="Categorías en el sistema"
        />

        <TabStatsCard
          title="Categorías Activas"
          value={stats.activeCategories}
          icon={TrendingUp}
          color="green"
          description="Categorías habilitadas"
        />

        <TabStatsCard
          title="Total Productos"
          value={stats.totalProducts}
          icon={ShoppingBag}
          color="blue"
          description="Productos en el inventario"
        />

        <TabStatsCard
          title="Con Productos"
          value={stats.categoriesWithProducts}
          icon={Package}
          color="orange"
          description="Categorías con productos asignados"
        />
      </div>

      {/* Categories Display with Filters */}
      <CategoriesDisplay />
    </TabWrapper>
  );
});

export default CategoriesTab;
