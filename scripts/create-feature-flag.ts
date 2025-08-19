#!/usr/bin/env tsx

/**
 * 🎛️ CREATE FEATURE FLAG SCRIPT
 * =============================
 *
 * Script para crear nuevos feature flags de forma automatizada.
 * Actualiza código, base de datos y documentación.
 *
 * Usage:
 *   npm run create-flag darkMode "Dark Mode" "ui"
 *   npm run create-flag newDashboard "New Dashboard" "experimental" --rollout=25
 */

import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

interface FlagConfig {
  key: string;
  name: string;
  description?: string;
  category: "core" | "module" | "ui" | "experimental" | "admin";
  enabled?: boolean;
  rolloutPercentage?: number;
  envVar?: string;
  dependencies?: string[];
  targetAudience?: string[];
}

class FeatureFlagGenerator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createFeatureFlag(config: FlagConfig) {
    console.log(`🎛️ Creating feature flag: ${config.key}`);

    try {
      // 1. Actualizar feature-flags.ts
      await this.updateFeatureFlagsConfig(config);

      // 2. Crear entrada en base de datos
      await this.createDatabaseEntry(config);

      // 3. Crear archivos de ejemplo si es necesario
      await this.createExampleFiles(config);

      // 4. Actualizar documentación
      await this.updateDocumentation(config);

      console.log(`✅ Feature flag '${config.key}' created successfully!`);
      console.log(`\n📋 Next steps:`);
      console.log(`   1. Add environment variable: ${config.envVar}=true`);
      console.log(`   2. Implement your feature component`);
      console.log(`   3. Use: const enabled = useIsEnabled("${config.key}");`);
      console.log(`   4. Test and adjust rollout percentage in admin panel`);
    } catch (error) {
      console.error(`❌ Error creating feature flag:`, error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async updateFeatureFlagsConfig(config: FlagConfig) {
    const configPath = path.join(
      process.cwd(),
      "src/core/config/feature-flags.ts"
    );
    const content = await fs.readFile(configPath, "utf-8");

    // Determinar el valor del flag
    let flagValue: string;

    switch (config.category) {
      case "core":
        flagValue = config.enabled ? "true" : "false";
        break;
      case "module":
        const moduleName = config.key.replace(/([A-Z])/g, "_$1").toLowerCase();
        flagValue = `MODULE_CONFIG.${config.key}.enabled`;
        // También actualizar modules.ts si es necesario
        await this.updateModulesConfig(config);
        break;
      case "experimental":
      case "ui":
      case "admin":
        config.envVar =
          config.envVar || `FEATURE_${this.toScreamingSnakeCase(config.key)}`;
        flagValue = `process.env.${config.envVar} === "true"`;
        break;
      default:
        flagValue = "false";
    }

    // Encontrar la sección correcta e insertar el flag
    const sectionComments = {
      core: "// 🔥 CORE FEATURES",
      module: "// 🧩 MODULE FEATURES",
      experimental: "// 🧪 EXPERIMENTAL FEATURES",
      ui: "// 🎨 UI/UX FEATURES",
      admin: "// 🔧 ADMIN FEATURES",
    };

    const targetComment = sectionComments[config.category];
    const lines = content.split("\n");
    let insertIndex = -1;

    // Encontrar la línea después del comentario de la sección
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(targetComment)) {
        // Buscar la próxima línea en blanco o próxima sección
        for (let j = i + 1; j < lines.length; j++) {
          if (
            lines[j].trim() === "" ||
            lines[j].includes("// 🔥") ||
            lines[j].includes("// 🧩") ||
            lines[j].includes("// 🧪") ||
            lines[j].includes("// 🎨") ||
            lines[j].includes("// 🔧")
          ) {
            insertIndex = j;
            break;
          }
        }
        break;
      }
    }

    if (insertIndex === -1) {
      throw new Error(
        `Could not find section for category: ${config.category}`
      );
    }

    // Insertar el nuevo flag
    const newFlagLine = `  ${config.key}: ${flagValue},`;
    lines.splice(insertIndex, 0, newFlagLine);

    // También actualizar el tipo FeatureFlag
    const updatedContent = lines.join("\n");
    await fs.writeFile(configPath, updatedContent);

    console.log(`✅ Updated feature-flags.ts`);
  }

  private async updateModulesConfig(config: FlagConfig) {
    const modulesPath = path.join(process.cwd(), "src/core/config/modules.ts");
    const content = await fs.readFile(modulesPath, "utf-8");

    // Agregar configuración del módulo si no existe
    if (!content.includes(`${config.key}:`)) {
      const envVar =
        config.envVar || `MODULE_${this.toScreamingSnakeCase(config.key)}`;

      const newModuleConfig = `
  ${config.key}: {
    enabled: process.env.${envVar} === "true",
    features: [], // TODO: Define features
  },`;

      // Insertar antes del cierre del objeto MODULE_CONFIG
      const updatedContent = content.replace(
        "} as const;",
        `${newModuleConfig}
} as const;`
      );

      await fs.writeFile(modulesPath, updatedContent);
      console.log(`✅ Updated modules.ts`);
    }
  }

  private async createDatabaseEntry(config: FlagConfig) {
    try {
      await this.prisma.featureFlag.create({
        data: {
          key: config.key,
          name: config.name,
          description: config.description || `Feature flag for ${config.name}`,
          enabled: config.enabled || false,
          category: config.category,
          version: "1.0.0",
          rolloutPercentage: config.rolloutPercentage || 0,
          dependencies: config.dependencies || [],
          conflicts: [],
          targetAudience: config.targetAudience || [],
          hasPrismaModels: false,
        },
      });

      console.log(`✅ Created database entry`);
    } catch (error) {
      if (error.code === "P2002") {
        console.log(`⚠️  Database entry already exists, skipping...`);
      } else {
        throw error;
      }
    }
  }

  private async createExampleFiles(config: FlagConfig) {
    const examplesDir = path.join(process.cwd(), "examples/feature-flags");

    // Crear directorio si no existe
    try {
      await fs.mkdir(examplesDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }

    // Crear archivo de ejemplo
    const exampleContent = this.generateExampleComponent(config);
    const examplePath = path.join(examplesDir, `${config.key}Example.tsx`);

    await fs.writeFile(examplePath, exampleContent);
    console.log(`✅ Created example component: ${examplePath}`);
  }

  private generateExampleComponent(config: FlagConfig): string {
    return `/**
 * 🎛️ ${config.name.toUpperCase()} EXAMPLE
 * ${"=".repeat(config.name.length + 15)}
 *
 * Ejemplo de implementación para el feature flag '${config.key}'
 * Category: ${config.category}
 * 
 * Generated: ${new Date().toISOString().split("T")[0]}
 */

"use client";

import React from "react";
import { useIsEnabled } from "@/shared/hooks/useFeatureFlagsServerActions";

export function ${this.toPascalCase(config.key)}Example() {
  const isEnabled = useIsEnabled("${config.key}");

  // ❌ Feature no disponible
  if (!isEnabled) {
    return (
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center text-slate-600 dark:text-slate-400">
          <h3 className="font-medium mb-2">${config.name}</h3>
          <p className="text-sm">Esta función estará disponible próximamente</p>
        </div>
      </div>
    );
  }

  // ✅ Feature habilitada
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          ${config.name}
        </h3>
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
          Activo
        </span>
      </div>
      
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        ${config.description || `Implementación de ${config.name}`}
      </p>

      {/* TODO: Implementar la funcionalidad real aquí */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          🚧 Implementa tu funcionalidad aquí
        </p>
      </div>
    </div>
  );
}

// Hook personalizado para esta feature (opcional)
export function use${this.toPascalCase(config.key)}() {
  const isEnabled = useIsEnabled("${config.key}");
  
  // Agregar lógica específica de la feature aquí
  const someFeatureLogic = () => {
    if (!isEnabled) {
      console.warn("${config.name} is not enabled");
      return false;
    }
    
    // TODO: Implementar lógica
    return true;
  };

  return {
    isEnabled,
    someFeatureLogic,
  };
}

export default ${this.toPascalCase(config.key)}Example;
`;
  }

  private async updateDocumentation(config: FlagConfig) {
    // Crear entrada en README de feature flags
    const readmePath = path.join(
      process.cwd(),
      "docs/FEATURE_FLAGS_REGISTRY.md"
    );

    let content = "";
    try {
      content = await fs.readFile(readmePath, "utf-8");
    } catch (error) {
      // Crear archivo si no existe
      content = `# 🎛️ Feature Flags Registry

Lista de todos los feature flags en el sistema.

## 📊 Flags Activos

| Flag | Nombre | Categoría | Descripción | Estado |
|------|--------|-----------|-------------|--------|
`;
    }

    // Agregar nueva entrada
    const newEntry = `| \`${config.key}\` | ${config.name} | ${
      config.category
    } | ${config.description || "N/A"} | ${config.enabled ? "🟢" : "🔴"} |
`;

    // Insertar antes del final
    content = content.replace(
      "| Flag | Nombre | Categoría | Descripción | Estado |\n|------|--------|-----------|-------------|--------|\n",
      `| Flag | Nombre | Categoría | Descripción | Estado |
|------|--------|-----------|-------------|--------|
${newEntry}`
    );

    await fs.writeFile(readmePath, content);
    console.log(`✅ Updated documentation`);
  }

  private toScreamingSnakeCase(str: string): string {
    return str
      .replace(/([A-Z])/g, "_$1")
      .toUpperCase()
      .replace(/^_/, "");
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(`
🎛️ Feature Flag Generator

Usage:
  npm run create-flag <key> <name> <category> [options]

Examples:
  npm run create-flag darkMode "Dark Mode" ui
  npm run create-flag newDashboard "New Dashboard" experimental --rollout=25
  npm run create-flag applePaySupport "Apple Pay Support" module --env=MODULE_APPLE_PAY

Categories:
  - core: Funcionalidades base del sistema
  - module: Módulos opcionales
  - ui: Características de interfaz
  - experimental: Features en prueba
  - admin: Funcionalidades de administración

Options:
  --enabled=true/false    Estado inicial (default: false)
  --rollout=0-100        Porcentaje de rollout (default: 0)
  --env=ENV_VAR_NAME     Nombre de variable de entorno
  --desc="Description"   Descripción del flag
  --deps=flag1,flag2     Dependencias (separadas por coma)
  --audience=US,UK       Audiencia objetivo (países)
`);
    process.exit(1);
  }

  const [key, name, category] = args;
  const options = args.slice(3);

  // Parse options
  const config: FlagConfig = {
    key,
    name,
    category: category as FlagConfig["category"],
    enabled: false,
    rolloutPercentage: 0,
  };

  // Parse command line options
  options.forEach((option) => {
    if (option.startsWith("--enabled=")) {
      config.enabled = option.split("=")[1] === "true";
    } else if (option.startsWith("--rollout=")) {
      config.rolloutPercentage = parseInt(option.split("=")[1]);
    } else if (option.startsWith("--env=")) {
      config.envVar = option.split("=")[1];
    } else if (option.startsWith("--desc=")) {
      config.description = option.split("=")[1].replace(/"/g, "");
    } else if (option.startsWith("--deps=")) {
      config.dependencies = option.split("=")[1].split(",");
    } else if (option.startsWith("--audience=")) {
      config.targetAudience = option.split("=")[1].split(",");
    }
  });

  // Validate category
  const validCategories = ["core", "module", "ui", "experimental", "admin"];
  if (!validCategories.includes(config.category)) {
    console.error(
      `❌ Invalid category. Must be one of: ${validCategories.join(", ")}`
    );
    process.exit(1);
  }

  const generator = new FeatureFlagGenerator();
  await generator.createFeatureFlag(config);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
}

export { FeatureFlagGenerator };
