"use client";
/**
 * 🎨 POS UI Context
 * =================
 *
 * Context para gestionar el estado de UI del POS.
 * Controla tabs, modales, y estado general de interfaz.
 *
 * @module pos/context/POSUIContext
 * @version 1.0.0
 */

import React, { createContext, useContext, useState, useCallback } from "react";

// ========================================
// TYPES
// ========================================

export type POSTab = "browse" | "sale" | "payment" | "history";

export interface POSUIState {
  // Active tab
  activeTab: POSTab;

  // Modals
  isProductModalOpen: boolean;
  isPaymentModalOpen: boolean;
  isSessionModalOpen: boolean;
  isCloseSessionModalOpen: boolean;
  isTransactionModalOpen: boolean;

  // Selected items
  selectedProductId: string | null;
  selectedTransactionId: string | null;

  // UI flags
  isSidebarOpen: boolean;
  isSearchOpen: boolean;
  isKeypadOpen: boolean;
}

export interface POSUIContextValue {
  // State
  state: POSUIState;

  // Tab management
  activeTab: POSTab;
  setActiveTab: (tab: POSTab) => void;

  // Modal management
  openProductModal: (productId?: string) => void;
  closeProductModal: () => void;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  openSessionModal: () => void;
  closeSessionModal: () => void;
  openCloseSessionModal: () => void;
  closeCloseSessionModal: () => void;
  openTransactionModal: (transactionId?: string) => void;
  closeTransactionModal: () => void;

  // UI controls
  toggleSidebar: () => void;
  toggleSearch: () => void;
  toggleKeypad: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Selection
  selectProduct: (productId: string | null) => void;
  selectTransaction: (transactionId: string | null) => void;

  // Helpers
  isModalOpen: boolean;
  closeAllModals: () => void;
}

// ========================================
// CONTEXT
// ========================================

const POSUIContext = createContext<POSUIContextValue | null>(null);

// ========================================
// INITIAL STATE
// ========================================

const INITIAL_STATE: POSUIState = {
  activeTab: "browse",
  isProductModalOpen: false,
  isPaymentModalOpen: false,
  isSessionModalOpen: false,
  isCloseSessionModalOpen: false,
  isTransactionModalOpen: false,
  selectedProductId: null,
  selectedTransactionId: null,
  isSidebarOpen: false,
  isSearchOpen: false,
  isKeypadOpen: false,
};

// ========================================
// PROVIDER
// ========================================

interface POSUIProviderProps {
  children: React.ReactNode;
  initialTab?: POSTab;
}

export function POSUIProvider({ children, initialTab }: POSUIProviderProps) {
  const [state, setState] = useState<POSUIState>({
    ...INITIAL_STATE,
    activeTab: initialTab || INITIAL_STATE.activeTab,
  });

  // ========================================
  // TAB MANAGEMENT
  // ========================================

  const setActiveTab = useCallback((tab: POSTab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  // ========================================
  // MODAL MANAGEMENT
  // ========================================

  const openProductModal = useCallback((productId?: string) => {
    setState((prev) => ({
      ...prev,
      isProductModalOpen: true,
      selectedProductId: productId || null,
    }));
  }, []);

  const closeProductModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isProductModalOpen: false,
      selectedProductId: null,
    }));
  }, []);

  const openPaymentModal = useCallback(() => {
    setState((prev) => ({ ...prev, isPaymentModalOpen: true }));
  }, []);

  const closePaymentModal = useCallback(() => {
    setState((prev) => ({ ...prev, isPaymentModalOpen: false }));
  }, []);

  const openSessionModal = useCallback(() => {
    setState((prev) => ({ ...prev, isSessionModalOpen: true }));
  }, []);

  const closeSessionModal = useCallback(() => {
    setState((prev) => ({ ...prev, isSessionModalOpen: false }));
  }, []);

  const openCloseSessionModal = useCallback(() => {
    console.log('[POSUIContext] openCloseSessionModal called');
    setState((prev) => {
      console.log('[POSUIContext] Setting isCloseSessionModalOpen to true');
      return { ...prev, isCloseSessionModalOpen: true };
    });
  }, []);

  const closeCloseSessionModal = useCallback(() => {
    setState((prev) => ({ ...prev, isCloseSessionModalOpen: false }));
  }, []);

  const openTransactionModal = useCallback((transactionId?: string) => {
    setState((prev) => ({
      ...prev,
      isTransactionModalOpen: true,
      selectedTransactionId: transactionId || null,
    }));
  }, []);

  const closeTransactionModal = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isTransactionModalOpen: false,
      selectedTransactionId: null,
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isProductModalOpen: false,
      isPaymentModalOpen: false,
      isSessionModalOpen: false,
      isCloseSessionModalOpen: false,
      isTransactionModalOpen: false,
      selectedProductId: null,
      selectedTransactionId: null,
    }));
  }, []);

  // ========================================
  // UI CONTROLS
  // ========================================

  const toggleSidebar = useCallback(() => {
    setState((prev) => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }));
  }, []);

  const toggleSearch = useCallback(() => {
    setState((prev) => ({ ...prev, isSearchOpen: !prev.isSearchOpen }));
  }, []);

  const toggleKeypad = useCallback(() => {
    setState((prev) => ({ ...prev, isKeypadOpen: !prev.isKeypadOpen }));
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isSidebarOpen: open }));
  }, []);

  // ========================================
  // SELECTION
  // ========================================

  const selectProduct = useCallback((productId: string | null) => {
    setState((prev) => ({ ...prev, selectedProductId: productId }));
  }, []);

  const selectTransaction = useCallback((transactionId: string | null) => {
    setState((prev) => ({ ...prev, selectedTransactionId: transactionId }));
  }, []);

  // ========================================
  // HELPERS
  // ========================================

  const isModalOpen =
    state.isProductModalOpen ||
    state.isPaymentModalOpen ||
    state.isSessionModalOpen ||
    state.isCloseSessionModalOpen ||
    state.isTransactionModalOpen;

  // ========================================
  // CONTEXT VALUE
  // ========================================

  const value: POSUIContextValue = {
    // State
    state,

    // Tab management
    activeTab: state.activeTab,
    setActiveTab,

    // Modal management
    openProductModal,
    closeProductModal,
    openPaymentModal,
    closePaymentModal,
    openSessionModal,
    closeSessionModal,
    openCloseSessionModal,
    closeCloseSessionModal,
    openTransactionModal,
    closeTransactionModal,
    closeAllModals,

    // UI controls
    toggleSidebar,
    toggleSearch,
    toggleKeypad,
    setSidebarOpen,

    // Selection
    selectProduct,
    selectTransaction,

    // Helpers
    isModalOpen,
  };

  return (
    <POSUIContext.Provider value={value}>{children}</POSUIContext.Provider>
  );
}

// ========================================
// HOOK
// ========================================

/**
 * Hook para acceder al contexto de UI del POS
 *
 * @throws Error si se usa fuera del POSUIProvider
 */
export function usePOSUI(): POSUIContextValue {
  const context = useContext(POSUIContext);

  if (!context) {
    throw new Error("usePOSUI must be used within a POSUIProvider");
  }

  return context;
}
