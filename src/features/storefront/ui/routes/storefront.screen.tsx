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
import { useScrollHeader } from "@/shared/hooks";
import { StorefrontUIProvider } from "../../context";
import { CheckoutProvider } from "@/features/storefront/checkout";
import { CartProvider } from "@/features/storefront/cart";
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
  const { scrollY, isPastThreshold } = useScrollHeader({
    threshold: 20,
    wheelSensitivity: 0.6,
    useWheelFallback: true,
    debug: false,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 customer-scrollbar">
      <StorefrontHeader scrollY={scrollY} isPastThreshold={isPastThreshold} />
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
  return (
    <div className={cn("w-full", className)}>
      <CartProvider>
        <CheckoutProvider>
          <StorefrontUIProvider>
            <StorefrontSPAContent />
          </StorefrontUIProvider>
        </CheckoutProvider>
      </CartProvider>
    </div>
  );
};

export default StorefrontScreen;
