/**
 * 📤 EXPORT MODAL COMPONENT
 * =========================
 *
 * Modal para configurar y exportar productos a CSV/Excel
 * Permite seleccionar columnas y formato de exportación
 *
 * Created: 2025-01-17 - Export/Import Feature
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Download,
  FileText,
  Table,
  CheckSquare,
  Square,
  Info,
} from "lucide-react";
import { BaseModal } from "@/shared/ui/components/BaseModal";
import { cn } from "@/shared/utils";
import {
  exportProducts,
  EXPORT_COLUMNS,
  getExportStats,
  type ExportColumn,
  type ExportOptions,
} from "../../../utils/export";
import type { ProductWithRelations } from "../../../types";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductWithRelations[];
  title?: string;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  "sku",
  "name",
  "category",
  "supplier",
  "price",
  "cost",
  "stock",
  "minStock",
  "isActive",
];

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  products,
  title = "Exportar Productos",
}) => {
  const [format, setFormat] = useState<"csv" | "xlsx">("xlsx");
  const [selectedColumns, setSelectedColumns] = useState<Set<ExportColumn>>(
    new Set(DEFAULT_COLUMNS)
  );
  const [includeHeaders, setIncludeHeaders] = useState(true);

  const stats = useMemo(() => getExportStats(products), [products]);

  const handleToggleColumn = (column: ExportColumn) => {
    setSelectedColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedColumns(new Set(Object.keys(EXPORT_COLUMNS) as ExportColumn[]));
  };

  const handleDeselectAll = () => {
    setSelectedColumns(new Set());
  };

  const handleExport = () => {
    if (selectedColumns.size === 0) {
      alert("Por favor selecciona al menos una columna para exportar");
      return;
    }

    const options: ExportOptions = {
      format,
      columns: Array.from(selectedColumns),
      filename: `productos_${new Date().toISOString().split("T")[0]}.${format}`,
      includeHeaders,
    };

    exportProducts(products, options);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={`Exportar ${products.length} producto${products.length !== 1 ? "s" : ""}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* 📊 Estadísticas */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Resumen de Exportación
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total</p>
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    {stats.total}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Activos</p>
                  <p className="font-bold text-green-600 dark:text-green-400">
                    {stats.active}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Sin Stock</p>
                  <p className="font-bold text-red-600 dark:text-red-400">
                    {stats.outOfStock}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 📝 Formato de Exportación */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Formato de Archivo
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat("xlsx")}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                format === "xlsx"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
              )}
            >
              <Table
                className={cn(
                  "w-5 h-5",
                  format === "xlsx"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-semibold",
                    format === "xlsx"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  Excel (XLSX)
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recomendado
                </p>
              </div>
            </button>

            <button
              onClick={() => setFormat("csv")}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border-2 transition-all",
                format === "csv"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
              )}
            >
              <FileText
                className={cn(
                  "w-5 h-5",
                  format === "csv"
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                )}
              />
              <div className="text-left">
                <p
                  className={cn(
                    "font-semibold",
                    format === "csv"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  )}
                >
                  CSV
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Compatible
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 📋 Selección de Columnas */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Columnas a Exportar ({selectedColumns.size})
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Seleccionar todo
              </button>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleDeselectAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl p-3 space-y-1">
            {(Object.keys(EXPORT_COLUMNS) as ExportColumn[]).map((column) => {
              const isSelected = selectedColumns.has(column);
              return (
                <label
                  key={column}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors",
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {EXPORT_COLUMNS[column]}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleColumn(column)}
                    className="sr-only"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* ⚙️ Opciones Adicionales */}
        <div>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={includeHeaders}
              onChange={(e) => setIncludeHeaders(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                Incluir encabezados
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Primera fila con nombres de columnas
              </p>
            </div>
          </label>
        </div>

        {/* 🎯 Acciones */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={selectedColumns.size === 0}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
              selectedColumns.size === 0
                ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
            )}
          >
            <Download className="w-5 h-5" />
            Exportar {format.toUpperCase()}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ExportModal;
