"use client";
/**
 * 🎣 usePayment Hook
 * ==================
 *
 * Hook para acceder al contexto de Payment en POS.
 * Re-exporta el hook del contexto para mantener consistencia con el patrón.
 *
 * @module pos/payment/hooks/usePayment
 * @version 1.0.0
 */

export { usePaymentContext as usePayment } from "../context/PaymentContext";
