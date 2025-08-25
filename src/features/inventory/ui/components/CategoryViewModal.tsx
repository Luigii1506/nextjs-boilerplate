/**
 * 👁️ CATEGORY VIEW MODAL COMPONENT
 * ================================
 *
 * Modal completo para visualizar todos los detalles de una categoría
 * Diseño hermoso con dark mode, animaciones suaves y layout responsive
 *
 * Created: 2025-01-18 - Category View Functionality
 */

"use client";

import React, { useMemo } from "react";
import {
  X,
  Layers3,
  Tag,
  Package,
  Hash,
  ArrowDown,
  ArrowUp,
  Clock,
  Eye,
  EyeOff,
  TreeDeciduous,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import type { CategoryWithRelations } from "../../types";

// 🧮 Utility function to compute enhanced category properties
function computeCategoryProps(category: CategoryWithRelations) {
  const hasProducts = (category._count?.products || 0) > 0;
  const hasChildren = (category._count?.children || 0) > 0;
  const totalProducts = category._count?.products || 0;
  const totalChildren = category._count?.children || 0;

  // Determine category hierarchy depth
  const hierarchyDepth = category.parent ? 1 : 0; // Simple depth check (could be enhanced)

  return {
    hasProducts,
    hasChildren,
    totalProducts,
    totalChildren,
    hierarchyDepth,
    isEmpty: !hasProducts && !hasChildren,
  };
}

/**
 * 🎯 CategoryViewModal Component
 */
const CategoryViewModal: React.FC = () => {
  const { viewingCategory, isCategoryViewModalOpen, closeViewCategoryModal } =
    useInventoryContext();

  // 🧮 Computed properties
  const categoryData = useMemo(() => {
    if (!viewingCategory) return null;
    return {
      ...viewingCategory,
      computed: computeCategoryProps(viewingCategory),
    };
  }, [viewingCategory]);

  // 🎯 Close handler
  const handleClose = () => {
    closeViewCategoryModal();
  };

  // 🛡️ Early returns
  if (!isCategoryViewModalOpen || !categoryData) {
    return null;
  }

  const { computed } = categoryData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300 animate-fadeIn"
        onClick={handleClose}
      />

      {/* 📦 Modal Container */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div
          className={cn(
            "relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl",
            "transform transition-all duration-300 animate-slideInUp sm:animate-scaleIn",
            "max-h-[90vh] flex flex-col overflow-hidden"
          )}
        >
          {/* 🏷️ Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {categoryData.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detalles de la categoría
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 📋 Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain scrollbar-thin">
            <div className="p-6 space-y-8">
              {/* 📊 Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Products Count */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Productos
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {computed.totalProducts}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Children Count */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                      <TreeDeciduous className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Subcategorías
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {computed.totalChildren}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sort Order */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                      <Hash className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Orden
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        #{categoryData.sortOrder}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div
                  className={cn(
                    "rounded-xl p-4 border",
                    categoryData.isActive
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800"
                      : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-100 dark:border-red-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        categoryData.isActive
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-red-100 dark:bg-red-900/40"
                      )}
                    >
                      {categoryData.isActive ? (
                        <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estado
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {categoryData.isActive ? "Activa" : "Inactiva"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 📋 Basic Information */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-500" />
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {categoryData.name}
                      </p>
                    </div>

                    {categoryData.description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Descripción
                        </label>
                        <p className="text-gray-600 dark:text-gray-400">
                          {categoryData.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Color Display */}
                    {categoryData.color && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Color
                        </label>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg border-2 border-white dark:border-gray-700 shadow-sm"
                            style={{ backgroundColor: categoryData.color }}
                          />
                          <span className="text-gray-600 dark:text-gray-400 font-mono">
                            {categoryData.color}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Icon Display */}
                    {categoryData.icon && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Icono
                        </label>
                        <p className="text-gray-600 dark:text-gray-400 font-mono">
                          {categoryData.icon}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🌳 Hierarchy */}
              {(categoryData.parent || computed.hasChildren) && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <TreeDeciduous className="w-5 h-5 text-green-500" />
                    Jerarquía
                  </h3>

                  <div className="space-y-4">
                    {/* Parent Category */}
                    {categoryData.parent && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <ArrowUp className="w-4 h-4" />
                          Categoría padre:
                        </div>
                        <div className="flex items-center gap-2">
                          {categoryData.parent.color && (
                            <div
                              className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                              style={{
                                backgroundColor: categoryData.parent.color,
                              }}
                            />
                          )}
                          <span className="font-medium text-gray-900 dark:text-white">
                            {categoryData.parent.name}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Children Info */}
                    {computed.hasChildren && (
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <ArrowDown className="w-4 h-4" />
                          Subcategorías:
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {computed.totalChildren} categoría
                          {computed.totalChildren !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ⏰ Timestamps */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Historial
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Creada
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Intl.DateTimeFormat("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(categoryData.createdAt))}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Última modificación
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Intl.DateTimeFormat("es-ES", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(categoryData.updatedAt))}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🚨 Empty State Warning */}
              {computed.isEmpty && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        Categoría vacía
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Esta categoría no tiene productos ni subcategorías
                        asociadas.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryViewModal;
