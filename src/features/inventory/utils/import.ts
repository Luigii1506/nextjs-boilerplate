/**
 * 📥 IMPORT UTILITIES
 * ===================
 *
 * Utilidades para importar productos desde CSV y Excel
 * Incluye validación y transformación de datos
 *
 * Created: 2025-01-17 - Export/Import Feature
 */

import Papa from "papaparse";
import * as XLSX from "xlsx";

// 📋 Mapeo de columnas esperadas
export const IMPORT_COLUMN_MAP = {
  SKU: "sku",
  Nombre: "name",
  Descripción: "description",
  Categoría: "categoryName",
  Proveedor: "supplierName",
  Precio: "price",
  Costo: "cost",
  Stock: "stock",
  "Stock Mínimo": "minStock",
  "Stock Máximo": "maxStock",
  Unidad: "unit",
  "Código de Barras": "barcode",
  Ubicación: "location",
  Peso: "weight",
  Activo: "isActive",
} as const;

export interface ImportedProduct {
  sku: string;
  name: string;
  description?: string;
  categoryName?: string;
  supplierName?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  unit?: string;
  barcode?: string;
  location?: string;
  weight?: number;
  isActive: boolean;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  value?: unknown;
}

export interface ImportResult {
  success: boolean;
  data: ImportedProduct[];
  errors: ImportValidationError[];
  stats: {
    total: number;
    valid: number;
    invalid: number;
  };
}

/**
 * Lee archivo CSV
 */
export function parseCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importResult = validateAndTransformData(results.data as Record<string, unknown>[]);
        resolve(importResult);
      },
      error: () => {
        resolve({
          success: false,
          data: [],
          errors: [
            {
              row: 0,
              field: "file",
              message: "Error al leer el archivo CSV",
            },
          ],
          stats: { total: 0, valid: 0, invalid: 0 },
        });
      },
    });
  });
}

/**
 * Lee archivo Excel
 */
export function parseExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });

        // Leer primera hoja
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Record<string, unknown>[];

        const importResult = validateAndTransformData(jsonData);
        resolve(importResult);
      } catch (error) {
        resolve({
          success: false,
          data: [],
          errors: [
            {
              row: 0,
              field: "file",
              message: "Error al leer el archivo Excel",
            },
          ],
          stats: { total: 0, valid: 0, invalid: 0 },
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        data: [],
        errors: [
          {
            row: 0,
            field: "file",
            message: "Error al leer el archivo",
          },
        ],
        stats: { total: 0, valid: 0, invalid: 0 },
      });
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Valida y transforma los datos importados
 */
function validateAndTransformData(rawData: Record<string, unknown>[]): ImportResult {
  const errors: ImportValidationError[] = [];
  const validProducts: ImportedProduct[] = [];

  rawData.forEach((row, index) => {
    const rowNumber = index + 2; // +2 porque index empieza en 0 y la primera fila es header
    const product = transformRow(row, rowNumber, errors);

    if (product) {
      validProducts.push(product);
    }
  });

  return {
    success: errors.length === 0,
    data: validProducts,
    errors,
    stats: {
      total: rawData.length,
      valid: validProducts.length,
      invalid: rawData.length - validProducts.length,
    },
  };
}

/**
 * Transforma una fila de datos a ImportedProduct
 */
function transformRow(
  row: Record<string, unknown>,
  rowNumber: number,
  errors: ImportValidationError[]
): ImportedProduct | null {
  const product: Partial<ImportedProduct> = {};
  let hasErrors = false;

  // SKU (requerido)
  const sku = getString(row, "SKU");
  if (!sku) {
    errors.push({
      row: rowNumber,
      field: "SKU",
      message: "El SKU es obligatorio",
      value: row["SKU"],
    });
    hasErrors = true;
  } else {
    product.sku = sku;
  }

  // Nombre (requerido)
  const name = getString(row, "Nombre");
  if (!name) {
    errors.push({
      row: rowNumber,
      field: "Nombre",
      message: "El nombre es obligatorio",
      value: row["Nombre"],
    });
    hasErrors = true;
  } else {
    product.name = name;
  }

  // Precio (requerido)
  const price = getNumber(row, "Precio");
  if (price === null || price < 0) {
    errors.push({
      row: rowNumber,
      field: "Precio",
      message: "El precio debe ser un número válido mayor o igual a 0",
      value: row["Precio"],
    });
    hasErrors = true;
  } else {
    product.price = price;
  }

  // Costo (requerido)
  const cost = getNumber(row, "Costo");
  if (cost === null || cost < 0) {
    errors.push({
      row: rowNumber,
      field: "Costo",
      message: "El costo debe ser un número válido mayor o igual a 0",
      value: row["Costo"],
    });
    hasErrors = true;
  } else {
    product.cost = cost;
  }

  // Stock (requerido)
  const stock = getNumber(row, "Stock");
  if (stock === null || stock < 0) {
    errors.push({
      row: rowNumber,
      field: "Stock",
      message: "El stock debe ser un número válido mayor o igual a 0",
      value: row["Stock"],
    });
    hasErrors = true;
  } else {
    product.stock = stock;
  }

  // Stock Mínimo (requerido)
  const minStock = getNumber(row, "Stock Mínimo");
  if (minStock === null || minStock < 0) {
    errors.push({
      row: rowNumber,
      field: "Stock Mínimo",
      message: "El stock mínimo debe ser un número válido mayor o igual a 0",
      value: row["Stock Mínimo"],
    });
    hasErrors = true;
  } else {
    product.minStock = minStock;
  }

  // Campos opcionales
  product.description = getString(row, "Descripción") || "";
  product.categoryName = getString(row, "Categoría");
  product.supplierName = getString(row, "Proveedor");
  product.maxStock = getNumber(row, "Stock Máximo") || undefined;
  product.unit = getString(row, "Unidad") || "piece";
  product.barcode = getString(row, "Código de Barras") || undefined;
  product.location = getString(row, "Ubicación") || undefined;
  product.weight = getNumber(row, "Peso") || undefined;

  // Activo (default true)
  const activeStr = getString(row, "Activo");
  product.isActive =
    activeStr === undefined ||
    activeStr === "" ||
    activeStr.toLowerCase() === "sí" ||
    activeStr.toLowerCase() === "si" ||
    activeStr.toLowerCase() === "yes" ||
    activeStr === "1" ||
    activeStr.toLowerCase() === "true";

  if (hasErrors) {
    return null;
  }

  return product as ImportedProduct;
}

/**
 * Obtiene un valor string de una fila
 */
function getString(row: Record<string, unknown>, key: string): string | undefined {
  const value = row[key];
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return String(value).trim();
}

/**
 * Obtiene un valor numérico de una fila
 */
function getNumber(row: Record<string, unknown>, key: string): number | null {
  const value = row[key];

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const num = Number(value);
  return isNaN(num) ? null : num;
}

/**
 * Genera un archivo de ejemplo para importación
 */
export function generateExampleFile(format: "csv" | "xlsx"): void {
  const exampleData = [
    {
      SKU: "PROD-001",
      Nombre: "Producto Ejemplo 1",
      Descripción: "Descripción del producto",
      Categoría: "Electrónica",
      Proveedor: "Proveedor ABC",
      Precio: 100,
      Costo: 50,
      Stock: 10,
      "Stock Mínimo": 5,
      "Stock Máximo": 50,
      Unidad: "piece",
      "Código de Barras": "123456789",
      Ubicación: "A-01",
      Peso: 1.5,
      Activo: "Sí",
    },
    {
      SKU: "PROD-002",
      Nombre: "Producto Ejemplo 2",
      Descripción: "Otro producto de ejemplo",
      Categoría: "Ropa",
      Proveedor: "Proveedor XYZ",
      Precio: 50,
      Costo: 25,
      Stock: 20,
      "Stock Mínimo": 10,
      "Stock Máximo": 100,
      Unidad: "piece",
      "Código de Barras": "987654321",
      Ubicación: "B-02",
      Peso: 0.5,
      Activo: "Sí",
    },
  ];

  if (format === "csv") {
    const csv = Papa.unparse(exampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, "ejemplo_importacion.csv");
  } else {
    const worksheet = XLSX.utils.json_to_sheet(exampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
    XLSX.writeFile(workbook, "ejemplo_importacion.xlsx");
  }
}

/**
 * Descarga un blob como archivo
 */
function downloadBlob(blob: Blob, filename: string): void {
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
