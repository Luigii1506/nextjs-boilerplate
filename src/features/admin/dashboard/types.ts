/**
 * 📊 DASHBOARD TYPES
 *
 * Tipos TypeScript para el módulo simple de dashboard.
 */

import { User, UserStats } from "@/shared/types/user";

// 🏠 Props del componente principal
export interface DashboardPageProps {
  onViewChange?: (view: string) => void;
}

// 📊 Estado optimista del dashboard
export interface OptimisticDashboardState {
  stats: UserStats | null;
  recentUsers: User[];
  isRefreshing: boolean;
}

// 📈 Datos de actividad
export interface ActivityData {
  registrations: {
    value: number;
    trend: string;
  };
  logins: {
    value: number;
    trend: string;
  };
  verifications: {
    value: number;
    trend: string;
  };
}

// 🎛️ Estado de feature flags para el dashboard
export interface DashboardFeatureFlags {
  fileUpload: boolean;
  userManagement: boolean;
  advancedAnalytics: boolean;
  darkMode?: boolean;
  betaFeatures?: boolean;
}

// 📋 Configuración del dashboard
export interface DashboardConfig {
  refreshInterval?: number;
  showRecentUsers?: boolean;
  showFeatureFlags?: boolean;
  showQuickActions?: boolean;
  maxRecentUsers?: number;
}

// 🔄 Estado del hook useDashboard
export interface DashboardHookState {
  stats: UserStats | null;
  recentUsers: User[];
  activityData: Record<string, unknown> | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => void;
  // Individual refetch functions for granular control (optional)
  refetchStats?: () => void;
  refetchUsers?: () => void;
  refetchActivity?: () => void;
}

// 🎯 Acción rápida del dashboard
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  color: "blue" | "green" | "orange" | "purple" | "red";
}

// 📊 Tarjeta de estadística
export interface StatsCardProps {
  title: string;
  value: number;
  trend?: {
    value: string;
    direction: "up" | "down" | "stable";
  };
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "red" | "amber";
}
