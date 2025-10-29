"use client";
/**
 * 🏪 POS Header
 * =============
 *
 * Header del punto de venta con información de sesión.
 *
 * @module pos/ui/components/layout/POSHeader
 * @version 1.0.0
 */

import React from "react";
import { useAuth } from "@/shared/hooks/useAuth";
import { useSessionStore, useIsSessionOpen } from "../../../stores/sessionStore";
import { usePOSUI } from "../../../context";
import { DarkModeToggle } from "@/shared/ui/components/DarkModeToggle";
import { formatCurrency } from "../../../utils";

export const POSHeader: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Zustand store
  const currentSession = useSessionStore((state) => state.currentSession);
  const isSessionOpen = useIsSessionOpen();

  const { openSessionModal, openCloseSessionModal } = usePOSUI();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                🏪 POS
              </h1>
            </div>

            {/* Session Status */}
            {isSessionOpen && currentSession ? (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Sesión Activa
                </span>
                <span className="text-xs text-green-600 dark:text-green-300">
                  Caja inicial: {formatCurrency(currentSession.initialCash)}
                </span>
              </div>
            ) : (
              <button
                onClick={openSessionModal}
                className="hidden md:flex items-center space-x-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
              >
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ Sin sesión activa - Abrir caja
                </span>
              </button>
            )}
          </div>

          {/* Right: User Info & Controls */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cajero
                  </p>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Session Actions */}
            {isSessionOpen && (
              <button
                onClick={openCloseSessionModal}
                className="px-3 py-2 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center space-x-1"
              >
                <span>🔒</span>
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Session Status */}
        {isSessionOpen && currentSession && (
          <div className="md:hidden pb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Sesión Activa
              </span>
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Caja: {formatCurrency(currentSession.initialCash)}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
