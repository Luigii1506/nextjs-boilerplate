// 🎣 Shared Hooks Barrel
// ========================
// Entry point para hooks compartidos

export * from "./useAuth";
// Removed useNoFlicker and useGlobalCache - replaced by TanStack Query
// useFeatureFlagsServerActions removed - consolidated into @/core/feature-flags
export * from "./useHydration";
export * from "./useHydrationSafe";
export * from "./usePermissions";
export * from "./useNotifications";
export * from "./useNotificationsBadge"; // ✅ NEW - TODO completado
export * from "./useBroadcast";
export * from "./useSwipeGestures"; // ✅ NEW - Mobile UX enhancement
export * from "./useScrollHeader"; // ✅ NEW - Reusable scroll header detection

export * from "./useI18n";
