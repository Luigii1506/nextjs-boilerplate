// 🔧 FEATURE FLAGS CONFIG INDEX
// =============================
// Exportaciones centralizadas de configuración de feature flags

export * from "../../../../features/admin/feature-flags/config/metadata";
export * from "../../../../features/admin/feature-flags/config/categories";

// Re-export types for convenience
export type { FeatureFlag, FeatureGroup } from "@/core/config/feature-flags";
