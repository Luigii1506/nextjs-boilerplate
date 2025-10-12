/**
 * 🛒 CART TAB COMPONENT
 * =====================
 *
 * Main cart tab component with full cart functionality.
 * Feature-First v3.0.0 coordinator pattern.
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import React, { useCallback } from "react";
import { useCartContext } from "../../../context";
import { useWishlist } from "@/features/storefront/hooks";
import CartEmpty from "./CartEmpty";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { ShoppingCart, ArrowRight } from "lucide-react";

// 🏷️ COMPONENT PROPS
// ===================

export interface CartTabProps {
  /** Custom className for styling */
  className?: string;
  /** Compact view mode */
  compact?: boolean;
  /** Show cart header */
  showHeader?: boolean;
  /** Custom navigation handlers */
  onContinueShopping?: () => void;
  onBrowseWishlist?: () => void;
  onViewProduct?: (productId: string) => void;
  /** Custom checkout handler */
  onCheckout?: () => Promise<boolean>;
}

// 🎨 COMPONENT
// ============

/**
 * CartTab - Main cart tab coordinator
 */
export function CartTab({
  className = "",
  compact = false,
  showHeader = true,
  onContinueShopping,
  onBrowseWishlist,
  onViewProduct,
  onCheckout,
}: CartTabProps) {
  // 🛒 Context & Hooks
  const {
    items,
    summary,
    itemCount,
    totalAmount,
    updateQuantity,
    removeItem,
    formatPrice,
  } = useCartContext();

  const { addToWishlist } = useWishlist();

  // 🔄 Handlers
  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number): Promise<boolean> => {
      try {
        await updateQuantity(itemId, newQuantity);
        return true;
      } catch (error) {
        console.error("Update quantity failed:", error);
        return false;
      }
    },
    [updateQuantity]
  );

  const handleRemoveItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        await removeItem(itemId);
        return true;
      } catch (error) {
        console.error("Remove item failed:", error);
        return false;
      }
    },
    [removeItem]
  );

  const handleAddToWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      try {
        await addToWishlist(productId);
        return true;
      } catch (error) {
        console.error("Add to wishlist failed:", error);
        return false;
      }
    },
    [addToWishlist]
  );

  const handleCheckout = useCallback(async (): Promise<boolean> => {
    if (onCheckout) {
      return await onCheckout();
    }
    return true;
  }, [onCheckout]);

  // 📭 Empty State
  if (items.length === 0) {
    return (
      <div className={`${className}`}>
        {showHeader && !compact && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Shopping Cart
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your cart is waiting for some great products
            </p>
          </div>
        )}

        <CartEmpty
          onContinueShopping={onContinueShopping}
          onBrowseWishlist={onBrowseWishlist}
          animate={true}
        />
      </div>
    );
  }

  // 🛒 Cart with Items
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* Cart Header */}
      {showHeader && !compact && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Shopping Cart
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
                  {totalAmount && (
                    <span className="ml-2 font-semibold text-green-600 dark:text-green-400">
                      · {formatPrice(totalAmount)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {onContinueShopping && (
              <button
                onClick={onContinueShopping}
                className="
                  flex items-center gap-2 px-4 py-2
                  text-blue-600 dark:text-blue-400 
                  hover:text-blue-700 dark:hover:text-blue-300
                  font-medium
                  transition-colors duration-200
                "
              >
                Continue Shopping
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cart Layout */}
      <div
        className={`grid gap-6 ${compact ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        {/* Cart Items */}
        <div className={`${compact ? "" : "lg:col-span-2"}`}>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group transform transition-all duration-300 hover:scale-[1.01]"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <CartItem
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  onAddToWishlist={handleAddToWishlist}
                  onViewProduct={onViewProduct}
                  compact={compact}
                  animate={true}
                  isAnimating={false}
                  isUpdating={false}
                  isRemoving={false}
                />
              </div>
            ))}
          </div>

          {/* Continue Shopping - Mobile */}
          {onContinueShopping && compact && (
            <div className="mt-6">
              <button
                onClick={onContinueShopping}
                className="
                  group w-full flex items-center justify-center gap-3
                  p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700
                  border-2 border-dashed border-blue-200 dark:border-gray-600
                  text-blue-600 dark:text-blue-400 font-semibold
                  rounded-2xl hover:border-solid hover:border-blue-300 dark:hover:border-blue-500
                  hover:shadow-lg hover:scale-[1.02]
                  transition-all duration-300
                "
              >
                <ShoppingCart className="w-5 h-5" />
                Continue Shopping
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className={`${compact ? "mt-6" : ""}`}>
          <CartSummary
            summary={summary}
            priceBreakdown={null}
            onCheckout={handleCheckout}
            compact={compact}
            showCouponInput={!compact}
            showSecurityBadges={!compact}
            isProcessingCheckout={false}
          />
        </div>
      </div>

      {/* Cart Actions - Mobile */}
      {compact && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={handleCheckout}
              disabled={!summary?.total}
              className="
                w-full py-2 px-4
                bg-blue-600 hover:bg-blue-700
                text-white rounded-lg font-medium
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200
              "
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartTab;
