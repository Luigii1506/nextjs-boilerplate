"use client";
/**
 * 🔒 Close Session Modal
 * ======================
 *
 * Modal para cerrar la sesión de caja actual.
 *
 * @module pos/ui/components/modals/CloseSessionModal
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import { useSessionStore, useSessionActions } from "../../../stores/sessionStore";
import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";
import { formatCurrency } from "../../../utils";

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloseSessionModal: React.FC<CloseSessionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // Zustand store
  const currentSession = useSessionStore((state) => state.currentSession);
  const isLoading = useSessionStore((state) => state.isLoading);
  const { closeSession, loadActiveSession } = useSessionActions();

  const [finalCash, setFinalCash] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Load session if modal opens but session is null
  useEffect(() => {
    if (isOpen && !currentSession && user?.id) {
      loadActiveSession(user.id);
    }
  }, [isOpen, currentSession, user?.id, loadActiveSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user || !user.id) {
      setError("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    const amount = parseFloat(finalCash);

    if (!amount || amount < 0) {
      setError("Ingresa un monto válido");
      return;
    }

    if (amount > 1000000) {
      setError("El monto final no puede exceder $1,000,000");
      return;
    }

    try {
      // Close the session
      await closeSession(amount, notes || undefined);

      // Clear form and close modal
      setFinalCash("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar la caja");
    }
  };

  const quickAmounts = [0, 1000, 2000, 5000, 10000];

  if (!isOpen || !currentSession) {
    return null;
  }

  const initialCash = currentSession.initialCash || 0;
  const difference = finalCash ? parseFloat(finalCash) - initialCash : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl">🔒</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Cerrar Caja Registradora
          </h2>
          <p className="text-red-100 text-center text-sm">
            {user?.name}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Efectivo inicial:
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(initialCash)}
              </span>
            </div>
            {finalCash && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Efectivo final:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(parseFloat(finalCash))}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Diferencia:
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        difference > 0
                          ? "text-green-600 dark:text-green-400"
                          : difference < 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {difference >= 0 ? "+" : ""}
                      {formatCurrency(difference)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Final Cash Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Efectivo Final
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-semibold">
                $
              </span>
              <input
                type="number"
                value={finalCash}
                onChange={(e) => setFinalCash(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Cuenta todo el efectivo en caja
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Montos Rápidos
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setFinalCash(amount.toString())}
                  className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  {amount === 0 ? "0" : `$${amount}`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas de Cierre (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Todo en orden, faltaron $50 en monedas..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
            />
          </div>

          {/* Warning Card */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-amber-600 dark:text-amber-400 text-xl">⚠️</span>
              <div className="flex-1 text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cuenta todo el efectivo cuidadosamente</li>
                  <li>• Verifica que no haya transacciones pendientes</li>
                  <li>• Esta acción cerrará tu sesión actual</li>
                  <li>• Se generará un reporte completo del turno</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !finalCash}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Cerrando...</span>
                </span>
              ) : (
                "Cerrar Caja"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
