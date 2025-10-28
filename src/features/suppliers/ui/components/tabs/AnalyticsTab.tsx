/**
 * 📈 SUPPLIER ANALYTICS TAB
 * =========================
 *
 * Analytics y métricas de desempeño de proveedores
 * Coming soon - Placeholder
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper)
 * - Consistent placeholder pattern
 *
 * Created: 2025-01-18 - Suppliers Analytics
 */

"use client";

import React from "react";
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react";
import { TabHeader, TabWrapper } from "@/shared/ui/components/tabs";

export default function AnalyticsTab() {
  return (
    <TabWrapper>
      <TabHeader
        icon={<TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Analytics de Proveedores"
        description="Análisis detallado del desempeño de tus proveedores"
      />

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800 p-12 text-center">
        <TrendingUp className="w-20 h-20 mx-auto text-orange-600 dark:text-orange-400 mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Módulo en Desarrollo
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          El módulo de analytics está en desarrollo. Pronto tendrás acceso a
          métricas avanzadas y análisis de desempeño.
        </p>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <BarChart3 className="w-8 h-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Gráficas
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <PieChart className="w-8 h-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Comparativas
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Activity className="w-8 h-8 mx-auto text-orange-600 dark:text-orange-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              KPIs
            </p>
          </div>
        </div>
      </div>
    </TabWrapper>
  );
}
