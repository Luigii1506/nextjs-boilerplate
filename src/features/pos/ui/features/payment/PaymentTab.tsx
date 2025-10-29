"use client";
/**
 * 💳 Payment Tab
 * ==============
 *
 * Tab de procesamiento de pagos.
 *
 * @module pos/ui/features/payment/PaymentTab
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import {
  useSaleSummary,
  useSaleMetrics,
  useSaleSessionId,
  useSaleActions,
  usePaymentState,
  usePaymentStatus,
  useCurrentTransaction,
  useChangeDue,
  usePaymentActions,
  useCanProcessPayment,
  useSessionStore,
} from "@/features/pos";
import { usePOSUI } from "../../../context";
import { formatCurrency } from "../../../utils";
import { PAYMENT_METHODS, type POSPaymentMethod } from "../../../payment/types";

export const PaymentTab: React.FC = () => {
  // Sale store
  const summary = useSaleSummary();
  const { hasItems, canCheckout } = useSaleMetrics();
  const sessionId = useSaleSessionId();
  const { clearSale } = useSaleActions();

  // Payment store
  const paymentState = usePaymentState();
  const { isProcessing, isComplete } = usePaymentStatus();
  const currentTransaction = useCurrentTransaction();
  const changeDue = useChangeDue();
  const canProcess = useCanProcessPayment();
  const {
    setPaymentMethod,
    setAmountPaid,
    processPayment,
    resetPayment,
    setSaleSummary,
  } = usePaymentActions();

  // Session store
  const currentSession = useSessionStore((state) => state.currentSession);

  const { setActiveTab } = usePOSUI();

  const [amountInput, setAmountInput] = useState("");

  // Auto-set sale summary when entering payment tab
  useEffect(() => {
    if (!summary) {
      return;
    }

    const currentSummary = paymentState.saleSummary;
    const hasChanged =
      !currentSummary ||
      currentSummary.total !== summary.total ||
      currentSummary.itemCount !== summary.itemCount;

    if (hasChanged) {
      setSaleSummary(summary);
    }
  }, [paymentState.saleSummary, setSaleSummary, summary]);

  const handlePaymentMethodChange = (method: POSPaymentMethod) => {
    setPaymentMethod(method);
  };

  const handleAmountChange = (value: string) => {
    setAmountInput(value);
    const amount = parseFloat(value) || 0;
    setAmountPaid(amount);
  };

  const handleQuickAmount = (amount: number) => {
    setAmountInput(amount.toString());
    setAmountPaid(amount);
  };

  const handleExactAmount = () => {
    if (summary) {
      handleQuickAmount(summary.total);
    }
  };

  const handleProcessPayment = async () => {
    if (!canProcess || !sessionId || !paymentState.paymentMethod) return;

    try {
      const result = await processPayment({
        sessionId,
        paymentMethod: paymentState.paymentMethod,
        amountPaid: paymentState.amountPaid,
      });

      if (result.success) {
        // Limpiar venta
        await clearSale();
      }
    } catch (error) {
      console.error("Payment processing error:", error);
    }
  };

  const handleNewSale = () => {
    resetPayment();
    setAmountInput("");
    setActiveTab("browse");
  };

  if (isComplete && currentTransaction) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-4">
            ¡Pago Exitoso!
          </h2>

          <div className="space-y-2 mb-6 text-left max-w-md mx-auto">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Transacción:</span>
              <span className="font-mono">
                {currentTransaction.transactionNumber}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Total:</span>
              <span className="font-semibold">
                {formatCurrency(currentTransaction.total)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Pagado:</span>
              <span>{formatCurrency(currentTransaction.amountPaid)}</span>
            </div>
            {currentTransaction.changeDue > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400 font-semibold">
                <span>Cambio:</span>
                <span>{formatCurrency(currentTransaction.changeDue)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleNewSale}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Nueva Venta
            </button>
            <button
              onClick={() => {
                // TODO: Implementar impresión
                alert("Función de impresión pendiente");
              }}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Imprimir Recibo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!hasItems) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">💳</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No hay items para pagar
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Agrega productos al carrito primero
          </p>
          <button
            onClick={() => setActiveTab("browse")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
            No hay sesión activa
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Debes abrir una sesión de caja para procesar pagos
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Procesar Pago
      </h2>

      {/* Sale Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Resumen de Venta
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>Subtotal:</span>
            <span>{formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-gray-400">
            <span>IVA:</span>
            <span>{formatCurrency(summary.tax)}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
              <span>Total a Pagar:</span>
              <span>{formatCurrency(summary.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Método de Pago
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.filter((m) => m.enabled).map((method) => (
            <button
              key={method.method}
              onClick={() => handlePaymentMethodChange(method.method)}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentState.paymentMethod === method.method
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="text-3xl mb-2">{method.icon}</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {method.label}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {method.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Amount Input */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Monto Recibido
        </h3>

        <input
          type="number"
          value={amountInput}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="0.00"
          className="w-full px-4 py-3 text-2xl font-semibold text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        />

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            onClick={handleExactAmount}
            className="py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-medium rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
          >
            Exacto
          </button>
          {[100, 200, 500].map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickAmount(amount)}
              className="py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ${amount}
            </button>
          ))}
        </div>

        {/* Change Display */}
        {changeDue > 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                Cambio:
              </span>
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {formatCurrency(changeDue)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcessPayment}
        disabled={!canProcess || isProcessing}
        className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors text-xl"
      >
        {isProcessing ? "Procesando..." : "Completar Pago"}
      </button>
    </div>
  );
};
