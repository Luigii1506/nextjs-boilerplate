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
export interface POSSaleContextValue {
  // State
  items: POSSaleItemWithProduct[];
  summary: POSSaleSummary;
  adjustments: POSSaleAdjustment[];
  itemCount: number;
  total: number;
  isLoading: boolean;

  // Session
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;

  // Actions
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyDiscount: (type: "percentage" | "fixed", value: number) => Promise<void>;
  clearSale: () => Promise<void>;
  validateForCheckout: () => Promise<{ isValid: boolean; errors: string[] }>;
  refreshSale: () => Promise<void>;

  // Computed
  hasItems: boolean;
  canCheckout: boolean;
}

// ========================================
// API TYPES
// ========================================

/**
 * Response de add to sale
 */
export interface AddToSaleResponse {
  sale: POSSaleState;
  addedItem: POSSaleItemWithProduct;
  message: string;
}

/**
 * Response de update sale item
 */
export interface UpdateSaleItemResponse {
  sale: POSSaleState;
  updatedItem: POSSaleItemWithProduct;
  message: string;
}

/**
 * Response de remove from sale
 */
export interface RemoveFromSaleResponse {
  sale: POSSaleState;
  removedItemId: string;
  message: string;
}
