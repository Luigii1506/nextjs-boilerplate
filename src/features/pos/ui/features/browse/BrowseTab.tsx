"use client";
/**
 * 🛍️ Browse Tab
 * =============
 *
 * Tab de exploración de productos para el POS.
 *
 * @module pos/ui/features/browse/BrowseTab
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useSearchProducts, useCategories } from "../../../hooks";
import { useSaleStore, useSaleActions } from "../../../stores/saleStore";
import { usePOSUI } from "../../../context";
import { formatCurrency } from "../../../utils";
import type { ProductForCustomer } from "@/features/storefront/types";

export const BrowseTab: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { data: categoriesData } = useCategories();
  const { data: productsData, isLoading } = useSearchProducts({
    search,
    categoryId: selectedCategory,
    page,
    pageSize: 20,
  });

  // Zustand store
  const isAddingItem = useSaleStore((state) => state.isLoading);
  const { addItem } = useSaleActions();

  const { setActiveTab } = usePOSUI();

  const handleAddToSale = async (product: ProductForCustomer) => {
    try {
      await addItem(product.id, 1);
      // Opcional: Cambiar a tab de venta
      setActiveTab("sale");
    } catch (error) {
      console.error("Error adding to sale:", error);
      // TODO: Mostrar toast de error
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header con búsqueda */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar productos por nombre o SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory || ""}
            onChange={(e) => {
              setSelectedCategory(e.target.value || undefined);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categoriesData?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.productCount})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : productsData?.products && productsData.products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productsData.products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
              >
                {/* Image */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    SKU: {product.sku}
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {formatCurrency(product.price)}
                  </p>

                  {/* Stock */}
                  <p
                    className={`text-sm mb-3 ${
                      product.stock > 10
                        ? "text-green-600 dark:text-green-400"
                        : product.stock > 0
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    Stock: {product.stock}
                  </p>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAddToSale(product)}
                    disabled={product.stock === 0 || isAddingItem}
                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  >
                    {product.stock === 0
                      ? "Sin stock"
                      : isAddingItem
                        ? "Agregando..."
                        : "Agregar"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {productsData.hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Cargar más productos
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No se encontraron productos
          </p>
        </div>
      )}
    </div>
  );
};
