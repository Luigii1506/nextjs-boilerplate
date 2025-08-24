/**
 * 👁️ PRODUCT VIEW MODAL COMPONENT
 * ===============================
 *
 * Modal completo para visualizar todos los detalles de un producto
 * Diseño hermoso con dark mode, animaciones suaves y layout responsive
 *
 * Created: 2025-01-18 - Product View Functionality
 */

"use client";

import React, { useMemo } from "react";
import {
  X,
  Package,
  Tag,
  DollarSign,
  Warehouse,
  BarChart3,
  Building2,
  Image as ImageIcon,
  Layers3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useInventoryContext } from "../../context";
import StockIndicator from "./shared/StockIndicator";
import CategoryBadge from "./shared/CategoryBadge";
import type { ProductWithRelations, StockStatus } from "../../types";
import { INVENTORY_DEFAULTS } from "../../constants";

// 🧮 Utility function to compute enhanced product properties
function computeProductProps(product: ProductWithRelations) {
  const stockStatus: StockStatus =
    product.stock === 0
      ? "OUT_OF_STOCK"
      : product.stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD
      ? "CRITICAL_STOCK"
      : product.stock <= product.minStock
      ? "LOW_STOCK"
      : "IN_STOCK";

  const stockPercentage = product.maxStock
    ? (product.stock / product.maxStock) * 100
    : Math.min(100, (product.stock / (product.minStock * 4)) * 100);

  const totalValue = product.cost * product.stock;
  const totalRetailValue = product.price * product.stock;
  const profitMargin =
    product.price > 0
      ? ((product.price - product.cost) / product.price) * 100
      : 0;

  return {
    stockStatus,
    stockPercentage,
    totalValue,
    totalRetailValue,
    profitMargin,
    isLowStock: product.stock <= product.minStock,
    isCriticalStock:
      product.stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD,
    isOutOfStock: product.stock === 0,
  };
}

// 💰 Currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

// 📅 Date formatter
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ProductViewModal: React.FC = () => {
  const { viewingProduct, isViewModalOpen, closeViewModal } =
    useInventoryContext();

  // 🧮 Compute enhanced properties
  const enhanced = useMemo(
    () => (viewingProduct ? computeProductProps(viewingProduct) : null),
    [viewingProduct]
  );

  if (!isViewModalOpen || !viewingProduct || !enhanced) {
    return null;
  }

  const product = viewingProduct;

  return (
    <>
      {/* 🌫️ Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={closeViewModal}
      />

      {/* 🎯 Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl",
            "border border-gray-200 dark:border-gray-700",
            "max-w-4xl w-full max-h-[90vh] overflow-hidden",
            "transform transition-all duration-300 ease-out",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 📋 Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  "bg-blue-100 dark:bg-blue-900/30",
                  "text-blue-600 dark:text-blue-400"
                )}
              >
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  SKU: {product.sku}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stock Status Badge */}
              <StockIndicator
                stock={product.stock}
                minStock={product.minStock}
                maxStock={product.maxStock}
                className="text-sm"
              />

              {/* Close Button */}
              <button
                onClick={closeViewModal}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  "text-gray-400 hover:text-gray-600",
                  "dark:text-gray-500 dark:hover:text-gray-300",
                  "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 📊 Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 📋 Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* 📝 Basic Information */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Información General
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nombre del Producto
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                        {product.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        SKU
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
                        {product.sku}
                      </p>
                    </div>
                    {product.description && (
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Descripción
                        </label>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 💰 Financial Information */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Información Financiera
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Precio de Venta
                      </label>
                      <p className="mt-1 text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Costo
                      </label>
                      <p className="mt-1 text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(product.cost)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Margen de Ganancia
                      </label>
                      <p
                        className={cn(
                          "mt-1 text-lg font-bold",
                          enhanced.profitMargin > 50
                            ? "text-green-600 dark:text-green-400"
                            : enhanced.profitMargin > 20
                            ? "text-yellow-600 dark:text-yellow-400"
                            : "text-red-600 dark:text-red-400"
                        )}
                      >
                        {enhanced.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Valor Total en Stock
                      </label>
                      <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(enhanced.totalRetailValue)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 📦 Stock Information */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Warehouse className="w-5 h-5" />
                    Información de Stock
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Stock Actual
                      </label>
                      <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                        {product.stock}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.unit}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        Stock Mínimo
                      </label>
                      <p className="mt-1 text-lg font-semibold text-orange-600 dark:text-orange-400">
                        {product.minStock}
                      </p>
                    </div>
                    {product.maxStock && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                          Stock Máximo
                        </label>
                        <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                          {product.maxStock}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                        % de Capacidad
                      </label>
                      <p className="mt-1 text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {enhanced.stockPercentage.toFixed(0)}%
                      </p>
                    </div>
                  </div>

                  {/* Stock Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Stock Progress</span>
                      <span>{enhanced.stockPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-500",
                          enhanced.stockStatus === "OUT_OF_STOCK"
                            ? "bg-red-500"
                            : enhanced.stockStatus === "CRITICAL_STOCK"
                            ? "bg-red-400"
                            : enhanced.stockStatus === "LOW_STOCK"
                            ? "bg-yellow-400"
                            : "bg-green-500"
                        )}
                        style={{
                          width: `${Math.min(100, enhanced.stockPercentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 🏷️ Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5" />
                      Etiquetas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={cn(
                            "px-3 py-1 rounded-full text-sm font-medium",
                            "bg-blue-100 dark:bg-blue-900/30",
                            "text-blue-800 dark:text-blue-200"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🖼️ Images */}
                {product.images && product.images.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Imágenes
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      {product.images.slice(0, 8).map((image, index) => (
                        <div
                          key={index}
                          className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${product.name} - Imagen ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 📊 Right Column - Additional Info */}
              <div className="space-y-6">
                {/* 🏷️ Category & Supplier */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Layers3 className="w-5 h-5" />
                    Clasificación
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Categoría
                      </label>
                      <CategoryBadge category={product.category} size="lg" />
                    </div>
                    {product.supplier && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Proveedor
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.supplier.name}
                            </p>
                            {product.supplier.rating && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {product.supplier.rating.toFixed(1)} / 5.0
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📊 Status & Alerts */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Estado del Producto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Estado
                      </span>
                      <div className="flex items-center gap-2">
                        {product.isActive ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              Activo
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-red-600 dark:text-red-400">
                              Inactivo
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {product.barcode && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Código de Barras
                        </span>
                        <span className="text-sm font-mono text-gray-900 dark:text-white">
                          {product.barcode}
                        </span>
                      </div>
                    )}

                    {enhanced.isLowStock && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm text-yellow-800 dark:text-yellow-200">
                          Stock bajo - Considerar restock
                        </span>
                      </div>
                    )}

                    {enhanced.isOutOfStock && (
                      <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm text-red-800 dark:text-red-200">
                          Producto agotado
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 📅 Timeline */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Fechas
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Creado
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(product.createdAt)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                        Última Actualización
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(product.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={closeViewModal}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
                "text-gray-700 dark:text-gray-300"
              )}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductViewModal;
