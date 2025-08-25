/**
 * 👥 USERS SPA CONTEXT
 * ===================
 *
 * Estado compartido para el SPA de Users Management
 * Context Pattern + Custom Hooks para UX fluida
 * Siguiendo exactamente el patrón de InventoryContext
 *
 * Created: 2025-01-18 - Users SPA Context
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useUsersQuery } from "../hooks";
import type { User, UserSearchParams } from "../types";

// 🎯 TABS DISPONIBLES
export const USERS_TABS = [
  {
    id: "overview",
    label: "Vista General",
    icon: "Eye",
    description: "Métricas y dashboard general",
    color: "blue",
  },
  {
    id: "all-users",
    label: "Todos los Usuarios",
    icon: "Users",
    description: "Gestión completa de usuarios",
    color: "green",
  },
  {
    id: "admins",
    label: "Administradores",
    icon: "Shield",
    description: "Gestión de roles administrativos",
    color: "purple",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "BarChart3",
    description: "Métricas y análisis avanzados",
    color: "indigo",
  },
  {
    id: "permissions",
    label: "Permisos",
    icon: "Key",
    description: "Gestión de permisos (futuro)",
    color: "orange",
  },
  {
    id: "audit",
    label: "Auditoría",
    icon: "FileText",
    description: "Historial de actividades",
    color: "pink",
  },
] as const;

export type TabId = (typeof USERS_TABS)[number]["id"];

// 🏗️ INTERFACE DEL CONTEXTO
interface UsersContextType {
  // Tab Management
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isTabChanging: boolean;

  // Global Search & Filters
  globalSearchTerm: string;
  setGlobalSearchTerm: (term: string) => void;
  userFilters: UserSearchParams;
  setUserFilters: (filters: UserSearchParams) => void;

  // View Modes
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;

  // Modal States - User Management
  isUserModalOpen: boolean;
  setIsUserModalOpen: (open: boolean) => void;

  // User Edit States
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  isEditMode: boolean;

  // Delete Confirmation
  deletingUser: User | null;
  setDeletingUser: (user: User | null) => void;
  isDeleteConfirmOpen: boolean;
  setIsDeleteConfirmOpen: (open: boolean) => void;

  // User View States
  viewingUser: User | null;
  setViewingUser: (user: User | null) => void;
  isViewModalOpen: boolean;
  setIsViewModalOpen: (open: boolean) => void;

  // Ban/Unban States
  banningUser: User | null;
  setBanningUser: (user: User | null) => void;
  isBanConfirmOpen: boolean;
  setIsBanConfirmOpen: (open: boolean) => void;
  isBanReasonModalOpen: boolean;
  setIsBanReasonModalOpen: (open: boolean) => void;

  // Bulk Operations States
  selectedUsers: Set<string>;
  setSelectedUsers: (users: Set<string>) => void;
  isBulkMode: boolean;
  setIsBulkMode: (enabled: boolean) => void;

  // Data from useUsersQuery
  users: ReturnType<typeof useUsersQuery>;

  // Utility functions
  refetchAll: () => void;
  clearAllFilters: () => void;

  // Quick Actions
  openEditModal: (user: User) => void;
  closeEditModal: () => void;
  openDeleteConfirm: (user: User) => void;
  closeDeleteConfirm: () => void;
  openViewModal: (user: User) => void;
  closeViewModal: () => void;
  openBanConfirm: (user: User) => void;
  closeBanConfirm: () => void;
  openBanReasonModal: (user: User) => void;
  closeBanReasonModal: () => void;

  // Selection helpers
  toggleUserSelection: (userId: string) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;
  isUserSelected: (userId: string) => boolean;
}

// 🏗️ CONTEXT CREATION
const UsersContext = createContext<UsersContextType | null>(null);

// 🏗️ PROVIDER PROPS
interface UsersProviderProps {
  children: ReactNode;
}

// 🏗️ PROVIDER COMPONENT
export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  // 🎯 Tab Management
  const [activeTabState, setActiveTabState] = useState<TabId>("overview");
  const [isTabChanging, setIsTabChanging] = useState(false);

  // 🔍 Search & Filters
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [userFilters, setUserFilters] = useState<UserSearchParams>({});

  // 👁️ View Mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // 🎭 Modal States - User Management
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // ✏️ User Edit States
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 🗑️ Delete Confirmation
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // 👁️ User View States
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // 🚫 Ban/Unban States
  const [banningUser, setBanningUser] = useState<User | null>(null);
  const [isBanConfirmOpen, setIsBanConfirmOpen] = useState(false);
  const [isBanReasonModalOpen, setIsBanReasonModalOpen] = useState(false);

  // 📦 Bulk Operations
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  // 🎯 Computed values
  const isEditModeComputed = editingUser !== null;

  // 🔄 Main Data Query
  const users = useUsersQuery();

  // 🎯 Instant Tab Change for True SPA Experience
  const setActiveTab = useCallback(
    (tab: TabId) => {
      if (tab === activeTabState) return;

      // Instant change - no artificial delays
      setActiveTabState(tab);

      // Brief visual transition only for smooth UX
      setIsTabChanging(true);
      requestAnimationFrame(() => {
        setIsTabChanging(false);
      });
    },
    [activeTabState]
  );

  // 🔄 Refetch All Data
  const refetchAll = useCallback(() => {
    users.refresh();
  }, [users]);

  // 🧹 Clear All Filters
  const clearAllFilters = useCallback(() => {
    setGlobalSearchTerm("");
    setUserFilters({});
  }, []);

  // ✏️ User Edit Actions
  const openEditModal = useCallback((user: User) => {
    console.log("🔄 openEditModal called with user:", user);
    setEditingUser(user);
    setIsUserModalOpen(true);
    setIsEditMode(true);
    console.log("🔄 States after openEditModal - editingUser:", user, "isUserModalOpen: true");
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingUser(null);
    setIsUserModalOpen(false);
    setIsEditMode(false);
  }, []);

  // 🗑️ Delete Actions
  const openDeleteConfirm = useCallback((user: User) => {
    setDeletingUser(user);
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeletingUser(null);
    setIsDeleteConfirmOpen(false);
  }, []);

  // 👁️ View Actions
  const openViewModal = useCallback((user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    setViewingUser(null);
    setIsViewModalOpen(false);
  }, []);

  // 🚫 Ban Actions
  const openBanConfirm = useCallback((user: User) => {
    setBanningUser(user);
    setIsBanConfirmOpen(true);
  }, []);

  const closeBanConfirm = useCallback(() => {
    setBanningUser(null);
    setIsBanConfirmOpen(false);
  }, []);

  // 🚫 Ban Reason Modal Actions
  const openBanReasonModal = useCallback((user: User) => {
    setBanningUser(user);
    setIsBanReasonModalOpen(true);
  }, []);

  const closeBanReasonModal = useCallback(() => {
    setBanningUser(null);
    setIsBanReasonModalOpen(false);
  }, []);

  // 📦 Selection helpers
  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const selectAllUsers = useCallback(() => {
    const allUserIds = new Set(users.users.map((user) => user.id));
    setSelectedUsers(allUserIds);
  }, [users.users]);

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  const isUserSelected = useCallback(
    (userId: string) => {
      return selectedUsers.has(userId);
    },
    [selectedUsers]
  );

  // 🎯 CONTEXT VALUE
  const value: UsersContextType = {
    // Tab Management
    activeTab: activeTabState,
    setActiveTab,
    isTabChanging,

    // Search & Filters
    globalSearchTerm,
    setGlobalSearchTerm,
    userFilters,
    setUserFilters,

    // View Modes
    viewMode,
    setViewMode,

    // Modal States
    isUserModalOpen,
    setIsUserModalOpen,

    // Edit States
    editingUser,
    setEditingUser,
    isEditMode: isEditModeComputed,

    // Delete States
    deletingUser,
    setDeletingUser,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,

    // View States
    viewingUser,
    setViewingUser,
    isViewModalOpen,
    setIsViewModalOpen,

    // Ban States
    banningUser,
    setBanningUser,
    isBanConfirmOpen,
    setIsBanConfirmOpen,
    isBanReasonModalOpen,
    setIsBanReasonModalOpen,

    // Bulk States
    selectedUsers,
    setSelectedUsers,
    isBulkMode,
    setIsBulkMode,

    // Data
    users,

    // Utility functions
    refetchAll,
    clearAllFilters,

    // Quick Actions
    openEditModal,
    closeEditModal,
    openDeleteConfirm,
    closeDeleteConfirm,
    openViewModal,
    closeViewModal,
    openBanConfirm,
    closeBanConfirm,
    openBanReasonModal,
    closeBanReasonModal,

    // Selection helpers
    toggleUserSelection,
    selectAllUsers,
    clearSelection,
    isUserSelected,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
};

// 🎯 CUSTOM HOOK
export const useUsersContext = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error("useUsersContext must be used within UsersProvider");
  }
  return context;
};

// 🎯 TAB-SPECIFIC HOOKS
export const useTabTransition = () => {
  const { isTabChanging } = useUsersContext();
  return { isTabChanging };
};
