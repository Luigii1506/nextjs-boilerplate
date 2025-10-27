/**
 * 📋 MOVEMENT CONFIGURATION
 * ==========================
 *
 * Shared types and configuration for stock movements
 * Used across all movement components
 *
 * Created: 2025-01-27 - Extracted from MovementsTab
 */

import {
  TrendingUp,
  TrendingDown,
  Edit3,
  Archive,
} from "lucide-react";

/**
 * Movement types
 */
export type MovementType = "IN" | "OUT" | "ADJUSTMENT" | "TRANSFER" | "ALL";

/**
 * Movement interface with product and user relations
 */
export interface Movement {
  id: string;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
  previousStock: number;
  newStock: number;
  product: {
    id: string;
    name: string;
    sku: string;
    images: string[];
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: Date;
}

/**
 * Movement type configuration for visual display
 */
export const MOVEMENT_TYPE_CONFIG = {
  IN: {
    label: "Entrada",
    icon: TrendingUp,
    color: "green",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    textColor: "text-green-700 dark:text-green-300",
    borderColor: "border-green-200 dark:border-green-800",
  },
  OUT: {
    label: "Salida",
    icon: TrendingDown,
    color: "red",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    textColor: "text-red-700 dark:text-red-300",
    borderColor: "border-red-200 dark:border-red-800",
  },
  ADJUSTMENT: {
    label: "Ajuste",
    icon: Edit3,
    color: "purple",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    textColor: "text-purple-700 dark:text-purple-300",
    borderColor: "border-purple-200 dark:border-purple-800",
  },
  TRANSFER: {
    label: "Transferencia",
    icon: Archive,
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-700 dark:text-blue-300",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
} as const;
