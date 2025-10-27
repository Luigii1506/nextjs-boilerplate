/**
 * 🎨 PRODUCT FORMATTERS
 * =====================
 *
 * Pure formatting functions for displaying product data
 * These handle currency, dates, numbers, and text formatting
 *
 * RULES:
 * - No business logic
 * - Pure presentation formatting
 * - Consistent formatting across app
 * - Locale-aware
 *
 * Created: 2025-01-27 - Inventory Utils Refactor
 */

import type { StockStatus, StockMovementType } from "../types";

/**
 * Format number as Mexican Peso currency
 *
 * @param amount - Amount to format
 * @param currency - Currency code (default: MXN)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500.50) // "$1,500.50"
 * formatCurrency(1500.50, "USD") // "$1,500.50"
 */
export const formatCurrency = (
  amount: number,
  currency: string = "MXN"
): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format number with thousands separator
 *
 * @param value - Number to format
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1500) // "1,500"
 * formatNumber(1500.75) // "1,500.75"
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("es-MX").format(value);
};

/**
 * Format percentage with symbol
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(75) // "75%"
 * formatPercentage(75.5, 1) // "75.5%"
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format date to localized string
 *
 * @param date - Date to format
 * @param format - Format type (short, medium, long)
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date()) // "27/01/2025"
 * formatDate(new Date(), "medium") // "27 ene. 2025"
 * formatDate(new Date(), "long") // "27 de enero de 2025"
 */
export const formatDate = (
  date: Date | string,
  format: "short" | "medium" | "long" = "short"
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    medium: { day: "2-digit", month: "short", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
  }[format];

  return new Intl.DateTimeFormat("es-MX", options).format(dateObj);
};

/**
 * Format date with time
 *
 * @param date - Date to format
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime(new Date()) // "27/01/2025, 14:30"
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

/**
 * Format relative time (e.g., "hace 2 días")
 *
 * @param date - Date to format
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime(new Date()) // "hace un momento"
 * formatRelativeTime(new Date(Date.now() - 86400000)) // "hace 1 día"
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "hace un momento";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `hace ${days} ${days === 1 ? "día" : "días"}`;
  }

  return formatDate(dateObj, "short");
};

/**
 * Format stock status to Spanish label
 *
 * @param status - Stock status enum
 * @returns Localized status label
 *
 * @example
 * formatStockStatus("IN_STOCK") // "En Stock"
 * formatStockStatus("LOW_STOCK") // "Stock Bajo"
 */
export const formatStockStatus = (status: StockStatus): string => {
  const labels: Record<StockStatus, string> = {
    IN_STOCK: "En Stock",
    LOW_STOCK: "Stock Bajo",
    CRITICAL_STOCK: "Stock Crítico",
    OUT_OF_STOCK: "Agotado",
  };

  return labels[status] || status;
};

/**
 * Format stock movement type to Spanish label
 *
 * @param type - Movement type enum
 * @returns Localized movement type label
 *
 * @example
 * formatMovementType("IN") // "Entrada"
 * formatMovementType("OUT") // "Salida"
 */
export const formatMovementType = (type: StockMovementType): string => {
  const labels: Record<StockMovementType, string> = {
    IN: "Entrada",
    OUT: "Salida",
    ADJUSTMENT: "Ajuste",
    TRANSFER: "Transferencia",
  };

  return labels[type] || type;
};

/**
 * Format product SKU with prefix
 *
 * @param sku - Product SKU
 * @param prefix - Optional prefix (default: "SKU-")
 * @returns Formatted SKU string
 *
 * @example
 * formatSKU("12345") // "SKU-12345"
 * formatSKU("ABC123", "PROD-") // "PROD-ABC123"
 */
export const formatSKU = (sku: string, prefix: string = "SKU-"): string => {
  return sku.startsWith(prefix) ? sku : `${prefix}${sku}`;
};

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 *
 * @example
 * truncateText("Lorem ipsum dolor sit amet", 10) // "Lorem ipsu..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Format file size to human readable
 *
 * @param bytes - Size in bytes
 * @returns Formatted size string
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};
