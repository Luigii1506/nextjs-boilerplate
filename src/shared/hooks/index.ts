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
export * from "./useBroadcast";

export * from "./useI18n";
