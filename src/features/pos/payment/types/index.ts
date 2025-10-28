/**
 * 💳 POS Payment - Types
 * ======================
 *
 * Types específicos para el módulo de pago POS.
 * Similar a checkout types pero optimizado para POS.
 *
 * @module pos/payment/types
 * @version 1.0.0
 */

import type { POSPaymentMethod, POSTransactionType } from "../../types/models";
import type { POSSaleSummary } from "../../sale/types";

// ========================================
// PAYMENT STATE
// ========================================

/**
 * Estado del proceso de pago
 */
export interface POSPaymentState {
  // Sale info
  saleSummary: POSSaleSummary | null;

  // Payment details
  paymentMethod: POSPaymentMethod | null;
  amountPaid: number;
  changeDue: number;

  // Mixed payment (when using multiple methods)
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;

  // Transaction
  transactionId: string | null;
  transactionNumber: string | null;

  // State
  isProcessing: boolean;
  isComplete: boolean;
  error: string | null;
}

// ========================================
// PAYMENT METHOD INFO
// ========================================

/**
 * Información del método de pago
 */
export interface PaymentMethodInfo {
  method: POSPaymentMethod;
  label: string;
  icon: string;
  description: string;
  enabled: boolean;
}

/**
 * Métodos de pago disponibles
 */
export const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    method: "CASH",
    label: "Efectivo",
    icon: "💵",
    description: "Pago en efectivo",
    enabled: true,
  },
  {
    method: "CARD",
    label: "Tarjeta",
    icon: "💳",
    description: "Tarjeta débito/crédito",
    enabled: true,
  },
  {
    method: "TRANSFER",
    label: "Transferencia",
    icon: "🏦",
    description: "Transferencia bancaria",
    enabled: true,
  },
  {
    method: "MIXED",
    label: "Mixto",
    icon: "💰",
    description: "Combinación de métodos",
    enabled: true,
  },
];

// ========================================
// PAYMENT INPUT
// ========================================

/**
 * Input para procesar un pago
 */
export interface ProcessPaymentInput {
  sessionId: string;
  paymentMethod: POSPaymentMethod;

  // Amounts for each method
  cashAmount?: number;
  cardAmount?: number;
  transferAmount?: number;

  // Total amount paid
  amountPaid: number;

  // Optional
  notes?: string;
  referenceNumber?: string;
}

/**
 * Input para pago mixto
 */
export interface MixedPaymentInput {
  sessionId: string;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  notes?: string;
}

// ========================================
// PAYMENT RESULT
// ========================================

/**
 * Resultado de procesar un pago
 */
export interface ProcessPaymentResult {
  success: boolean;
  transaction: POSTransactionResult | null;
  error: string | null;
}

/**
 * Transacción completada
 */
export interface POSTransactionResult {
  id: string;
  transactionNumber: string;
  type: POSTransactionType;
  paymentMethod: POSPaymentMethod;

  // Amounts
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  changeDue: number;

  // Items
  itemCount: number;

  // Metadata
  createdAt: Date;
  receiptUrl?: string;
}

// ========================================
// PAYMENT CONTEXT VALUE
// ========================================

/**
 * Valor del contexto de Payment
 * Similar a CheckoutContext en storefront
 */
export interface POSPaymentContextValue {
  // State
  paymentState: POSPaymentState;
  isProcessing: boolean;
  isComplete: boolean;
  error: string | null;

  // Current transaction
  currentTransaction: POSTransactionResult | null;

  // Actions
  setPaymentMethod: (method: POSPaymentMethod) => void;
  setAmountPaid: (amount: number) => void;
  setMixedPayment: (cash: number, card: number, transfer: number) => void;
  processPayment: (input: ProcessPaymentInput) => Promise<ProcessPaymentResult>;
  resetPayment: () => void;

  // Computed
  canProcess: boolean;
  changeDue: number;
  requiresChange: boolean;
}

// ========================================
// PAYMENT VALIDATION
// ========================================

/**
 * Resultado de validación de pago
 */
export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validar input de pago
 */
export function validatePaymentInput(
  input: ProcessPaymentInput,
  saleTotal: number
): PaymentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar método de pago
  if (!input.paymentMethod) {
    errors.push("Selecciona un método de pago");
  }

  // Validar monto pagado
  if (input.amountPaid <= 0) {
    errors.push("El monto pagado debe ser mayor a 0");
  }

  if (input.amountPaid < saleTotal) {
    errors.push("El monto pagado es menor al total");
  }

  // Validar pago mixto
  if (input.paymentMethod === "MIXED") {
    const totalMixed =
      (input.cashAmount || 0) +
      (input.cardAmount || 0) +
      (input.transferAmount || 0);

    if (totalMixed !== input.amountPaid) {
      errors.push("La suma de los métodos no coincide con el monto pagado");
    }

    if (totalMixed < saleTotal) {
      errors.push("El total del pago mixto es menor al total de la venta");
    }
  }

  // Warnings
  if (input.paymentMethod === "CASH" && input.amountPaid > saleTotal * 2) {
    warnings.push("El monto en efectivo es muy alto");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calcular cambio
 */
export function calculateChange(amountPaid: number, total: number): number {
  return Math.max(0, Math.round((amountPaid - total) * 100) / 100);
}
