/**
 * 🛒 STOREFRONT SPA SCREEN
 * ========================
 *
 * Single Page Application for Storefront Customer-Facing
 * Clean, modular architecture with extracted components
 *
 * @version 3.0.0 - Refactored & Modular
 */

"use client";

import "../styles/animations.css";

import React from "react";
import { cn } from "@/shared/utils";
import { useCheckoutInitializer } from "@/features/storefront/checkout";
import { useCartInitializer } from "@/features/storefront/cart";
import { CartDebugPanel } from "../features/cart";
import {
  StorefrontHeader,
  StorefrontNavigation,
  StorefrontTabContent,
  StorefrontFooter,
} from "../components/layout";

/**
 * Main SPA Content
 */
const StorefrontSPAContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 customer-scrollbar">
      <StorefrontHeader />
      <StorefrontNavigation />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <StorefrontTabContent />
      </main>

      <StorefrontFooter />

      {/* Debug Panels - Only in development */}
      {process.env.NODE_ENV === "development" && <CartDebugPanel />}
    </div>
  );
};

/**
 * Main Exported Component (with Providers)
 */
interface StorefrontScreenProps {
  className?: string;
}

const StorefrontScreen: React.FC<StorefrontScreenProps> = ({ className }) => {
  useCartInitializer();
  useCheckoutInitializer();

  return (
    <div className={cn("w-full", className)}>
      <StorefrontSPAContent />
    </div>
  );
};

export default StorefrontScreen;
