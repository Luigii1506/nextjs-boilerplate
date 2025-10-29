/**
 * 🛒 CART TAB COMPONENT
 * =====================
 *
 * Optimised cart tab using Zustand selectors for fine-grained renders.
 */

"use client";

import React, { memo, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { ShoppingCart, ArrowRight } from "lucide-react";
import {
  useCartStore,
  useCartActions,
} from "@/features/storefront/cart";
import type {
  CartItemWithProduct,
  CartSummary as CartSummaryType,
} from "@/features/storefront/cart";
import { useWishlist } from "@/features/storefront/hooks";
import CartItem from "./components/CartItem";
import CartSummary from "./components/CartSummary";
import CartEmpty from "./components/CartEmpty";

export interface CartTabProps {
  className?: string;
  compact?: boolean;
  showHeader?: boolean;
  onContinueShopping?: () => void;
  onBrowseWishlist?: () => void;
  onViewProduct?: (productId: string) => void;
  onCheckout?: () => Promise<boolean>;
}

const selectCartSnapshot = (state: ReturnType<typeof useCartStore.getState>) => ({
  items: state.items,
  summary: state.summary,
  itemCount: state.itemCount,
  totalAmount: state.totalAmount,
});

const EmptyCartSection = memo(
  ({
    className,
    compact,
    showHeader,
    onContinueShopping,
    onBrowseWishlist,
  }: Pick<CartTabProps, "className" | "compact" | "showHeader" | "onContinueShopping" | "onBrowseWishlist">) => (
    <div className={className ?? ""}>
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
        animate
      />
    </div>
  )
);
EmptyCartSection.displayName = "EmptyCartSection";

const CartHeaderSection = memo(
  ({
    itemCount,
    totalAmount,
    formatPrice,
    onContinueShopping,
  }: {
    itemCount: number;
    totalAmount: number;
    formatPrice: (amount: number) => string;
    onContinueShopping?: () => void;
  }) => (
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
              {itemCount > 0 && (
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
            className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
);
CartHeaderSection.displayName = "CartHeaderSection";

const CartItemsSection = memo(
  ({
    items,
    compact,
    summary,
    onCheckout,
    onChangeQuantity,
    onRemove,
    onAddToWishlist,
    onContinueShopping,
    onViewProduct,
  }: {
    items: CartItemWithProduct[];
    compact: boolean;
    summary: CartSummaryType | null;
    onCheckout: () => Promise<boolean>;
    onChangeQuantity: (id: string, quantity: number) => Promise<boolean>;
    onRemove: (id: string) => Promise<boolean>;
    onAddToWishlist: (productId: string) => Promise<boolean>;
    onContinueShopping?: () => void;
    onViewProduct?: (productId: string) => void;
  }) => (
    <div className={`grid gap-6 ${compact ? "grid-cols-1" : "lg:grid-cols-3"}`}>
      <div className={`${compact ? "" : "lg:col-span-2"}`}>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="group transform transition-all duration-300 hover:scale-[1.01]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CartItem
                item={item}
                onQuantityChange={onChangeQuantity}
                onRemove={onRemove}
                onAddToWishlist={onAddToWishlist}
                onViewProduct={onViewProduct}
                compact={compact}
                animate
              />
            </div>
          ))}
        </div>

        {onContinueShopping && compact && (
          <div className="mt-6">
            <button
              onClick={onContinueShopping}
              className="group w-full flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-blue-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 font-semibold rounded-2xl hover:border-solid hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              Continue Shopping
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        )}
      </div>

      <div className={compact ? "mt-6" : ""}>
        <CartSummary
          summary={summary}
          priceBreakdown={null}
          onCheckout={onCheckout}
          compact={compact}
          showCouponInput={!compact}
          showSecurityBadges={!compact}
        />
      </div>
    </div>
  )
);
CartItemsSection.displayName = "CartItemsSection";

export function CartTab({
  className = "",
  compact = false,
  showHeader = true,
  onContinueShopping,
  onBrowseWishlist,
  onViewProduct,
  onCheckout,
}: CartTabProps) {
  const { items, summary, itemCount, totalAmount } = useCartStore(
    useShallow(selectCartSnapshot)
  );
  const { updateQuantity, removeItem, formatPrice } = useCartActions();
  const { addToWishlist } = useWishlist();

  const handleQuantityChange = useCallback(
    async (itemId: string, newQuantity: number) => {
      try {
        return await updateQuantity(itemId, newQuantity);
      } catch (error) {
        console.error("Update quantity failed:", error);
        return false;
      }
    },
    [updateQuantity]
  );

  const handleRemoveItem = useCallback(
    async (itemId: string) => {
      try {
        return await removeItem(itemId);
      } catch (error) {
        console.error("Remove item failed:", error);
        return false;
      }
    },
    [removeItem]
  );

  const handleAddToWishlist = useCallback(
    async (productId: string) => {
      try {
        return await addToWishlist(productId);
      } catch (error) {
        console.error("Add to wishlist failed:", error);
        return false;
      }
    },
    [addToWishlist]
  );

  const handleCheckout = useCallback(async () => {
    if (onCheckout) {
      return await onCheckout();
    }
    return true;
  }, [onCheckout]);

  if (items.length === 0) {
    return (
      <EmptyCartSection
        className={className}
        compact={compact}
        showHeader={showHeader}
        onContinueShopping={onContinueShopping}
        onBrowseWishlist={onBrowseWishlist}
      />
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {showHeader && !compact && (
        <CartHeaderSection
          itemCount={itemCount}
          totalAmount={totalAmount}
          formatPrice={formatPrice}
          onContinueShopping={onContinueShopping}
        />
      )}

      <CartItemsSection
        items={items}
        compact={compact}
        summary={summary}
        onCheckout={handleCheckout}
        onChangeQuantity={handleQuantityChange}
        onRemove={handleRemoveItem}
        onAddToWishlist={handleAddToWishlist}
        onContinueShopping={onContinueShopping}
        onViewProduct={onViewProduct}
      />
    </div>
  );
}

export default CartTab;
