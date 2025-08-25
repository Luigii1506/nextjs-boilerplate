/**
 * 🏷️ CATEGORIES TAB COMPONENT
 * ===========================
 *
 * Tab completo para gestión de categorías con filtros, búsqueda y CRUD
 * Sigue el mismo patrón que ProductsTab para consistencia
 *
 * Created: 2025-01-17 - Category Management UI
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Download,
  Upload,
  Tags,
  Eye,
  Edit2,
  Trash2,
  Package,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { TabTransition } from "../shared/TabTransition";
import { useInventoryContext } from "../../../context";
import { useCategoriesQuery } from "../../../hooks";
import type { CategoryWithRelations, CategoryFilters } from "../../../types";

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorías por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
                viewMode === "grid"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              title="Vista en cuadrícula"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors duration-200 flex items-center justify-center",
                viewMode === "list"
                  ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              )}
              title="Vista en lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors",
              isFilterOpen
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300"
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>

          {/* Add Category */}
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Nueva Categoría</span>
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

// 🏷️ Category Card Component
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

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Color indicator */}
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color || "#6B7280" }}
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{category.sortOrder}
              </span>
              {!category.isActive && (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-full">
                  Inactiva
                </span>
              )}
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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {category.description}
        </p>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Package className="w-4 h-4" />
            <span>
              {productCount} producto{productCount !== 1 ? "s" : ""}
            </span>
          </div>
          {subcategoriesCount > 0 && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Tags className="w-4 h-4" />
              <span>
                {subcategoriesCount} subcategoría
                {subcategoriesCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Parent indicator */}
        {category.parent && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {category.parent.name}
          </span>
        )}
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
      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        )}
      >
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse",
              viewMode === "grid" ? "h-48" : "h-20"
            )}
            style={{
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Tags className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar categorías
        </h3>
        <p className="text-gray-500 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-12 animate-fadeInUp">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 animate-scaleIn">
          <Tags className="w-12 h-12 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 animate-slideInUp stagger-1">
          No hay categorías aún
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6 animate-fadeInScale stagger-2">
          Comienza organizando tus productos con categorías
        </p>
        <button
          onClick={() => setIsCategoryModalOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors animate-scaleIn stagger-3"
        >
          <FolderPlus className="w-5 h-5" />
          <span>Crear Primera Categoría</span>
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
      {categories.map((category, index) => (
        <div
          key={category.id}
          className="animate-fadeInScale"
          style={{
            animationDelay: `${index * 0.1}s`,
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color || "#6B7280" }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {category._count?.products || 0} productos • Orden #
                      {category.sortOrder}
                    </p>
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
  return (
    <TabTransition isActive={true} transitionType="fade" delay={50}>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeInUp stagger-1">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              🏷️ Gestión de Categorías
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Organiza y clasifica tu catálogo de productos
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="animate-slideInDown stagger-2">
          <CategoryFilters />
        </div>

        {/* Categories Display */}
        <div className="animate-fadeInScale stagger-3">
          <CategoriesDisplay />
        </div>
      </div>
    </TabTransition>
  );
});

export default CategoriesTab;
