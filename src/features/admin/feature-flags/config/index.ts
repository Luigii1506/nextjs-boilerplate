// 🔧 FEATURE FLAGS CONFIG
// =======================
// Configuración simplificada para feature flags

// 🎨 Categories Configuration
export * from "./categories";

// 🎯 Metadata (si se usa)
export * from "./metadata";

// Re-export types for convenience
export type { FeatureFlag, FeatureGroup } from "@/core/config/feature-flags";
