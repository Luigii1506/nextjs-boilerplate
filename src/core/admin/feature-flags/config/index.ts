// 🔧 FEATURE FLAGS CONFIG INDEX
// =============================
// Exportaciones centralizadas de configuración de feature flags

export * from "./metadata";
export * from "./categories";

// Re-export types for convenience
export type { FeatureFlag, FeatureGroup } from "@/config/feature-flags";
