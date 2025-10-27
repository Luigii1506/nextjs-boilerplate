/**
 * 🏷️ CATEGORIES TAB COMPONENT
 * ===========================
 *
 * Tab completo para gestión de categorías con enfoque en productos
 * Vista mejorada con información relevante del inventario
 *
 * Created: 2025-01-17 - Category Management UI
 * Updated: 2025-01-18 - Enhanced design with product focus
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
  Layers,
} from "lucide-react";
import { cn } from "@/shared/utils";
import {
  TabWrapper,
  TabHeader,
  TabStatsCard,
  TabSearchBar,
  TabLoadingSkeleton,
  TabEmptyState,
  ViewModeToggle,
  FilterToggleButton,
} from "@/shared/ui/components/tabs";
import { useInventoryContext } from "../../../context";
import { useCategoriesQuery } from "../../../hooks";
import type { CategoryWithRelations } from "../../../types";

// 🎯 Category Filters Component
const CategoryFilters: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { viewMode, setViewMode, setIsCategoryModalOpen } =
    useInventoryContext();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
      {/* Top Row - Search & Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <TabSearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar categorías por nombre..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Filter Toggle */}
          <FilterToggleButton
            isOpen={isFilterOpen}
            onToggle={() => setIsFilterOpen(!isFilterOpen)}
            activeCount={showInactive ? 1 : 0}
          />

          {/* Add Category */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {isFilterOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 animate-fadeInDown">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Show Inactive */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showInactive"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="showInactive"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Mostrar inactivas
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🏷️ Enhanced Category Card Component
interface CategoryCardProps {
  category: CategoryWithRelations;
  onView: (category: CategoryWithRelations) => void;
  onEdit: (category: CategoryWithRelations) => void;
  onDelete: (category: CategoryWithRelations) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onView,
  onEdit,
  onDelete,
}) => {
  const productCount = category._count?.products || 0;
  const subcategoriesCount = category._count?.children || 0;
  const hasProducts = productCount > 0;

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200 overflow-hidden">
      {/* Color Header Bar */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: category.color || "#6B7280" }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm"
                style={{
                  backgroundColor: `${category.color || "#6B7280"}20`,
                }}
              >
                <Tags
                  className="w-5 h-5"
                  style={{ color: category.color || "#6B7280" }}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    #{category.sortOrder}
                  </span>
                  {!category.isActive && (
                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                      Inactiva
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(category)}
              className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(category)}
              className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {category.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}

        {/* Products Section - Destacado */}
        <div
          className={cn(
            "rounded-lg p-4 mb-4",
            hasProducts
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
              : "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  hasProducts
                    ? "bg-blue-100 dark:bg-blue-900/40"
                    : "bg-gray-200 dark:bg-gray-700"
                )}
              >
                <Package
                  className={cn(
                    "w-5 h-5",
                    hasProducts
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400"
                  )}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Productos
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    hasProducts
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400"
                  )}
                >
                  {productCount}
                </p>
              </div>
            </div>

            {hasProducts && (
              <button
                onClick={() => onView(category)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Ver Productos
              </button>
            )}
          </div>
        </div>

        {/* Footer Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3">
            {subcategoriesCount > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Layers className="w-4 h-4" />
                <span className="text-xs">
                  {subcategoriesCount} subcategoría
                  {subcategoriesCount !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Parent indicator */}
          {category.parent && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              <Layers className="w-3 h-3" />
              {category.parent.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 🏷️ Categories Display Component
const CategoriesDisplay: React.FC = () => {
  const {
    viewMode,
    setIsCategoryModalOpen,
    openEditCategoryModal,
    openDeleteCategoryConfirm,
    openViewCategoryModal,
  } = useInventoryContext();

  // 🌐 Fetch categories
  const { categories, isLoading, error } = useCategoriesQuery();

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

  if (isLoading) {
    return (
      <TabLoadingSkeleton
        type={viewMode === "grid" ? "grid" : "list"}
        count={6}
        className={viewMode === "grid" ? "h-64" : "h-24"}
      />
    );
  }

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
    <div
      className={cn(
        "transition-all duration-300",
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      )}
    >
      {categories.map((category, index) => (
        <div
          key={category.id}
          className="animate-fadeInScale"
          style={{
            animationDelay: `${index * 0.05}s`,
          }}
        >
          {viewMode === "grid" ? (
            <CategoryCard
              category={category}
              onView={handleViewCategory}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
            />
          ) : (
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
  );
};

// 🎯 Main Categories Tab - Memoized for Performance
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

      {/* Filters */}
      <CategoryFilters />

      {/* Categories Display */}
      <CategoriesDisplay />
    </TabWrapper>
  );
});

export default CategoriesTab;
