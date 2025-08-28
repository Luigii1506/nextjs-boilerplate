/**
 * 📭 CART EMPTY COMPONENT
 * =======================
 *
 * Component for empty cart state with call-to-action.
 * Following Feature-First v3.0.0 patterns.
 *
 * @version 1.0.0 - Cart Feature
 */

"use client";

import React from "react";
import { ShoppingBag, ArrowRight, Heart, Star } from "lucide-react";

// 🏷️ COMPONENT PROPS
// ===================

export interface CartEmptyProps {
  /** Custom title for empty state */
  title?: string;
  /** Custom message for empty state */
  message?: string;
  /** Show suggested actions */
  showSuggestions?: boolean;
  /** Custom call-to-action handler */
  onContinueShopping?: () => void;
  /** Custom browse wishlist handler */
  onBrowseWishlist?: () => void;
  /** Custom className for styling */
  className?: string;
  /** Animation enabled */
  animate?: boolean;
}

// 🎨 COMPONENT
// ============

/**
 * CartEmpty - Displays empty cart state with suggestions
 */
export function CartEmpty({
  title = "Your cart is empty",
  message = "Add some items to get started with your order.",
  showSuggestions = true,
  onContinueShopping,
  onBrowseWishlist,
  className = "",
  animate = true,
}: CartEmptyProps) {
  console.log("📭 [CART EMPTY] Rendering empty cart state");

  const handleContinueShopping = () => {
    console.log("🛍️ [CART EMPTY] Continue shopping clicked");
    onContinueShopping?.();
  };

  const handleBrowseWishlist = () => {
    console.log("💖 [CART EMPTY] Browse wishlist clicked");
    onBrowseWishlist?.();
  };

  return (
    <div
      className={`
        flex flex-col items-center justify-center 
        p-8 text-center space-y-6 
        min-h-[400px]
        ${animate ? "animate-fadeIn" : ""}
        ${className}
      `}
    >
      {/* 🛒 Empty Cart Icon */}
      <div className="relative">
        <div
          className={`
            w-24 h-24 rounded-full 
            bg-gray-100 dark:bg-gray-800 
            flex items-center justify-center
            ${animate ? "animate-pulse" : ""}
          `}
        >
          <ShoppingBag className="w-12 h-12 text-gray-400 dark:text-gray-500" />
        </div>

        {/* Decorative dot */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        </div>
      </div>

      {/* 📝 Empty State Text */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
      </div>

      {/* 🎯 Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={handleContinueShopping}
          className="
            flex items-center justify-center gap-2
            px-6 py-3 
            bg-blue-600 hover:bg-blue-700
            text-white font-medium rounded-lg
            transition-colors duration-200
            group
          "
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        {onBrowseWishlist && (
          <button
            onClick={handleBrowseWishlist}
            className="
              flex items-center justify-center gap-2
              px-6 py-3 
              border border-gray-300 dark:border-gray-600
              text-gray-700 dark:text-gray-300 
              font-medium rounded-lg
              hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors duration-200
            "
          >
            <Heart className="w-4 h-4" />
            View Wishlist
          </button>
        )}
      </div>

      {/* 💡 Suggestions */}
      {showSuggestions && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 w-full max-w-md">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Popular Suggestions
            </h4>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Browse by category
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  Check featured products
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-700 dark:text-gray-300">
                  View your wishlist
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartEmpty;


