/**
 * 📦 INVENTORY SPA CONTEXT
 * =======================
 *
 * Estado compartido para el SPA de Inventory Management
 * Context Pattern + Custom Hooks para UX fluida
 *
 * Created: 2025-01-17 - Inventory SPA Context
 * Updated: 2025-01-18 - Moved to feature root (context/)
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useInventoryQuery } from "../hooks";
import type {
  ProductFilters,
  CategoryFilters,
  ProductWithRelations,
  CategoryWithRelations,
  SupplierWithRelations,
} from "../types";

// 🎯 TABS DISPONIBLES
export const INVENTORY_TABS = [
  {
    id: "overview",
    label: "📊 Dashboard",
    icon: "BarChart3",
    description: "Métricas y alertas generales",
    color: "blue",
  },
  {
    id: "products",
    label: "📦 Productos",
    icon: "Package",
    description: "Gestión de productos y stock",
    color: "green",
  },
  {
    id: "categories",
    label: "🏷️ Categorías",
    icon: "Tags",
    description: "Organización y clasificación",
    color: "purple",
  },
  {
    id: "suppliers",
    label: "🚛 Proveedores",
    icon: "Truck",
    description: "Gestión de proveedores",
    color: "orange",
  },
  {
    id: "movements",
    label: "📋 Movimientos",
    icon: "Archive",
    description: "Historial de stock",
    color: "indigo",
  },
  {
    id: "reports",
    label: "📊 Reportes",
    icon: "FileText",
    description: "Analytics y reportes",
    color: "pink",
  },
] as const;

export type TabId = (typeof INVENTORY_TABS)[number]["id"];

// 🏗️ INTERFACE DEL CONTEXTO
interface InventoryContextType {
  // Tab Management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // Global Search & Filters
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  productFilters: ProductFilters;
  setProductFilters: (filters: ProductFilters) => void;
  categoryFilters: CategoryFilters;
  setCategoryFilters: (filters: CategoryFilters) => void;

  // View Modes
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Modal States
  isProductModalOpen: boolean;
  setIsProductModalOpen: (open: boolean) => void;
  isCategoryModalOpen: boolean;
  setIsCategoryModalOpen: (open: boolean) => void;

  // Product Edit States
  editingProduct: ProductWithRelations | null;
  setEditingProduct: (product: ProductWithRelations | null) => void;
  isEditMode: boolean;

  // Delete Confirmation
  deletingProduct: ProductWithRelations | null;
  setDeletingProduct: (product: ProductWithRelations | null) => void;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;

  // Product View States
  viewingProduct: ProductWithRelations | null;
  setViewingProduct: (product: ProductWithRelations | null) => void;
  isViewModalOpen: boolean;
  setIsViewModalOpen: (open: boolean) => void;

  // Category Edit States
  editingCategory: CategoryWithRelations | null;
  setEditingCategory: (category: CategoryWithRelations | null) => void;
  isEditCategoryMode: boolean;

  // Category Delete Confirmation
  deletingCategory: CategoryWithRelations | null;
  setDeletingCategory: (category: CategoryWithRelations | null) => void;
  isCategoryDeleteConfirmOpen: boolean;
  setIsCategoryDeleteConfirmOpen: (open: boolean) => void;

  // Category View States
  viewingCategory: CategoryWithRelations | null;
  setViewingCategory: (category: CategoryWithRelations | null) => void;
  isCategoryViewModalOpen: boolean;
  setIsCategoryViewModalOpen: (open: boolean) => void;

  // Supplier Modal States
  isSupplierModalOpen: boolean;
  setIsSupplierModalOpen: (open: boolean) => void;

  // Supplier Edit States
  editingSupplier: SupplierWithRelations | null;
  setEditingSupplier: (supplier: SupplierWithRelations | null) => void;
  isEditSupplierMode: boolean;

  // Supplier Delete Confirmation
  deletingSupplier: SupplierWithRelations | null;
  setDeletingSupplier: (supplier: SupplierWithRelations | null) => void;
  isSupplierDeleteConfirmOpen: boolean;
  setIsSupplierDeleteConfirmOpen: (open: boolean) => void;

  // Supplier View States
  viewingSupplier: SupplierWithRelations | null;
  setViewingSupplier: (supplier: SupplierWithRelations | null) => void;
  isSupplierViewModalOpen: boolean;
  setIsSupplierViewModalOpen: (open: boolean) => void;

  // Data from API
  inventory: ReturnType<typeof useInventoryQuery>;

  // Actions
  refetchAll: () => void;
  clearAllFilters: () => void;
  // Product Actions
  openEditModal: (product: ProductWithRelations) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (product: ProductWithRelations) => void;
  closeDeleteConfirm: () => void;
  openViewModal: (product: ProductWithRelations) => void;
  closeViewModal: () => void;
  // Category Actions
  openEditCategoryModal: (category: CategoryWithRelations) => void;
  closeEditCategoryModal: () => void;
  openDeleteCategoryConfirm: (category: CategoryWithRelations) => void;
  closeDeleteCategoryConfirm: () => void;
  openViewCategoryModal: (category: CategoryWithRelations) => void;
  closeViewCategoryModal: () => void;
  // Supplier Actions
  openEditSupplierModal: (supplier: SupplierWithRelations) => void;
  closeEditSupplierModal: () => void;
  openDeleteSupplierConfirm: (supplier: SupplierWithRelations) => void;
  closeDeleteSupplierConfirm: () => void;
  openViewSupplierModal: (supplier: SupplierWithRelations) => void;
  closeViewSupplierModal: () => void;
}

// 🎯 CONTEXT CREATION
const InventoryContext = createContext<InventoryContextType | null>(null);

// 🎯 PROVIDER COMPONENT
interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({
  children,
}) => {
  // 🎨 Tab State
  const [activeTab, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);

  // 🔍 Search & Filters
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [productFilters, setProductFilters] = useState<ProductFilters>({});
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilters>({});

  // 🎛️ View Modes
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 📝 Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  // ✏️ Product Edit States
  const [editingProduct, setEditingProduct] =
    useState<ProductWithRelations | null>(null);
  const [deletingProduct, setDeletingProduct] =
    useState<ProductWithRelations | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 👁️ Product View States
  const [viewingProduct, setViewingProduct] =
    useState<ProductWithRelations | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // ✏️ Category Edit States
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithRelations | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<CategoryWithRelations | null>(null);
  const [isCategoryDeleteConfirmOpen, setIsCategoryDeleteConfirmOpen] =
    useState(false);

  // 👁️ Category View States
  const [viewingCategory, setViewingCategory] =
    useState<CategoryWithRelations | null>(null);
  const [isCategoryViewModalOpen, setIsCategoryViewModalOpen] = useState(false);

  // ✏️ Supplier Edit States
  const [editingSupplier, setEditingSupplier] =
    useState<SupplierWithRelations | null>(null);
  const [deletingSupplier, setDeletingSupplier] =
    useState<SupplierWithRelations | null>(null);
  const [isSupplierDeleteConfirmOpen, setIsSupplierDeleteConfirmOpen] =
    useState(false);

  // 👁️ Supplier View States
  const [viewingSupplier, setViewingSupplier] =
    useState<SupplierWithRelations | null>(null);
  const [isSupplierViewModalOpen, setIsSupplierViewModalOpen] = useState(false);

  // 🎯 Computed values
  const isEditMode = editingProduct !== null;
  const isEditCategoryMode = editingCategory !== null;
  const isEditSupplierMode = editingSupplier !== null;

  // 🔄 Main Data Query
  const inventory = useInventoryQuery({
    productFilters: {
      ...productFilters,
      search: globalSearchTerm || undefined,
    },
    categoryFilters,
    productsPagination: { page: 1, limit: 20 },
    enabled: true,
    refetchOnWindowFocus: false,
  });

  // 🎯 Instant Tab Change for True SPA Experience
  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (tab === activeTab) return;

      // Instant change - no artificial delays
      setActiveTabState(tab);

      // Brief visual transition only for smooth UX
      setIsTabChanging(true);
      requestAnimationFrame(() => {
        setIsTabChanging(false);
      });
    },
    [activeTab]
  );

  // 🔄 Refetch All Data
  const refetchAll = useCallback(() => {
    inventory.refetch();
  }, [inventory]);

  // 🧹 Clear All Filters
  const clearAllFilters = useCallback(() => {
    setGlobalSearchTerm("");
    setProductFilters({});
    setCategoryFilters({});
  }, []);

  // ✏️ Product Edit Actions
  const openEditModal = useCallback((product: ProductWithRelations) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingProduct(null);
    setIsProductModalOpen(false);
  }, []);

  const openDeleteConfirm = useCallback((product: ProductWithRelations) => {
    setDeletingProduct(product);
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeletingProduct(null);
    setIsDeleteConfirmOpen(false);
  }, []);

  // 👁️ Product View Actions
  const openViewModal = useCallback((product: ProductWithRelations) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewingProduct(null);
    setIsViewModalOpen(false);
  }, []);

  // ✏️ Category Edit Actions
  const openEditCategoryModal = useCallback(
    (category: CategoryWithRelations) => {
      setEditingCategory(category);
      setIsCategoryModalOpen(true);
    },
    []
  );

  const closeEditCategoryModal = useCallback(() => {
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
  }, []);

  const openDeleteCategoryConfirm = useCallback(
    (category: CategoryWithRelations) => {
      setDeletingCategory(category);
      setIsCategoryDeleteConfirmOpen(true);
    },
    []
  );

  const closeDeleteCategoryConfirm = useCallback(() => {
    setDeletingCategory(null);
    setIsCategoryDeleteConfirmOpen(false);
  }, []);

  // 👁️ Category View Actions
  const openViewCategoryModal = useCallback(
    (category: CategoryWithRelations) => {
      setViewingCategory(category);
      setIsCategoryViewModalOpen(true);
    },
    []
  );

  const closeViewCategoryModal = useCallback(() => {
    setViewingCategory(null);
    setIsCategoryViewModalOpen(false);
  }, []);

  // ✏️ Supplier Edit Actions
  const openEditSupplierModal = useCallback(
    (supplier: SupplierWithRelations) => {
      setEditingSupplier(supplier);
      setIsSupplierModalOpen(true);
    },
    []
  );

  const closeEditSupplierModal = useCallback(() => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(false);
  }, []);

  const openDeleteSupplierConfirm = useCallback(
    (supplier: SupplierWithRelations) => {
      setDeletingSupplier(supplier);
      setIsSupplierDeleteConfirmOpen(true);
    },
    []
  );

  const closeDeleteSupplierConfirm = useCallback(() => {
    setDeletingSupplier(null);
    setIsSupplierDeleteConfirmOpen(false);
  }, []);

  // 👁️ Supplier View Actions
  const openViewSupplierModal = useCallback(
    (supplier: SupplierWithRelations) => {
      setViewingSupplier(supplier);
      setIsSupplierViewModalOpen(true);
    },
    []
  );

  const closeViewSupplierModal = useCallback(() => {
    setViewingSupplier(null);
    setIsSupplierViewModalOpen(false);
  }, []);

  const value: InventoryContextType = {
    // Tab Management
    activeTab,
    setActiveTab,
    isTabChanging,

    // Search & Filters
    globalSearchTerm,
    setGlobalSearchTerm,
    productFilters,
    setProductFilters,
    categoryFilters,
    setCategoryFilters,

    // View Modes
    viewMode,
    setViewMode,

    // Modals
    isProductModalOpen,
    setIsProductModalOpen,
    isCategoryModalOpen,
    setIsCategoryModalOpen,
    isSupplierModalOpen,
    setIsSupplierModalOpen,

    // Product Edit States
    editingProduct,
    setEditingProduct,
    isEditMode,

    // Delete Confirmation
    deletingProduct,
    setDeletingProduct,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,

    // Product View States
    viewingProduct,
    setViewingProduct,
    isViewModalOpen,
    setIsViewModalOpen,

    // Category Edit States
    editingCategory,
    setEditingCategory,
    isEditCategoryMode,

    // Category Delete Confirmation
    deletingCategory,
    setDeletingCategory,
    isCategoryDeleteConfirmOpen,
    setIsCategoryDeleteConfirmOpen,

    // Category View States
    viewingCategory,
    setViewingCategory,
    isCategoryViewModalOpen,
    setIsCategoryViewModalOpen,

    // Supplier Edit States
    editingSupplier,
    setEditingSupplier,
    isEditSupplierMode,

    // Supplier Delete Confirmation
    deletingSupplier,
    setDeletingSupplier,
    isSupplierDeleteConfirmOpen,
    setIsSupplierDeleteConfirmOpen,

    // Supplier View States
    viewingSupplier,
    setViewingSupplier,
    isSupplierViewModalOpen,
    setIsSupplierViewModalOpen,

    // Data
    inventory,

    // Actions
    refetchAll,
    clearAllFilters,
    // Product Actions
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    openViewModal,
    closeViewModal,
    // Category Actions
    openEditCategoryModal,
    closeEditCategoryModal,
    openDeleteCategoryConfirm,
    closeDeleteCategoryConfirm,
    openViewCategoryModal,
    closeViewCategoryModal,
    // Supplier Actions
    openEditSupplierModal,
    closeEditSupplierModal,
    openDeleteSupplierConfirm,
    closeDeleteSupplierConfirm,
    openViewSupplierModal,
    closeViewSupplierModal,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// 🎯 CUSTOM HOOK
export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error(
      "useInventoryContext must be used within InventoryProvider"
    );
  }
  return context;
};

// 🎯 TAB-SPECIFIC HOOKS
export const useTabTransition = () => {
  const { activeTab, setActiveTab, isTabChanging } = useInventoryContext();

  const switchTab = useCallback(
    (tab: TabId) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  return {
    activeTab,
    switchTab,
    isTabChanging,
    currentTabConfig: INVENTORY_TABS.find((t) => t.id === activeTab)!,
  };
};
