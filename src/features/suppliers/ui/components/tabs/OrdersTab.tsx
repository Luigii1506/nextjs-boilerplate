/**
 * 📦 PURCHASE ORDERS TAB
 * ======================
 *
 * Gestión de órdenes de compra a proveedores
 * Coming soon - Placeholder
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper)
 * - Consistent placeholder pattern
 *
 * Created: 2025-01-18 - Suppliers Orders Management
 */

"use client";

import React from "react";
import { ShoppingCart, Package, Clock, CheckCircle } from "lucide-react";
import { TabHeader, TabWrapper } from "@/shared/ui/components/tabs";

export default function OrdersTab() {
  return (
    <TabWrapper>
      <TabHeader
        icon={<ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Órdenes de Compra"
        description="Gestiona y rastrea tus órdenes de compra a proveedores"
      />

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 p-12 text-center">
        <ShoppingCart className="w-20 h-20 mx-auto text-green-600 dark:text-green-400 mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Módulo en Desarrollo
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          El módulo de órdenes de compra está en desarrollo. Pronto podrás
          gestionar todas tus órdenes desde aquí.
        </p>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Package className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Crear Órdenes
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Clock className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Tracking
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <CheckCircle className="w-8 h-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Recepción
            </p>
          </div>
        </div>
      </div>
    </TabWrapper>
  );
}
