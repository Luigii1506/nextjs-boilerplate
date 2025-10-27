/**
 * 📊 CHART CONFIGURATION
 * =======================
 *
 * Shared constants and configuration for charts
 * Used across all report chart components
 *
 * Created: 2025-01-27 - Extracted from ReportsTab
 */

/**
 * Color palette for charts (dark mode compatible)
 */
export const COLORS = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  purple: "#8B5CF6",
  cyan: "#06B6D4",
  pink: "#EC4899",
} as const;

/**
 * Array of colors for multi-series charts
 */
export const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.cyan,
] as const;

/**
 * Time range options for reports
 */
export const TIME_RANGES = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
] as const;

/**
 * Common tooltip styles for dark mode compatibility
 */
export const TOOLTIP_STYLES = {
  contentStyle: {
    backgroundColor: "var(--tooltip-bg, #ffffff)",
    border: "1px solid var(--tooltip-border, #e5e7eb)",
    borderRadius: "8px",
  },
  labelStyle: { color: "var(--tooltip-text, #374151)" },
} as const;

