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

import React, { useMemo, useCallback } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useCartContext } from "../../../context";
import CartEmpty from "./CartEmpty";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { Loader2, ShoppingCart, AlertTriangle, ArrowRight } from "lucide-react";

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
  // 🔐 AUTH STATE
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;

  // 🛒 USE CART CONTEXT (Global state)
  // ==================================

  const {
    cart,
    summary,
    loading,
    errors,
    isEmpty,
    itemCount,
    totalAmount,
    isProcessing,
    updateItem,
    removeItem,
    clearCart,
    getItemQuantity,
    hasItem,
    formatPrice,
  } = useCartContext();

  console.log("🛒 [CART TAB] Rendering cart tab:", {
    isAuthenticated,
    userId,
    hasCart: !!cart,
    itemCount,
    isEmpty,
    isLoading: loading.isLoading,
  });

  // 🔄 ITEM HANDLERS
  // ================

  /**
   * Handle quantity change for cart item
   */
  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number): Promise<boolean> => {
      console.log("🔢 [CART TAB] Quantity change:", { itemId, newQuantity });

      // Find product ID from cart item
      const cartItem = cart?.items.find((item) => item.id === itemId);
      if (!cartItem?.productId) {
        console.error(
          "❌ [CART TAB] Could not find product ID for item:",
          itemId
        );
        return false;
      }

      if (newQuantity === 0) {
        return await removeItem(cartItem.productId);
      }

      return await updateItem(cartItem.productId, newQuantity);
    },
    [cart?.items, updateItem, removeItem]
  );

  /**
   * Handle remove item from cart
   */
  const handleRemoveItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      console.log("🗑️ [CART TAB] Removing item:", itemId);

      // Find product ID from cart item
      const cartItem = cart?.items.find((item) => item.id === itemId);
      if (!cartItem?.productId) {
        console.error(
          "❌ [CART TAB] Could not find product ID for item:",
          itemId
        );
        return false;
      }

      return await removeItem(cartItem.productId);
    },
    [cart?.items, removeItem]
  );

  /**
   * Handle add to wishlist from cart
   */
  const handleAddToWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      console.log("💖 [CART TAB] Adding to wishlist:", productId);
      // TODO: Integrate with wishlist when implemented
      return true;
    },
    []
  );

  /**
   * Handle checkout process
   */
  const handleCheckout = useCallback(async (): Promise<boolean> => {
    console.log("💳 [CART TAB] Starting checkout process");

    // Custom checkout handler or default
    if (onCheckout) {
      return await onCheckout();
    }

    // Default checkout behavior
    console.log("🚀 [CART TAB] Proceeding to default checkout");
    return true;
  }, [onCheckout]);

  // 🧮 COMPUTED VALUES
  // ==================

  const hasErrors = useMemo(() => {
    return !!(
      errors.generalError || Object.keys(errors.actionErrors || {}).length > 0
    );
  }, [errors]);

  // 🎨 LOADING STATE
  // ================

  if (isAuthLoading || loading.isLoading) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">
            Loading your cart...
          </p>
        </div>
      </div>
    );
  }

  // 🚨 ERROR STATE
  // ==============

  if (hasErrors) {
    return (
      <div
        className={`flex items-center justify-center min-h-[400px] ${className}`}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Cart Error
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {errors.generalError || "Something went wrong"}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // 📭 EMPTY STATE
  // ==============

  if (isEmpty) {
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

  // 🛒 CART WITH ITEMS
  // ==================

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {/* 🛒 CART HEADER - Consistent with other tabs */}
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

      {/* 📱 CART LAYOUT */}
      <div
        className={`grid gap-6 ${compact ? "grid-cols-1" : "lg:grid-cols-3"}`}
      >
        {/* 🛍️ MODERN CART ITEMS */}
        <div className={`${compact ? "" : "lg:col-span-2"}`}>
          <div className="space-y-3">
            {cart?.items.map((item, index) => (
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
                  isUpdating={loading.isUpdating}
                  isRemoving={loading.isRemoving}
                />
              </div>
            ))}
          </div>

          {/* Modern Continue shopping button for mobile */}
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

        {/* 💰 CART SUMMARY */}
        <div className={`${compact ? "mt-6" : ""}`}>
          <CartSummary
            summary={summary}
            priceBreakdown={null} // TODO: Add price breakdown if needed
            onCheckout={handleCheckout}
            compact={compact}
            showCouponInput={!compact}
            showSecurityBadges={!compact}
            isProcessingCheckout={loading.isUpdating}
          />
        </div>
      </div>

      {/* 🎯 CART ACTIONS - Mobile */}
      {compact && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <button
              onClick={() => clearCart()}
              className="
                flex-1 py-2 px-4
                border border-red-200 dark:border-red-800
                text-red-600 dark:text-red-400
                rounded-lg font-medium
                hover:bg-red-50 dark:hover:bg-red-900/20
                transition-colors duration-200
              "
            >
              Clear Cart
            </button>

            <button
              onClick={handleCheckout}
              disabled={!summary?.total || loading.isUpdating}
              className="
                flex-1 py-2 px-4
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
