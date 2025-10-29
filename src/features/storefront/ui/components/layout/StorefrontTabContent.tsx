/**
 * 📑 STOREFRONT TAB CONTENT
 * =========================
 *
 * Main content area with all tabs rendered (SPA pattern)
 */

"use client";

import React, { useCallback, useRef, useEffect, memo } from "react";
import { cn } from "@/shared/utils";
import { useCartActions } from "@/features/storefront/cart";
import {
  type TabId,
  useStorefrontUIActions,
  useStorefrontUIStore,
} from "@/features/storefront/state/ui.store";
import { useShallow } from "zustand/react/shallow";
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

const selectTabState = (state: ReturnType<typeof useStorefrontUIStore.getState>) => ({
  activeTab: state.activeTab,
  isTabChanging: state.isTabChanging,
});

const TabPanel = memo(
  ({ tabId, activeTab, children }: { tabId: TabId; activeTab: TabId; children: React.ReactNode }) => {
    const isActive = activeTab === tabId;

    return (
      <div
        className={cn(
          "transition-all duration-300 ease-out",
          isActive
            ? "opacity-100 visible relative z-0"
            : "opacity-0 invisible absolute inset-0 z-0 pointer-events-none"
        )}
        style={{
          transform: isActive ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {children}
      </div>
    );
  }
);
TabPanel.displayName = "TabPanel";

const TransitionOverlay = memo(({ isVisible }: { isVisible: boolean }) => (
  <div
    className={cn(
      "absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 pointer-events-none transition-opacity duration-150",
      isVisible ? "opacity-100" : "opacity-0"
    )}
  />
));
TransitionOverlay.displayName = "TransitionOverlay";

export const StorefrontTabContent: React.FC = () => {
  const { addToCart } = useCartActions();
  const { setActiveTab } = useStorefrontUIActions();
  const { activeTab, isTabChanging } = useStorefrontUIStore(
    useShallow(selectTabState)
  );

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

  return (
    <div className="relative min-h-screen">
      <TransitionOverlay isVisible={isTabChanging} />

      <TabPanel tabId="overview" activeTab={activeTab}>
        <OverviewTab />
      </TabPanel>

      <TabPanel tabId="products" activeTab={activeTab}>
        <ProductsTab onAddToCart={handleAddToCart} />
      </TabPanel>

      <TabPanel tabId="categories" activeTab={activeTab}>
        <CategoriesTab />
      </TabPanel>

      <TabPanel tabId="wishlist" activeTab={activeTab}>
        <WishlistTab />
      </TabPanel>

      <TabPanel tabId="cart" activeTab={activeTab}>
        <CartTab
          onCheckout={async () => {
            setActiveTab("checkout");
            return true;
          }}
        />
      </TabPanel>

      <TabPanel tabId="checkout" activeTab={activeTab}>
        <CheckoutTab
          onReturnToStore={() => setActiveTab("overview")}
          onViewOrder={(orderId: string) => {
            console.log("View order:", orderId);
            setActiveTab("account");
          }}
        />
      </TabPanel>

      <TabPanel tabId="account" activeTab={activeTab}>
        <AccountTab />
      </TabPanel>

      <TabPanel tabId="support" activeTab={activeTab}>
        <SupportTab />
      </TabPanel>
    </div>
  );
};
