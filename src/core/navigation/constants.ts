/**
 * 🧭 CORE NAVIGATION - ENTERPRISE CONSTANTS
 * ==========================================
 *
 * Configuración centralizada para el sistema de navegación del core.
 * Infraestructura base - siempre activa, parte del core del sistema.
 *
 * Created: 2025-01-17 - Core navigation system
 */

import { Home, Users, Upload, Sliders } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 🏗️ CORE CONFIG (siempre activo - infraestructura base)
export const NAVIGATION_CORE_CONFIG = {
  // ⚡ Performance settings
  debounceMs: 150,
  cacheTimeout: 10 * 60 * 1000, // 10 minutes

  // 🎨 UI Constants
  maxMenuItems: 20,
  animationDuration: 200,

  // 🔧 Core features (siempre habilitadas)
  advancedLogging: process.env.NODE_ENV === "development",
  performanceTracking: true,
  accessibilityMode: true,
} as const;

// 🎭 User Role Types
export type UserRole = "user" | "admin" | "super_admin";

// 🎛️ Feature Flag Types (usar los del sistema)
import type { FeatureFlag as SystemFeatureFlag } from "../config/feature-flags";
export type FeatureFlag = SystemFeatureFlag | null;

// 🧭 Navigation Item Interface
export interface NavigationItem {
  readonly id: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly label: string;
  readonly description?: string;
  readonly requiresAuth: boolean;
  readonly requiredRole: UserRole | null;
  readonly requiredFeature: FeatureFlag;
  readonly isCore: boolean; // true = core, false = módulo con feature flags
  readonly category: "core" | "feature" | "admin";
  readonly order: number;
  readonly isExternal?: boolean;
  readonly badge?: string;
}

// 🏷️ NAVIGATION REGISTRY - Configuración base del sistema (EXTENSIBLE)
export const NAVIGATION_REGISTRY: NavigationItem[] = [
  // 🏗️ CORE ITEMS (siempre activos - infraestructura)
  {
    id: "dashboard",
    href: "/dashboard",
    icon: Home,
    label: "Dashboard",
    description: "Panel principal de administración",
    requiresAuth: true,
    requiredRole: null,
    requiredFeature: null,
    isCore: true,
    category: "core",
    order: 1,
  },
  {
    id: "users",
    href: "/users",
    icon: Users,
    label: "Usuarios",
    description: "Gestión de usuarios del sistema",
    requiresAuth: true,
    requiredRole: null,
    requiredFeature: null,
    isCore: true,
    category: "core",
    order: 2,
  },

  // 🔧 FEATURE MODULES (módulos específicos con feature flags)
  {
    id: "file-upload",
    href: "/files",
    icon: Upload,
    label: "📁 Gestión de Archivos",
    description: "Subida y gestión de archivos",
    requiresAuth: true,
    requiredRole: null,
    requiredFeature: "fileUpload",
    isCore: false, // Es un módulo, no core
    category: "feature",
    order: 10,
    badge: "Beta",
  },

  // 🛡️ ADMIN ITEMS (administración del sistema)
  {
    id: "feature-flags",
    href: "/feature-flags",
    icon: Sliders,
    label: "🎛️ Feature Flags",
    description: "Configuración de características",
    requiresAuth: true,
    requiredRole: "admin",
    requiredFeature: null,
    isCore: true, // Admin es parte del core
    category: "admin",
    order: 90,
  },
];

// 📊 Navigation Categories
export const NAVIGATION_CATEGORIES = {
  core: "core",
  feature: "feature",
  admin: "admin",
} as const;

// 🎨 Navigation Styles (Design System)
export const NAVIGATION_STYLES = {
  base: "w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg transition-colors duration-200",
  active: "bg-slate-100 text-slate-800 font-medium shadow-sm",
  idle: "text-slate-600 hover:text-slate-800 hover:bg-slate-50",
  disabled: "text-slate-400 cursor-not-allowed opacity-60",
  badge:
    "ml-auto px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700",
  category: {
    core: "border-l-4 border-blue-500",
    feature: "border-l-4 border-green-500",
    admin: "border-l-4 border-purple-500",
  },
} as const;

// 🚀 Para futuro: Interface para módulos generados automáticamente
export interface GeneratedModuleConfig {
  readonly moduleName: string;
  readonly moduleType: "core" | "feature";
  readonly hasFeatureFlags: boolean;
  readonly requiredRole: UserRole | null;
  readonly category: NavigationCategory;
  readonly icon: keyof typeof import("lucide-react");
  readonly order?: number;
}

// 🎯 Helper Types
export type NavigationItemId = (typeof NAVIGATION_REGISTRY)[number]["id"];
export type NavigationCategory =
  (typeof NAVIGATION_REGISTRY)[number]["category"];

// 🔧 Utilidades para agregar módulos dinámicamente
export const NavigationRegistryUtils = {
  // Agregar módulo generado (para comandos automáticos)
  addGeneratedModule: (config: GeneratedModuleConfig): void => {
    const newItem: NavigationItem = {
      id: config.moduleName.toLowerCase(),
      href: `/${config.moduleName.toLowerCase()}`,
      icon: Home, // Default, se puede cambiar
      label: config.moduleName,
      description: `Módulo ${config.moduleName}`,
      requiresAuth: true,
      requiredRole: config.requiredRole,
      requiredFeature: config.hasFeatureFlags
        ? (config.moduleName as FeatureFlag)
        : null,
      isCore: config.moduleType === "core",
      category: config.category,
      order: config.order || 50,
    };

    NAVIGATION_REGISTRY.push(newItem);

    // Reordenar por order
    NAVIGATION_REGISTRY.sort((a, b) => a.order - b.order);
  },

  // Remover módulo
  removeModule: (moduleId: string): boolean => {
    const index = NAVIGATION_REGISTRY.findIndex((item) => item.id === moduleId);
    if (index > -1) {
      NAVIGATION_REGISTRY.splice(index, 1);
      return true;
    }
    return false;
  },

  // Obtener estadísticas
  getStats: () => ({
    total: NAVIGATION_REGISTRY.length,
    core: NAVIGATION_REGISTRY.filter((item) => item.isCore).length,
    modules: NAVIGATION_REGISTRY.filter((item) => !item.isCore).length,
    withFeatureFlags: NAVIGATION_REGISTRY.filter(
      (item) => !!item.requiredFeature
    ).length,
    categories: {
      core: NAVIGATION_REGISTRY.filter((item) => item.category === "core")
        .length,
      feature: NAVIGATION_REGISTRY.filter((item) => item.category === "feature")
        .length,
      admin: NAVIGATION_REGISTRY.filter((item) => item.category === "admin")
        .length,
    },
  }),
};
