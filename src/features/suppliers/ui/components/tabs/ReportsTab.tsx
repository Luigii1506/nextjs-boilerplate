/**
 * 📄 SUPPLIER REPORTS TAB
 * =======================
 *
 * Reportes y exportación de datos de proveedores
 * Coming soon - Placeholder
 *
 * REFACTORED: 2025-01-27
 * - Using shared Tab components (TabHeader, TabWrapper)
 * - Consistent placeholder pattern
 *
 * Created: 2025-01-18 - Suppliers Reports
 */

"use client";

import React from "react";
import { FileText, Download, FileSpreadsheet, Calendar } from "lucide-react";
import { TabHeader, TabWrapper } from "@/shared/ui/components/tabs";

export default function ReportsTab() {
  return (
    <TabWrapper>
      <TabHeader
        icon={<FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />}
        title="Reportes de Proveedores"
        description="Genera y exporta reportes detallados de tus proveedores"
      />

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl border border-pink-200 dark:border-pink-800 p-12 text-center">
        <FileText className="w-20 h-20 mx-auto text-pink-600 dark:text-pink-400 mb-6" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Módulo en Desarrollo
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          El módulo de reportes está en desarrollo. Pronto podrás generar y
          exportar reportes personalizados.
        </p>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Download className="w-8 h-8 mx-auto text-pink-600 dark:text-pink-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Exportar PDF
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <FileSpreadsheet className="w-8 h-8 mx-auto text-pink-600 dark:text-pink-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Exportar Excel
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <Calendar className="w-8 h-8 mx-auto text-pink-600 dark:text-pink-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Reportes Programados
            </p>
          </div>
        </div>
      </div>
    </TabWrapper>
  );
}
