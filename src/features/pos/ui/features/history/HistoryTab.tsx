"use client";
/**
 * 📋 History Tab
 * ==============
 *
 * Tab de historial de transacciones.
 *
 * @module pos/ui/features/history/HistoryTab
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useRecentTransactions } from "../../../hooks";
import { useSessionState } from "@/features/pos";
import { formatCurrency, formatTransactionDate } from "../../../utils";
import {
  getPaymentMethodIcon,
  getTransactionTypeColor,
} from "../../../utils/transaction.helpers";
import type { POSTransaction } from "../../../types/models";

export const HistoryTab: React.FC = () => {
  const { user } = useAuth();
  const { currentSession } = useSessionState();
  const [selectedTransaction, setSelectedTransaction] =
    useState<POSTransaction | null>(null);

  const { data: transactions, isLoading } = useRecentTransactions({
    sessionId: currentSession?.id,
    userId: user?.id,
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No hay transacciones
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Las transacciones aparecerán aquí una vez que realices ventas
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Historial de Transacciones
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {transactions.length} transacciones
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions List */}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              onClick={() => setSelectedTransaction(transaction)}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border cursor-pointer transition-all ${
                selectedTransaction?.id === transaction.id
                  ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {getPaymentMethodIcon(transaction.paymentMethod)}
                    </span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {transaction.transactionNumber}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTransactionDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(transaction.total)}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded`}
                      style={{
                        backgroundColor:
                          getTransactionTypeColor(transaction.type) + "20",
                        color: getTransactionTypeColor(transaction.type),
                      }}
                    >
                      {transaction.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{transaction.items.length} items</span>
                  {transaction.changeDue > 0 && (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      Cambio: {formatCurrency(transaction.changeDue)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Transaction Details */}
        <div className="lg:sticky lg:top-20 lg:h-fit">
          {selectedTransaction ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Detalles de Transacción
              </h3>

              {/* Transaction Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Número:
                  </span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {selectedTransaction.transactionNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Fecha:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {formatTransactionDate(selectedTransaction.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tipo:
                  </span>
                  <span
                    className="font-semibold"
                    style={{
                      color: getTransactionTypeColor(selectedTransaction.type),
                    }}
                  >
                    {selectedTransaction.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Método de Pago:
                  </span>
                  <span className="text-gray-900 dark:text-gray-100">
                    {getPaymentMethodIcon(selectedTransaction.paymentMethod)}{" "}
                    {selectedTransaction.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Items
                </h4>
                <div className="space-y-2">
                  {selectedTransaction.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>IVA:</span>
                  <span>{formatCurrency(selectedTransaction.tax)}</span>
                </div>
                {selectedTransaction.discount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Descuento:</span>
                    <span>
                      -{formatCurrency(selectedTransaction.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Pagado:</span>
                  <span>{formatCurrency(selectedTransaction.amountPaid)}</span>
                </div>
                {selectedTransaction.changeDue > 0 && (
                  <div className="flex justify-between text-yellow-600 dark:text-yellow-400 font-semibold">
                    <span>Cambio:</span>
                    <span>{formatCurrency(selectedTransaction.changeDue)}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-2">
                <button
                  onClick={() => {
                    // NOTE: Implementar impresión
                    alert("Función de impresión pendiente");
                  }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Imprimir Recibo
                </button>
                {selectedTransaction.type === "SALE" && (
                  <button
                    onClick={() => {
                      // NOTE: Implementar anulación
                      alert("Función de anulación pendiente");
                    }}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Anular Transacción
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Selecciona una transacción para ver los detalles
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
