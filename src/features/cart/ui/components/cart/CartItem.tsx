/**
 * 🛍️ CART ITEM COMPONENT
 * =======================
 *
 * Individual cart item with quantity controls and remove option.
 * Following Feature-First v3.0.0 patterns.
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import type { CartItemWithProduct } from "../../../types";

// 🏷️ COMPONENT PROPS
// ===================

export interface CartItemProps {
  /** Cart item with product data */
  item: CartItemWithProduct;
  /** Custom quantity change handler */
  onQuantityChange?: (itemId: string, newQuantity: number) => Promise<boolean>;
  /** Custom remove handler */
  onRemove?: (itemId: string) => Promise<boolean>;
  /** Custom add to wishlist handler */
  onAddToWishlist?: (productId: string) => Promise<boolean>;
  /** Custom product view handler */
  onViewProduct?: (productId: string) => void;
  /** Custom className for styling */
  className?: string;
  /** Show wishlist button */
  showWishlistButton?: boolean;
  /** Show product link */
  showProductLink?: boolean;
  /** Compact view mode */
  compact?: boolean;
  /** Animation enabled */
  animate?: boolean;
  /** Item is currently animating */
  isAnimating?: boolean;
  /** Loading states */
  isUpdating?: boolean;
  isRemoving?: boolean;
}

// 🎨 COMPONENT
// ============

/**
 * CartItem - Display and control individual cart item
 */
export function CartItem({
  item,
  onQuantityChange,
  onRemove,
  onAddToWishlist,
  onViewProduct,
  className = "",
  showWishlistButton = true,
  showProductLink = true,
  compact = false,
  animate = true,
  isAnimating = false,
  isUpdating = false,
  isRemoving = false,
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // 🚀 DEBOUNCING: Evita múltiples requests en rapid clicking
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerQuantityRef = useRef(item.quantity);
  const isUserEditingRef = useRef(false);

  const { product } = item;

  console.log("🛍️ [CART ITEM] Rendering item:", {
    productName: product.name,
    serverQuantity: item.quantity,
    localQuantity,
    isUserEditing: isUserEditingRef.current,
    total: item.total,
    isUpdating,
    isRemoving,
  });

  // 🚀 DEBOUNCED SERVER SYNC
  // ========================
  useEffect(() => {
    // Only sync if local quantity differs from server quantity
    // AND user is actively editing (has made changes)
    if (localQuantity !== item.quantity && isUserEditingRef.current) {
      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      console.log("🔄 [DEBOUNCE] Starting debounce timer:", {
        productName: product.name,
        from: item.quantity,
        to: localQuantity,
      });

      debounceTimeoutRef.current = setTimeout(() => {
        console.log("🔄 [DEBOUNCED] Syncing to server:", {
          productName: product.name,
          from: item.quantity,
          to: localQuantity,
        });

        // Direct server sync
        if (onQuantityChange) {
          onQuantityChange(item.id, localQuantity);
        }

        // Mark that we're no longer in user editing mode
        isUserEditingRef.current = false;
      }, 400); // 400ms debounce - optimal UX balance
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localQuantity, item.quantity, item.id, onQuantityChange, product.name]);

  // 💫 SYNC ITEM QUANTITY FROM SERVER
  // ==================================
  useEffect(() => {
    // Only sync from server if:
    // 1. Server quantity actually changed (not just a re-render with same value)
    // 2. User is NOT currently editing (no pending changes)
    if (
      item.quantity !== lastServerQuantityRef.current &&
      !isUserEditingRef.current
    ) {
      console.log("🔄 [SYNC] Server updated quantity, syncing to UI:", {
        productName: product.name,
        prevServerQuantity: lastServerQuantityRef.current,
        newServerQuantity: item.quantity,
        prevLocalQuantity: localQuantity,
      });
      setLocalQuantity(item.quantity);
      lastServerQuantityRef.current = item.quantity;
    } else {
      // Still update the ref to track latest server value
      lastServerQuantityRef.current = item.quantity;
    }
  }, [item.quantity, localQuantity, product.name]);

  const handleIncrement = useCallback(() => {
    if (product.stock > localQuantity) {
      const newQuantity = localQuantity + 1;
      console.log("➕ [INSTANT UI] Increment:", {
        productName: product.name,
        from: localQuantity,
        to: newQuantity,
      });
      isUserEditingRef.current = true; // Mark as user-initiated change
      setLocalQuantity(newQuantity); // INSTANT UI update
    }
  }, [localQuantity, product.stock, product.name]);

  const handleDecrement = useCallback(() => {
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      console.log("➖ [INSTANT UI] Decrement:", {
        productName: product.name,
        from: localQuantity,
        to: newQuantity,
      });
      isUserEditingRef.current = true; // Mark as user-initiated change
      setLocalQuantity(newQuantity); // INSTANT UI update
    }
  }, [localQuantity, product.name]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;

    console.log("🗑️ [CART ITEM] Removing item:", product.name);

    try {
      await onRemove(item.id);
    } catch (error) {
      console.error("❌ [CART ITEM] Remove failed:", error);
    }
  }, [item.id, product.name, onRemove]);

  // 💖 WISHLIST HANDLER
  // ===================

  const handleAddToWishlist = useCallback(async () => {
    if (!onAddToWishlist) return;

    console.log("💖 [CART ITEM] Adding to wishlist:", product.name);

    try {
      await onAddToWishlist(product.id);
    } catch (error) {
      console.error("❌ [CART ITEM] Add to wishlist failed:", error);
    }
  }, [product.id, product.name, onAddToWishlist]);

  // 🔍 PRODUCT VIEW HANDLER
  // =======================

  const handleViewProduct = useCallback(() => {
    if (!onViewProduct) return;

    console.log("🔍 [CART ITEM] Viewing product:", product.name);
    onViewProduct(product.id);
  }, [product.id, product.name, onViewProduct]);

  // 🎨 STYLING
  // ==========

  // 🚀 100% OPTIMISTIC UX: Sin loading visual de ningún tipo
  // Todas las operaciones son instantáneas
  const hasStockIssue = product.stock < item.quantity;
  const isOutOfStock = product.stock === 0;
  const isPriceChanged =
    Math.abs(product.price - item.unitPrice) / item.unitPrice > 0.1;

  return (
    <div
      className={`
        relative group
        ${compact ? "p-3" : "p-4"}
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        rounded-lg shadow-sm hover:shadow-md
        ${animate && isAnimating ? "animate-slideInUp" : ""}
        ${hasStockIssue ? "ring-2 ring-red-200 dark:ring-red-800" : ""}
        transition-all duration-200
        ${className}
      `}
    >
      <div className={`flex gap-4 ${compact ? "items-center" : "items-start"}`}>
        {/* 🖼️ PRODUCT IMAGE */}
        <div className="relative flex-shrink-0">
          <div
            className={`
              relative overflow-hidden
              ${compact ? "w-16 h-16" : "w-20 h-20"}
              bg-gray-100 dark:bg-gray-800
              rounded-lg
              transition-all duration-200
            `}
          >
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes={compact ? "80px" : "96px"}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Image
                  src="/placeholder-product.png"
                  alt={product.name}
                  fill
                  className="object-cover opacity-50 transition-transform duration-700 group-hover:scale-110"
                  sizes={compact ? "80px" : "96px"}
                />
              </div>
            )}
          </div>

          {/* Stock warning indicator */}
          {hasStockIssue && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>

        {/* 📄 PRODUCT INFO */}
        <div className="flex-grow min-w-0">
          <div className="flex justify-between items-start gap-2">
            {/* Product name and details */}
            <div className="min-w-0 flex-grow">
              <div className="flex items-start gap-2">
                <h3
                  className={`
                    font-medium text-gray-900 dark:text-gray-100 
                    ${compact ? "text-sm" : "text-base"}
                    ${
                      showProductLink
                        ? "hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                        : ""
                    }
                    truncate
                  `}
                  onClick={showProductLink ? handleViewProduct : undefined}
                >
                  {product.name}
                </h3>

                {showProductLink && (
                  <button
                    onClick={handleViewProduct}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="View product details"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Product details */}
              {!compact && (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    SKU: {product.sku}
                  </p>

                  {product.category && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category:{" "}
                      {typeof product.category === "string"
                        ? product.category
                        : (product.category as { name?: string })?.name ||
                          "N/A"}
                    </p>
                  )}

                  {/* Warnings */}
                  {hasStockIssue && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                      <AlertTriangle className="w-3 h-3" />
                      {isOutOfStock
                        ? "Out of stock"
                        : `Only ${product.stock} left`}
                    </div>
                  )}

                  {isPriceChanged && (
                    <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Price updated: ${(product.price || 0).toFixed(2)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Price and remove button */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div
                  className={`font-semibold text-gray-900 dark:text-gray-100 ${
                    compact ? "text-sm" : "text-base"
                  }`}
                >
                  ${(item.total || 0).toFixed(2)}
                </div>
                {!compact && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ${(item.unitPrice || 0).toFixed(2)} each
                  </div>
                )}
              </div>

              {/* Modern Remove button */}
              <button
                onClick={handleRemove}
                className="
                  group/remove p-2.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg
                  border border-transparent hover:border-red-200 dark:hover:border-red-800/40
                  opacity-70 group-hover:opacity-100
                "
                title="Remove from cart"
              >
                <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* 🔢 QUANTITY CONTROLS & ACTIONS */}
          <div
            className={`flex items-center justify-between ${
              compact ? "mt-2" : "mt-3"
            }`}
          >
            {/* Modern Quantity controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-600/60 rounded-2xl shadow-sm backdrop-blur-sm">
                <button
                  onClick={handleDecrement}
                  disabled={localQuantity <= 1}
                  className="
                    group p-2.5 text-gray-500 dark:text-gray-400
                    hover:text-blue-600 dark:hover:text-blue-400
                    hover:bg-blue-50 dark:hover:bg-blue-900/20
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500
                    transition-all duration-300 hover:scale-110
                    rounded-l-2xl
                  "
                >
                  <Minus className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                </button>

                <div className="px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-gray-100 min-w-12 text-center bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 border-x border-gray-200/40 dark:border-gray-600/40">
                  {localQuantity}
                </div>

                <button
                  onClick={handleIncrement}
                  disabled={localQuantity >= product.stock}
                  className="
                    group p-2.5 text-gray-500 dark:text-gray-400
                    hover:text-green-600 dark:hover:text-green-400
                    hover:bg-green-50 dark:hover:bg-green-900/20
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500
                    transition-all duration-300 hover:scale-110
                    rounded-r-2xl
                  "
                >
                  <Plus className="w-3 h-3 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              <span className="text-xs text-gray-500 dark:text-gray-400">
                {product.stock} available
              </span>
            </div>

            {/* Action buttons */}
            {showWishlistButton && !compact && (
              <button
                onClick={handleAddToWishlist}
                className="
                  flex items-center gap-1 px-2 py-1
                  text-xs text-gray-500 dark:text-gray-400
                  hover:text-pink-500 dark:hover:text-pink-400
                  hover:bg-pink-50 dark:hover:bg-pink-900/20
                  rounded-lg transition-colors duration-200
                "
                title="Save for later"
              >
                <Heart className="w-3 h-3" />
                Save for later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItem;
