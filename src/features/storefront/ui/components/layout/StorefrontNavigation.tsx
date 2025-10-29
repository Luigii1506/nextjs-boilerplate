/**
 * 🧭 STOREFRONT NAVIGATION
 * ========================
 *
 * Professional tab navigation for storefront
 */

"use client";

import React, { useMemo } from "react";
import {
  Home,
  Package,
  Grid3X3,
  Heart,
  ShoppingCart,
  User,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { useStorefrontUI, STOREFRONT_TABS, type TabId } from "../../../context";
import { useStorefrontData } from "../../../hooks";
import { useCartSummary } from "@/features/storefront/cart";

const ICON_MAP = {
  Home,
  Package,
  Grid3X3,
  Heart,
  ShoppingCart,
  User,
  HelpCircle,
} as const;

export const StorefrontNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = useStorefrontUI();
  const { data } = useStorefrontData();
  const { itemCount } = useCartSummary();

  const wishlist = data?.wishlist || [];
  const cartItemCount = itemCount || 0;

  // Calculate notification counts for each tab
  const notificationCounts = useMemo(
    () => ({
      overview: 0,
      products: 0,
      categories: 0,
      wishlist: wishlist?.length || 0,
      cart: cartItemCount || 0,
      account: 0,
      support: 0,
      checkout: 0,
    }),
    [wishlist, cartItemCount]
  );

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {STOREFRONT_TABS.map((tab) => {
            const IconComponent =
              ICON_MAP[tab.icon as keyof typeof ICON_MAP] || Package;
            const isActive = activeTab === tab.id;
            const notificationCount =
              notificationCounts[tab.id as keyof typeof notificationCounts];

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={cn(
                  "relative flex items-center justify-center space-x-2 px-4 py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10"
                    : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                )}
              >
                <IconComponent
                  className={cn(
                    "w-4 h-4",
                    isActive && "text-blue-600 dark:text-blue-400"
                  )}
                />
                <span>{tab.label}</span>

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
