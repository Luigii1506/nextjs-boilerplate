"use client";
/**
 * 🔒 Session Guard - Simplified Edition
 * ======================================
 *
 * Clean session guard that lets child components handle their own loading.
 * Shows only ONE skeleton (product grid) for optimal UX.
 *
 * @module pos/ui/components/SessionGuard
 * @version 3.0.0
 */

import React, { useEffect, useState } from "react";
import { usePOSSession } from "../../session";
import { usePOSUI } from "../../context";
import { useAuth } from "@/shared/hooks/useAuth";
import { useRouter } from "next/navigation";

interface SessionGuardProps {
  children: React.ReactNode;
}

export const SessionGuard: React.FC<SessionGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { currentSession, isSessionOpen, isLoading: sessionLoading, loadActiveSession, openSession } = usePOSSession();
  const { openSessionModal, state } = usePOSUI();

  // Combined loading state with minimum display time to prevent flashing
  const [isInitializing, setIsInitializing] = useState(true);

  // Form state for opening session
  const [initialCash, setInitialCash] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Determine overall loading state
  const isLoading = authLoading || sessionLoading;

  // Initialize with minimum delay to prevent flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 200); // Quick init to show BrowseTab skeleton faster

    return () => clearTimeout(timer);
  }, []);

  // Handle form submission
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
      await openSession(amount, notes || undefined);
      setInitialCash("");
      setNotes("");

      // Reload session state
      await loadActiveSession();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al abrir la caja");
    }
  };

  // Reload session when open modal closes (in case session was opened via modal)
  useEffect(() => {
    if (!state.isSessionModalOpen && isAuthenticated && !currentSession) {
      loadActiveSession();
    }
  }, [state.isSessionModalOpen, isAuthenticated, currentSession, loadActiveSession]);

  // Reload session when close modal closes (to detect session was closed)
  useEffect(() => {
    if (!state.isCloseSessionModalOpen && isAuthenticated) {
      console.log('[SessionGuard] Close modal closed, reloading session');
      loadActiveSession();
    }
  }, [state.isCloseSessionModalOpen, isAuthenticated, loadActiveSession]);

  // ========================================
  // LOADING STATE (Initial + Session Check)
  // ========================================

  // Minimal loading - let the BrowseTab show its product grid skeleton
  if (isLoading || isInitializing) {
    return null; // Quick pass-through to show actual POS layout with skeleton
  }

  // ========================================
  // NO AUTHENTICATION
  // ========================================

  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 animate-in fade-in duration-300">
        <div className="text-center space-y-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Acceso Restringido
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Debes iniciar sesión para acceder al POS
          </p>
        </div>
      </div>
    );
  }

  // ========================================
  // NO ACTIVE SESSION - OPEN REGISTER FORM
  // ========================================

  if (!isSessionOpen) {
    const quickAmounts = [0, 500, 1000, 2000, 5000];

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-6">
                  <span className="text-6xl transform -rotate-6">🏪</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
              Abrir Caja Registradora
            </h1>
            <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
              Bienvenido/a, {user.name} 👋
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-700">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3 animate-in slide-in-from-top duration-300">
                  <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
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
                    disabled={sessionLoading}
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                      disabled={sessionLoading}
                      className="px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={sessionLoading}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sessionLoading || !initialCash}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:scale-105 active:scale-95"
              >
                {sessionLoading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Abriendo...</span>
                  </span>
                ) : (
                  "Abrir Caja Registradora"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // SESSION ACTIVE - SHOW POS INTERFACE
  // ========================================

  // Simple pass-through - let BrowseTab handle its own loading
  return <>{children}</>;
};
