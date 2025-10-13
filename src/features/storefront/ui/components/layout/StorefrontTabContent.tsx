/**
 * 📑 STOREFRONT TAB CONTENT
 * =========================
 *
 * Main content area with all tabs rendered (SPA pattern)
 */

"use client";

import React, { useCallback, useRef, useEffect } from "react";
import { cn } from "@/shared/utils";
import { useStorefrontUI } from "../../../context";
import { useCartContext } from "@/features/storefront/cart";
import {
  OverviewTab,
  ProductsTab,
  CategoriesTab,
  WishlistTab,
  CartTab,
  CheckoutTab,
  AccountTab,
  SupportTab,
} from "../../features";

export const StorefrontTabContent: React.FC = () => {
  const { activeTab, setActiveTab, isTabChanging } = useStorefrontUI();
  const { addToCart } = useCartContext();

  // Ref to always access latest addToCart - Prevents stale closures
  const addToCartRef = useRef(addToCart);
  useEffect(() => {
    addToCartRef.current = addToCart;
  }, [addToCart]);

  // Ultra-fast handleAddToCart
  const handleAddToCart = useCallback(
    async (productId: string, quantity = 1) => {
      console.log("🏠 [TAB CONTENT] Ultra-fast handleAddToCart called:", {
        productId,
        quantity,
        timestamp: Date.now(),
        source: "TabContent - Ultra-fast single source of truth",
      });
      try {
        await addToCartRef.current(productId, quantity);
        console.log(
          "✅ [TAB CONTENT] Ultra-fast addToCart completed successfully"
        );
      } catch (error) {
        console.error("❌ [TAB CONTENT] Ultra-fast addToCart error:", error);
      }
    },
    []
  );

  // SPA PATTERN: Render ALL tabs but only show the active one
  // This prevents unmounting/remounting that caused "refresh" behavior
  return (
    <div className="relative min-h-screen">
      {/* Tab transition overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 pointer-events-none transition-opacity duration-150",
          isTabChanging ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Overview Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "overview"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "overview" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <OverviewTab />
      </div>

      {/* Products Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "products"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "products" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <ProductsTab onAddToCart={handleAddToCart} />
      </div>

      {/* Categories Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "categories"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "categories" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <CategoriesTab />
      </div>

      {/* Wishlist Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "wishlist"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "wishlist" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <WishlistTab />
      </div>

      {/* Cart Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "cart"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "cart" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <CartTab
          onCheckout={async () => {
            setActiveTab("checkout");
            return true;
          }}
        />
      </div>

      {/* Checkout Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "checkout"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "checkout" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <CheckoutTab
          onReturnToStore={() => setActiveTab("overview")}
          onViewOrder={(orderId: string) => {
            console.log("View order:", orderId);
            setActiveTab("account");
          }}
        />
      </div>

      {/* Account Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "account"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "account" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <AccountTab />
      </div>

      {/* Support Tab - Always mounted */}
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          activeTab === "support"
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform:
            activeTab === "support" ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <SupportTab />
      </div>
    </div>
  );
};
