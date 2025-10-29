"use client";
/**
 * 🧭 POS Navigation
 * =================
 *
 * Navegación por tabs del POS.
 *
 * @module pos/ui/components/layout/POSNavigation
 * @version 1.0.0
 */

import React from "react";
import { usePOSUI, type POSTab } from "../../../context";
import { useSaleMetrics } from "@/features/pos";

interface TabConfig {
  id: POSTab;
  label: string;
  icon: string;
  badge?: string | number;
}

export const POSNavigation: React.FC = () => {
  const { activeTab, setActiveTab } = usePOSUI();

  // Zustand store
  const { itemCount, hasItems } = useSaleMetrics();

  const tabs: TabConfig[] = [
    {
      id: "browse",
      label: "Productos",
      icon: "🛍️",
    },
    {
      id: "sale",
      label: "Venta",
      icon: "🛒",
      badge: hasItems ? itemCount : undefined,
    },
    {
      id: "payment",
      label: "Pagar",
      icon: "💳",
    },
    {
      id: "history",
      label: "Historial",
      icon: "📋",
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center space-x-2 px-4 py-3 text-sm font-medium
                  border-b-2 transition-all whitespace-nowrap
                  ${
                    isActive
                      ? "border-blue-600 text-blue-600 dark:text-blue-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600"
                  }
                `}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Badge */}
                {tab.badge !== undefined && (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {tab.badge}
                  </span>
                )}

                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
