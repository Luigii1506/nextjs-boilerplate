/**
 * 🏢 SUPPLIER CONTEXT
 * ===================
 *
 * Context global para el módulo de Suppliers
 * Maneja estado compartido entre tabs y componentes
 * Pattern similar a InventoryContext
 *
 * Created: 2025-01-18 - Suppliers Management Module
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useSuppliersQuery } from "../hooks";
import type { SupplierWithRelations } from "@/shared/types";

// 🎯 Tab definitions
export const SUPPLIER_TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "BarChart3",
    color: "blue",
  },
  {
    id: "list",
    label: "Proveedores",
    icon: "Truck",
    color: "purple",
  },
  {
    id: "orders",
    label: "Órdenes de Compra",
    icon: "ShoppingCart",
    color: "green",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "TrendingUp",
    color: "orange",
  },
  {
    id: "reports",
    label: "Reportes",
    icon: "FileText",
    color: "pink",
  },
] as const;

export type TabId = (typeof SUPPLIER_TABS)[number]["id"];

// 🎯 Modal state types
interface ModalState {
  supplier: {
    isOpen: boolean;
    mode: "create" | "edit";
    data: SupplierWithRelations | null;
  };
  view: {
    isOpen: boolean;
    data: SupplierWithRelations | null;
  };
  delete: {
    isOpen: boolean;
    data: SupplierWithRelations | null;
  };
}

// 🎯 Context type
interface SupplierContextType {
  // Tab management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // Supplier data
  suppliers: {
    data: SupplierWithRelations[];
    isLoading: boolean;
    isRefetching: boolean;
    error: string | null;
    refetch: () => void;
  };

  // Modal management
  modals: ModalState;
  openSupplierModal: (
    mode: "create" | "edit",
    supplier?: SupplierWithRelations
  ) => void;
  closeSupplierModal: () => void;
  openViewModal: (supplier: SupplierWithRelations) => void;
  closeViewModal: () => void;
  openDeleteModal: (supplier: SupplierWithRelations) => void;
  closeDeleteModal: () => void;

  // Stats & metrics
  stats: {
    total: number;
    active: number;
    blocked: number;
    avgRating: number;
  };
}

const SupplierContext = createContext<SupplierContextType | undefined>(
  undefined
);

// 🎯 Provider component
export function SupplierProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = useState<TabId>("dashboard");
  const [isTabChanging, setIsTabChanging] = useState(false);
  const [modals, setModals] = useState<ModalState>({
    supplier: { isOpen: false, mode: "create", data: null },
    view: { isOpen: false, data: null },
    delete: { isOpen: false, data: null },
  });

  // 🔄 Fetch suppliers data
  const {
    data: suppliers = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useSuppliersQuery();

  // 🎯 Tab management with transition
  const setActiveTab = useCallback((tab: TabId) => {
    setIsTabChanging(true);
    setTimeout(() => {
      setActiveTabState(tab);
      setTimeout(() => setIsTabChanging(false), 50);
    }, 150);
  }, []);

  // 📊 Calculate stats
  const stats = useMemo(() => {
    const active = suppliers.filter((s) => s.active).length;
    const blocked = suppliers.filter((s) => !s.active).length;
    const avgRating =
      suppliers.reduce((acc, s) => acc + (s.rating || 0), 0) /
        (suppliers.length || 1);

    return {
      total: suppliers.length,
      active,
      blocked,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }, [suppliers]);

  // 🎯 Modal handlers
  const openSupplierModal = useCallback(
    (mode: "create" | "edit", supplier?: SupplierWithRelations) => {
      setModals((prev) => ({
        ...prev,
        supplier: { isOpen: true, mode, data: supplier || null },
      }));
    },
    []
  );

  const closeSupplierModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      supplier: { isOpen: false, mode: "create", data: null },
    }));
  }, []);

  const openViewModal = useCallback((supplier: SupplierWithRelations) => {
    setModals((prev) => ({
      ...prev,
      view: { isOpen: true, data: supplier },
    }));
  }, []);

  const closeViewModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      view: { isOpen: false, data: null },
    }));
  }, []);

  const openDeleteModal = useCallback((supplier: SupplierWithRelations) => {
    setModals((prev) => ({
      ...prev,
      delete: { isOpen: true, data: supplier },
    }));
  }, []);

  const closeDeleteModal = useCallback(() => {
    setModals((prev) => ({
      ...prev,
      delete: { isOpen: false, data: null },
    }));
  }, []);

  const value: SupplierContextType = {
    activeTab,
    setActiveTab,
    isTabChanging,
    suppliers: {
      data: suppliers,
      isLoading,
      isRefetching,
      error: error || null,
      refetch,
    },
    modals,
    openSupplierModal,
    closeSupplierModal,
    openViewModal,
    closeViewModal,
    openDeleteModal,
    closeDeleteModal,
    stats,
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
}

// 🎯 Custom hook to use context
export function useSupplierContext() {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error(
      "useSupplierContext must be used within SupplierProvider"
    );
  }
  return context;
}
