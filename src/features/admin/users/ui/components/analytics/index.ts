/**
 * 📊 ANALYTICS COMPONENTS - BARREL EXPORTS
 * =========================================
 *
 * Centralized exports for analytics-related UI components
 *
 * Created: 2025-01-27 - Analytics Components Extraction
 */

// Activity Configuration
export {
  getActivityIcon,
  getActivityColor,
  type ActivityType,
} from "./activityConfig";

// Simple Bar Chart Component
export { SimpleBarChart } from "./SimpleBarChart";
export type { SimpleBarChartProps, ChartDataItem } from "./SimpleBarChart";

// Activity Timeline Component
export { ActivityTimeline } from "./ActivityTimeline";
export type { ActivityTimelineProps, ActivityItem } from "./ActivityTimeline";
