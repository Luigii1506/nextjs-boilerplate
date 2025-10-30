/**
 * 🛍️ POS Sale - Types
 * ====================
 *
 * Types específicos para el módulo de venta (carrito POS).
 * Similar a cart types pero optimizado para POS.
 *
 * @module pos/sale/types
 * @version 1.0.0
 */

import type { ProductForCustomer } from "../../../storefront/types";
import type { POSCartAdjustmentType } from "../../types/models";

// ========================================
// SALE ITEM
// ========================================

/**
 * Item en el carrito de venta POS
 */
export interface POSSaleItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  total: number;

  // Product reference (for display)
  product?: ProductForCustomer;

  // Metadata
  metadata?: Record<string, unknown>;
  addedAt: Date;
  updatedAt: Date;
}

/**
 * Sale item con producto completo
 */
export interface POSSaleItemWithProduct extends POSSaleItem {
  product: ProductForCustomer;
}

// ========================================
// SALE SUMMARY
// ========================================

/**
 * Resumen de la venta
 */
export interface POSSaleSummary {
  itemCount: number;
  subtotal: number;
  discount: number;
  fees: number;
  tax: number;
  taxRate: number;
  total: number;
}

// ========================================
// SALE ADJUSTMENT
// ========================================

export interface POSSaleAdjustment {
  id: string;
  type: POSCartAdjustmentType;
  label: string | null;
  amount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// ========================================
// SALE STATE
// ========================================

/**
 * Estado completo de la venta activa
 */
export interface POSSaleState {
  sessionId: string | null;
  items: POSSaleItemWithProduct[];
  summary: POSSaleSummary;
  adjustments: POSSaleAdjustment[];

  // Customer (optional)
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;

  // Metadata
  notes: string | null;
  isLoading: boolean;
  error: string | null;
}

// ========================================
// SALE CONTEXT VALUE
// ========================================

/**
 * Valor del contexto de Sale
 * Similar a CartContextValue en storefront
 */
// (Legacy context and API response types removed)
