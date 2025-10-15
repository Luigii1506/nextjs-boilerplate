/**
 * 📤 EXPORT UTILITIES
 * ===================
 *
 * Utilidades para exportar productos a CSV y Excel
 * Soporta filtros y selección personalizada de columnas
 *
 * Created: 2025-01-17 - Export/Import Feature
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { ProductWithRelations } from "../types";

// 📋 Columnas disponibles para exportación
export const EXPORT_COLUMNS = {
  sku: "SKU",
  name: "Nombre",
  description: "Descripción",
  category: "Categoría",
  supplier: "Proveedor",
  price: "Precio",
  cost: "Costo",
  stock: "Stock",
  minStock: "Stock Mínimo",
  maxStock: "Stock Máximo",
  unit: "Unidad",
  barcode: "Código de Barras",
  location: "Ubicación",
  weight: "Peso",
  dimensions: "Dimensiones",
  isActive: "Activo",
  createdAt: "Fecha Creación",
  updatedAt: "Fecha Actualización",
} as const;

export type ExportColumn = keyof typeof EXPORT_COLUMNS;

export interface ExportOptions {
  columns?: ExportColumn[];
  format: "csv" | "xlsx";
  filename?: string;
  includeHeaders?: boolean;
}

/**
 * Convierte productos a formato plano para exportación
 */
export function flattenProductsForExport(
  products: ProductWithRelations[],
  columns?: ExportColumn[]
): Record<string, unknown>[] {
  const selectedColumns = columns || (Object.keys(EXPORT_COLUMNS) as ExportColumn[]);

  return products.map((product) => {
    const row: Record<string, unknown> = {};

    selectedColumns.forEach((col) => {
      switch (col) {
        case "category":
          row[EXPORT_COLUMNS[col]] = product.category?.name || "";
          break;
        case "supplier":
          row[EXPORT_COLUMNS[col]] = product.supplier?.name || "";
          break;
        case "dimensions":
          row[EXPORT_COLUMNS[col]] = product.dimensions
            ? `${product.dimensions.length}x${product.dimensions.width}x${product.dimensions.height}`
            : "";
          break;
        case "isActive":
          row[EXPORT_COLUMNS[col]] = product.isActive ? "Sí" : "No";
          break;
        case "createdAt":
          row[EXPORT_COLUMNS[col]] = new Date(product.createdAt).toLocaleDateString("es-MX");
          break;
        case "updatedAt":
          row[EXPORT_COLUMNS[col]] = new Date(product.updatedAt).toLocaleDateString("es-MX");
          break;
        case "price":
        case "cost":
          row[EXPORT_COLUMNS[col]] = Number(product[col]);
          break;
        default:
          row[EXPORT_COLUMNS[col]] = product[col] ?? "";
      }
    });

    return row;
  });
}

/**
 * Exporta productos a CSV
 */
export function exportToCSV(
  products: ProductWithRelations[],
  options: Omit<ExportOptions, "format"> = {}
): void {
  const { columns, filename = "productos.csv", includeHeaders = true } = options;

  const data = flattenProductsForExport(products, columns);

  const csv = Papa.unparse(data, {
    quotes: true,
    header: includeHeaders,
    delimiter: ",",
  });

  downloadFile(csv, filename, "text/csv;charset=utf-8;");
}

/**
 * Exporta productos a Excel (XLSX)
 */
export function exportToExcel(
  products: ProductWithRelations[],
  options: Omit<ExportOptions, "format"> = {}
): void {
  const { columns, filename = "productos.xlsx", includeHeaders = true } = options;

  const data = flattenProductsForExport(products, columns);

  // Crear workbook y worksheet
  const worksheet = XLSX.utils.json_to_sheet(data, {
    header: includeHeaders ? undefined : [],
  });

  // Aplicar estilos al header
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "E2E8F0" } },
    };
  }

  // Auto-width para las columnas
  const columnWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...data.map((row) => String(row[key] || "").length)
    ) + 2,
  }));
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  // Generar archivo y descargar
  XLSX.writeFile(workbook, filename);
}

/**
 * Función genérica de exportación
 */
export function exportProducts(
  products: ProductWithRelations[],
  options: ExportOptions
): void {
  if (options.format === "csv") {
    exportToCSV(products, options);
  } else {
    exportToExcel(products, options);
  }
}

/**
 * Descarga un archivo en el navegador
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Obtiene estadísticas de los productos a exportar
 */
export function getExportStats(products: ProductWithRelations[]) {
  return {
    total: products.length,
    active: products.filter((p) => p.isActive).length,
    inactive: products.filter((p) => !p.isActive).length,
    withImages: products.filter((p) => p.images && p.images.length > 0).length,
    lowStock: products.filter((p) => p.stock <= p.minStock).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
  };
}
