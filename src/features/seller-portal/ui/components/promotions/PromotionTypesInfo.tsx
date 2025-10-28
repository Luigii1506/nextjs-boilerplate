/**
 * 📚 PROMOTION TYPES INFO COMPONENT
 * ===================================
 *
 * Educational info cards about available promotion types
 *
 * Created: 2025-01-27
 */

"use client";

import React from "react";

/**
 * PromotionTypesInfo - Displays info about available promotion types
 */
export const PromotionTypesInfo: React.FC = React.memo(() => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
        📚 Tipos de Promociones Disponibles
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="text-2xl mb-2">🎯</div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            BOGO & 2x1
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Compra X y lleva Y gratis o con descuento
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="text-2xl mb-2">💰</div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Descuentos
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Porcentaje o monto fijo en productos/categorías
          </p>
        </div>
        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="text-2xl mb-2">📦</div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Bundles
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Paquetes de productos con precio especial
          </p>
        </div>
      </div>
    </div>
  );
});

PromotionTypesInfo.displayName = "PromotionTypesInfo";
