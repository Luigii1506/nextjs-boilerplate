// 🔄 FEATURE FLAGS MAPPERS
// ========================
// Mappers para transformar datos entre capas (BD ↔ Dominio ↔ UI)

import type { FeatureFlag as PrismaFeatureFlag } from "@prisma/client";
import type { FeatureFlag } from "@/core/config/feature-flags";
import type { FeatureGroup } from "@/core/config/feature-flags";
import type {
  FeatureFlagCardData,
  FeatureFlagStats,
  FeatureFlagDomain,
} from "../../types";
import { FEATURE_FLAG_METADATA } from "@/features/admin/feature-flags/config/metadata";

// 🔄 Prisma → Dominio
export const mapPrismaToFeatureFlagDomain = (
  prismaFlag: PrismaFeatureFlag
): FeatureFlagDomain => {
  return {
    key: prismaFlag.key,
    name: prismaFlag.name,
    description: prismaFlag.description || undefined,
    enabled: prismaFlag.enabled,
    category: prismaFlag.category,
    version: prismaFlag.version,
    hasPrismaModels: prismaFlag.hasPrismaModels,
    dependencies: prismaFlag.dependencies,
    conflicts: prismaFlag.conflicts,
    rolloutPercentage: prismaFlag.rolloutPercentage,
    createdAt: prismaFlag.createdAt,
    updatedAt: prismaFlag.updatedAt,
  };
};

// 🔄 Dominio → UI Card
export const mapDomainToFeatureFlagCard = (
  domainFlag: FeatureFlagDomain
): FeatureFlagCardData => {
  // Buscar metadata en configuración estática (fallback)
  const metadata = FEATURE_FLAG_METADATA[domainFlag.key as FeatureFlag] || {
    name: domainFlag.name,
    description: domainFlag.description || "",
    icon: "Package",
    isPremium: false,
    dependencies: [],
  };

  // Mapear categoría de BD a grupo de UI
  const categoryMap: { [key: string]: FeatureGroup } = {
    module: "modules",
    ui: "ui",
    experimental: "experimental",
    core: "core",
    admin: "admin",
  };

  const category = categoryMap[domainFlag.category] || "core";

  return {
    id: domainFlag.key as FeatureFlag,
    name: domainFlag.name,
    description: domainFlag.description || metadata.description,
    category,
    enabled: domainFlag.enabled,
    icon: metadata.icon,
    isPremium: metadata.isPremium || false,
    dependencies: domainFlag.dependencies as FeatureFlag[],
    lastModified: domainFlag.updatedAt.toISOString(),
    modifiedBy: "Admin",
  };
};

// 📊 Calcular estadísticas de flags
export const calculateFeatureFlagStats = (
  flags: FeatureFlagCardData[]
): FeatureFlagStats => {
  return {
    totalFlags: flags.length,
    enabledFlags: flags.filter((f) => f.enabled).length,
    coreFlags: flags.filter((f) => f.category === "core").length,
    moduleFlags: flags.filter((f) => f.category === "modules").length,
    experimentalFlags: flags.filter((f) => f.category === "experimental")
      .length,
    uiFlags: flags.filter((f) => f.category === "ui").length,
    adminFlags: flags.filter((f) => f.category === "admin").length,
  };
};

// 🔄 Batch mapper para múltiples flags
export const mapPrismaArrayToDomainArray = (
  prismaFlags: PrismaFeatureFlag[]
): FeatureFlagDomain[] => {
  return prismaFlags.map(mapPrismaToFeatureFlagDomain);
};

export const mapDomainArrayToCardArray = (
  domainFlags: FeatureFlagDomain[]
): FeatureFlagCardData[] => {
  return domainFlags.map(mapDomainToFeatureFlagCard);
};

// 🎛️ Mapear estado simple para toggle
export const mapDomainToToggleState = (
  domainFlags: FeatureFlagDomain[]
): Record<string, boolean> => {
  const result: Record<string, boolean> = {};
  domainFlags.forEach((flag) => {
    result[flag.key] = flag.enabled;
  });
  return result;
};
