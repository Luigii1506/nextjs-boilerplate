// 🎨 FEATURE FLAGS UI UTILS
// =========================
// Utilidades para la interfaz de usuario de feature flags

import React from "react";
import {
  Shield,
  Package,
  Palette,
  Zap,
  Cpu,
  AlertCircle,
  CheckCircle,
  Info,
  Flag,
} from "lucide-react";

// 🎨 Tipos de colores de categorías
export interface CategoryColors {
  bg: string;
  text: string;
  border: string;
  icon: string;
}

// 🎯 Tipos de notificaciones
export interface NotificationState {
  type: "success" | "error" | "info" | "warning";
  message: string;
}

// 🎨 Obtener colores por categoría
export const getCategoryColors = (color: string): CategoryColors => {
  switch (color) {
    case "blue":
      return {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: "text-blue-600",
      };
    case "green":
      return {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
        icon: "text-green-600",
      };
    case "yellow":
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-700",
        border: "border-yellow-200",
        icon: "text-yellow-600",
      };
    case "purple":
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        icon: "text-purple-600",
      };
    case "red":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: "text-red-600",
      };
    case "orange":
      return {
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        icon: "text-orange-600",
      };
    default:
      return {
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        icon: "text-slate-600",
      };
  }
};

// 🎨 Obtener icono por nombre
export const getCategoryIcon = (
  iconName: string,
  size = 20
): React.ReactElement => {
  const iconMap: { [key: string]: React.ComponentType<{ size?: number }> } = {
    Shield,
    Package,
    Palette,
    Zap,
    Cpu,
    Flag,
    AlertCircle,
    CheckCircle,
    Info,
  };

  const IconComponent = iconMap[iconName] || Package;
  return React.createElement(IconComponent, { size });
};

// 🔔 Obtener estilos de notificación
export const getNotificationStyles = (type: NotificationState["type"]) => {
  switch (type) {
    case "success":
      return {
        container: "bg-green-50 border border-green-200",
        icon: "text-green-600",
        text: "text-green-800",
        IconComponent: CheckCircle,
      };
    case "error":
      return {
        container: "bg-red-50 border border-red-200",
        icon: "text-red-600",
        text: "text-red-800",
        IconComponent: AlertCircle,
      };
    case "warning":
      return {
        container: "bg-yellow-50 border border-yellow-200",
        icon: "text-yellow-600",
        text: "text-yellow-800",
        IconComponent: AlertCircle,
      };
    case "info":
    default:
      return {
        container: "bg-blue-50 border border-blue-200",
        icon: "text-blue-600",
        text: "text-blue-800",
        IconComponent: Info,
      };
  }
};

// 🎯 Filtrar datos por criterios
export const filterFeatureFlags = <
  T extends {
    name: string;
    description?: string;
    category: string;
    enabled: boolean;
  }
>(
  items: T[],
  filters: {
    search?: string;
    category?: string;
    status?: string;
  }
): T[] => {
  return items.filter((item) => {
    // Filtro de búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        false;

      if (!matchesSearch) return false;
    }

    // Filtro de categoría
    if (filters.category && filters.category !== "all") {
      if (item.category !== filters.category) return false;
    }

    // Filtro de estado
    if (filters.status && filters.status !== "all") {
      if (filters.status === "enabled" && !item.enabled) return false;
      if (filters.status === "disabled" && item.enabled) return false;
    }

    return true;
  });
};

// 🏷️ Agrupar elementos por categoría
export const groupByCategory = <T extends { category: string }>(
  items: T[]
): Record<string, T[]> => {
  return items.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// ⏱️ Formatear fecha relativa
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Hace unos segundos";
  if (diffMinutes < 60)
    return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? "s" : ""}`;
  if (diffHours < 24)
    return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`;

  return date.toLocaleDateString();
};

// 🎯 Generar ID único
export const generateFlagId = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^[0-9]/, "flag$&")
    .substring(0, 50);
};

// 🔍 Validar nombre de flag
export const validateFlagName = (
  name: string
): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "El nombre es requerido" };
  }

  if (name.length > 100) {
    return {
      valid: false,
      error: "El nombre es demasiado largo (máximo 100 caracteres)",
    };
  }

  return { valid: true };
};

// 🔍 Validar clave de flag
export const validateFlagKey = (
  key: string
): { valid: boolean; error?: string } => {
  if (!key || key.trim().length === 0) {
    return { valid: false, error: "La clave es requerida" };
  }

  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(key)) {
    return {
      valid: false,
      error: "La clave debe ser alfanumérica y empezar con letra",
    };
  }

  if (key.length > 50) {
    return {
      valid: false,
      error: "La clave es demasiado larga (máximo 50 caracteres)",
    };
  }

  return { valid: true };
};

// 🎨 Clase CSS dinámica
export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};
