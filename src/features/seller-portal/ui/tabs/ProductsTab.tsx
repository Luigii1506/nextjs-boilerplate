/**
 * 🏷️ PRODUCTS TAB - Seller Portal
 * ================================
 *
 * Gestión rápida de productos
 * - Cambiar visibilidad
 * - Gestionar canales de venta
 * - Activar/desactivar productos
 *
 * Created: 2025-01-17
 */

"use client";

import { useState } from "react";
import {
  useProducts,
  useCategories,
  useUpdateProductVisibility,
  useToggleProductActive,
} from "../../hooks/useProducts";
import { ProductVisibility, SalesChannel } from "../../types";
import type { ProductQuickView } from "../../types";

export function ProductsTab() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("ALL");
  const [selectedProduct, setSelectedProduct] = useState<ProductQuickView | null>(null);

  const { data: productsData, isLoading } = useProducts(
    page,
    20,
    searchQuery,
    categoryFilter,
    visibilityFilter
  );
  const { data: categories } = useCategories();
  const updateVisibilityMutation = useUpdateProductVisibility();
  const toggleActiveMutation = useToggleProductActive();

  const products = productsData?.items || [];

  const handleVisibilityChange = async (
    product: ProductQuickView,
    visibility: ProductVisibility
  ) => {
    try {
      await updateVisibilityMutation.mutateAsync({
        productId: product.id,
        visibility,
        availableChannels: product.availableChannels,
        isPublic: visibility === ProductVisibility.PUBLIC,
      });
    } catch (error) {
      alert("Error al cambiar visibilidad");
    }
  };

  const handleChannelToggle = async (product: ProductQuickView, channel: SalesChannel) => {
    const currentChannels = product.availableChannels;
    const newChannels = currentChannels.includes(channel)
      ? currentChannels.filter((c) => c !== channel)
      : [...currentChannels, channel];

    try {
      await updateVisibilityMutation.mutateAsync({
        productId: product.id,
        visibility: product.visibility,
        availableChannels: newChannels,
        isPublic: product.isPublic,
      });
    } catch (error) {
      alert("Error al cambiar canal");
    }
  };

  const handleToggleActive = async (product: ProductQuickView) => {
    try {
      await toggleActiveMutation.mutateAsync({
        productId: product.id,
        isActive: !product.isActive,
      });
    } catch (error) {
      alert("Error al activar/desactivar producto");
    }
  };

  const getVisibilityBadge = (visibility: ProductVisibility) => {
    const config: Record<
      ProductVisibility,
      { label: string; color: string; icon: string }
    > = {
      [ProductVisibility.PUBLIC]: {
        label: "Público",
        color: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700",
        icon: "👁️",
      },
      [ProductVisibility.HIDDEN]: {
        label: "Oculto",
        color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600",
        icon: "🔒",
      },
      [ProductVisibility.INTERNAL]: {
        label: "Interno",
        color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700",
        icon: "🔧",
      },
      [ProductVisibility.COMING_SOON]: {
        label: "Próximamente",
        color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700",
        icon: "⏰",
      },
      [ProductVisibility.DISCONTINUED]: {
        label: "Descontinuado",
        color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700",
        icon: "⛔",
      },
    };

    const cfg = config[visibility];
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}
      >
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buscar</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Nombre o SKU..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">Todas</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Visibilidad
            </label>
            <select
              value={visibilityFilter}
              onChange={(e) => {
                setVisibilityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ALL">Todas</option>
              <option value={ProductVisibility.PUBLIC}>Público</option>
              <option value={ProductVisibility.HIDDEN}>Oculto</option>
              <option value={ProductVisibility.INTERNAL}>Interno</option>
              <option value={ProductVisibility.COMING_SOON}>Próximamente</option>
              <option value={ProductVisibility.DISCONTINUED}>Descontinuado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visibilidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Canales
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {product.categoryName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        ${product.publicPrice?.toFixed(2) || product.price.toFixed(2)}
                      </div>
                      {product.salePrice && (
                        <div className="text-xs text-red-600 dark:text-red-400">
                          Oferta: ${product.salePrice.toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          product.stock > 10
                            ? "text-green-600 dark:text-green-400"
                            : product.stock > 0
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {product.stock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={product.visibility}
                        onChange={(e) =>
                          handleVisibilityChange(product, e.target.value as ProductVisibility)
                        }
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={updateVisibilityMutation.isPending}
                      >
                        <option value={ProductVisibility.PUBLIC}>👁️ Público</option>
                        <option value={ProductVisibility.HIDDEN}>🔒 Oculto</option>
                        <option value={ProductVisibility.INTERNAL}>🔧 Interno</option>
                        <option value={ProductVisibility.COMING_SOON}>
                          ⏰ Próximamente
                        </option>
                        <option value={ProductVisibility.DISCONTINUED}>
                          ⛔ Descontinuado
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleChannelToggle(product, "ONLINE" as SalesChannel)}
                          disabled={updateVisibilityMutation.isPending}
                          className={`px-2 py-1 text-xs rounded border ${
                            product.availableChannels.includes("ONLINE" as SalesChannel)
                              ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          🌐 Online
                        </button>
                        <button
                          onClick={() => handleChannelToggle(product, "POS" as SalesChannel)}
                          disabled={updateVisibilityMutation.isPending}
                          className={`px-2 py-1 text-xs rounded border ${
                            product.availableChannels.includes("POS" as SalesChannel)
                              ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          🏪 POS
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={toggleActiveMutation.isPending}
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          product.isActive
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {product.isActive ? "✓ Activo" : "✗ Inactivo"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        Ver detalles
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {productsData && productsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {(page - 1) * 20 + 1} a {Math.min(page * 20, productsData.total)} de{" "}
            {productsData.total} productos
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === productsData.totalPages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
