/**
 * 📦 PRODUCT CARD COMPONENT
 * =========================
 *
 * Tarjeta de producto reutilizable con todas las funcionalidades
 * React 19 optimizado, dark mode completo, y accesibilidad total
 *
 * Created: 2025-01-17 - Inventory Management Module
 */

"use client";

import React, { memo, useMemo, useState } from "react";
import {
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Package,
  Tag,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  ExternalLink,
  Plus,
  Minus,
  History,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { INVENTORY_DEFAULTS, STOCK_STATUS } from "../../../constants";
import StockIndicator from "./StockIndicator";
import CategoryBadge from "./CategoryBadge";
import type {
  ProductCardProps,
  ProductWithComputedProps,
  StockStatus,
  ProductWithRelations,
} from "../../../types";

// 🧮 Compute enhanced product properties
function computeProductProps(
  product: ProductWithRelations
): ProductWithComputedProps {
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

  const isLowStock = product.stock <= product.minStock;
  const isCriticalStock =
    product.stock <= INVENTORY_DEFAULTS.CRITICAL_STOCK_THRESHOLD;
  const isOutOfStock = product.stock === 0;

  // Format currency
  const formatter = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  });

  const formattedPrice = formatter.format(product.price);
  const formattedCost = formatter.format(product.cost);

  return {
    ...product,
    stockStatus,
    stockPercentage,
    totalValue,
    totalRetailValue,
    isLowStock,
    isCriticalStock,
    isOutOfStock,
    formattedPrice,
    formattedCost,
    // lastMovement would come from relations in real implementation
    lastMovement: undefined,
  };
}

// 🎨 Product image placeholder
const ProductImagePlaceholder: React.FC<{ name: string; className?: string }> =
  memo(({ name, className }) => (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200",
        "dark:from-gray-700 dark:to-gray-800",
        className
      )}
    >
      <div className="text-center">
        <Package className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium px-2">
          {name.substring(0, 20)}
          {name.length > 20 && "..."}
        </p>
      </div>
    </div>
  ));

ProductImagePlaceholder.displayName = "ProductImagePlaceholder";

// 🎯 Main component
const ProductCard: React.FC<
  ProductCardProps & {
    onQuickAdjust?: (product: ProductWithRelations) => void;
    isSelected?: boolean;
    onToggleSelection?: (productId: string) => void;
    showCheckbox?: boolean;
  }
> = memo(
  ({
    product: baseProduct,
    showActions = true,
    onEdit,
    onDelete,
    onView,
    onQuickAdjust,
    isSelected = false,
    onToggleSelection,
    showCheckbox = false,
    className,
  }) => {
    // 🧮 Compute enhanced properties
    const product = useMemo(
      () => computeProductProps(baseProduct),
      [baseProduct]
    );

    // 🎨 Get stock status styling
    const stockConfig = STOCK_STATUS[product.stockStatus];

    // 📸 Primary image
    const primaryImage = product.images[0];

    // 💰 Profit calculation
    const profitMargin =
      product.price > 0
        ? ((product.price - product.cost) / product.price) * 100
        : 0;
    const isHighProfit = profitMargin > 40;
    const isLowProfit = profitMargin < 10;

    return (
      <div
        className={cn(
          // Base card styles
          "group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700",
          "shadow-sm hover:shadow-lg dark:shadow-gray-900/20",
          "transition-all duration-200 ease-out",
          "overflow-hidden",

          // Interactive states
          "hover:border-gray-300 dark:hover:border-gray-600",
          "focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
          "dark:focus-within:ring-offset-gray-800",

          // Inactive product styling
          !product.isActive && "opacity-75 grayscale",

          className
        )}
      >
        {/* ✅ Selection checkbox */}
        {showCheckbox && onToggleSelection && (
          <div className="absolute top-2 left-2 z-20">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelection(product.id);
              }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "w-5 h-5 rounded border-2 cursor-pointer transition-all",
                "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-blue-400"
              )}
            />
          </div>
        )}

        {/* 🚨 Status indicator */}
        {(product.isLowStock || product.isOutOfStock) && (
          <div
            className={cn(
              "absolute top-2 z-10 px-2 py-1 rounded-full text-xs font-bold",
              "flex items-center space-x-1 shadow-sm",
              stockConfig.bgColor,
              stockConfig.textColor,
              stockConfig.borderColor,
              "border",
              showCheckbox ? "left-9" : "left-2"
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>{stockConfig.label}</span>
          </div>
        )}

        {/* ⚡ Actions dropdown */}
        {showActions && (
          <div className="absolute top-2 right-2 z-10">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex">
                  {onView && (
                    <button
                      onClick={() => onView(product)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-l-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                      title="Editar producto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product)}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-r-lg transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📸 Product image */}
        <div className="aspect-square w-full relative bg-gray-50 dark:bg-gray-900">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                // Replace with placeholder on error
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <ProductImagePlaceholder
              name={product.name}
              className="w-full h-full"
            />
          )}
        </div>

        {/* 📝 Product content */}
        <div className="p-4 space-y-3">
          {/* Header: Name + SKU */}
          <div className="space-y-1">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
              {product.name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/70 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                {product.sku}
              </span>
              <CategoryBadge
                category={product.category}
                size="sm"
                showIcon={false}
                clickable={false}
              />
            </div>
          </div>

          {/* Stock indicator */}
          <StockIndicator
            stock={product.stock}
            minStock={product.minStock}
            maxStock={product.maxStock}
            size="sm"
            showLabel={false}
          />

          {/* Pricing - Simplified */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Precio
              </span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                {product.formattedPrice}
              </span>
            </div>
          </div>

          {/* Quick Stock Adjust Button */}
          {onQuickAdjust && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdjust(product);
              }}
              className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] font-medium text-sm"
            >
              <Package className="w-4 h-4" />
              <span>Ajustar Stock</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
