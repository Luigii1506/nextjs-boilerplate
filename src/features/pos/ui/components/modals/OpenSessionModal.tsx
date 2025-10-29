"use client";
/**
 * 🔓 Open Session Modal
 * =====================
 *
 * Modal para abrir una nueva sesión de caja.
 *
 * @module pos/ui/components/modals/OpenSessionModal
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useSessionStore, useSessionActions } from "@/features/pos";
import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenSessionModal: React.FC<OpenSessionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const { user } = useAuth();

  // Zustand store
  const isLoading = useSessionStore((state) => state.isLoading);
  const { openSession } = useSessionActions();

  const [initialCash, setInitialCash] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user || !user.id) {
      setError("No se pudo identificar al usuario. Por favor, inicia sesión nuevamente.");
      return;
    }

    const amount = parseFloat(initialCash);

    if (!amount || amount < 0) {
      setError("Ingresa un monto válido");
      return;
    }

    if (amount > 100000) {
      setError("El monto inicial no puede exceder $100,000");
      return;
    }

    try {
      await openSession(user.id, amount, notes || undefined);
      setInitialCash("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al abrir la caja");
    }
  };

  const quickAmounts = [0, 500, 1000, 2000, 5000];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-4xl">🏪</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">
            Abrir Caja Registradora
          </h2>
          <p className="text-blue-100 text-center text-sm">
            Bienvenido/a, {user?.name}
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

          {/* Initial Cash Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Efectivo Inicial
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-semibold">
                $
              </span>
              <input
                type="number"
                value={initialCash}
                onChange={(e) => setInitialCash(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
              Ingresa la cantidad de efectivo con la que inicias
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
                  onClick={() => setInitialCash(amount.toString())}
                  className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all hover:scale-105 active:scale-95"
                >
                  {amount === 0 ? "0" : `$${amount}`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Turno matutino, fondo de cambio verificado..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 dark:text-blue-400 text-xl">ℹ️</span>
              <div className="flex-1 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Cuenta el efectivo antes de iniciar</li>
                  <li>• Esta cantidad será tu fondo de inicio</li>
                  <li>• Al cerrar deberás contar todo el efectivo</li>
                  <li>• Se generará un reporte de tu turno</li>
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
              disabled={isLoading || !initialCash}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
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
                  <span>Abriendo...</span>
                </span>
              ) : (
                "Abrir Caja"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
