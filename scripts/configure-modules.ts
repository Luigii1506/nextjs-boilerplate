#!/usr/bin/env tsx
// 🧩 MODULE CONFIGURATION SCRIPT
// ==============================
// Script para configurar módulos automáticamente

import { exec } from "child_process";
import { promisify } from "util";
import { PrismaClient } from "@prisma/client";
import {
  regenerateSchema,
  AVAILABLE_MODULES,
} from "../src/core/database/schema-builder";

const execAsync = promisify(exec);

interface ModuleSelection {
  [key: string]: boolean;
}

// 📋 Templates predefinidos
const PROJECT_TEMPLATES = {
  basic: {
    name: "Proyecto Básico",
    description: "Solo funcionalidades core (auth, dashboard, users)",
    modules: ["auth", "feature-flags"], // Siempre incluidos
  },

  saas: {
    name: "SaaS Application",
    description: "Aplicación SaaS completa con archivos y analytics",
    modules: ["auth", "feature-flags", "file-upload", "analytics"],
  },

  enterprise: {
    name: "Enterprise Platform",
    description: "Plataforma enterprise con todas las funcionalidades",
    modules: [
      "auth",
      "feature-flags",
      "file-upload",
      "analytics",
      "billing",
      "messaging",
    ],
  },

  custom: {
    name: "Configuración Personalizada",
    description: "Selecciona manualmente qué módulos incluir",
    modules: [], // Se define dinámicamente
  },
};

// 🎯 Funciones principales
export async function initializeDatabase() {
  console.log("🗃️  Initializing database...");

  try {
    // Generar y aplicar migración inicial
    await execAsync("npx prisma generate");
    await execAsync("npx prisma db push");
    console.log("✅ Database initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

export async function configureModules(selectedModules: string[]) {
  console.log("🧩 Configuring modules:", selectedModules);

  const prisma = new PrismaClient();

  try {
    // 1. Crear feature flags para módulos seleccionados
    for (const moduleKey of selectedModules) {
      const moduleInfo = AVAILABLE_MODULES.find((m) => m.key === moduleKey);
      if (!moduleInfo) continue;

      // Solo crear feature flags para módulos que las requieren
      if (moduleInfo.requiredFlags.length > 0) {
        for (const flagKey of moduleInfo.requiredFlags) {
          await prisma.featureFlag.upsert({
            where: { key: flagKey },
            update: { enabled: true }, // Habilitar si ya existe
            create: {
              key: flagKey,
              name: moduleInfo.name,
              description: moduleInfo.description,
              enabled: true,
              category: "module",
              hasPrismaModels: moduleKey !== "analytics", // analytics no tiene modelos
              prismaFile: moduleInfo.prismaFile,
              dependencies: moduleInfo.dependencies,
              conflicts: [],
              version: "1.0.0",
              tags: [moduleKey],
            },
          });

          console.log(
            `✅ Feature flag '${flagKey}' configured for ${moduleInfo.name}`
          );
        }
      }
    }

    // 2. Regenerar schema de Prisma
    const enabledFlags = selectedModules
      .map((moduleKey) => AVAILABLE_MODULES.find((m) => m.key === moduleKey))
      .filter(Boolean)
      .flatMap((module) => module!.requiredFlags);

    await regenerateSchema(enabledFlags);

    // 3. Regenerar cliente de Prisma
    console.log("🔄 Regenerating Prisma client...");
    await execAsync("npx prisma generate");

    // 4. Aplicar cambios a la base de datos
    console.log("📊 Applying database changes...");
    await execAsync("npx prisma db push");

    console.log("✅ Modules configured successfully!");
  } catch (error) {
    console.error("❌ Error configuring modules:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export async function selectTemplate(): Promise<string[]> {
  const { default: inquirer } = await import("inquirer");

  const { template } = await inquirer.prompt([
    {
      type: "list",
      name: "template",
      message: "🎯 ¿Qué tipo de proyecto quieres configurar?",
      choices: Object.entries(PROJECT_TEMPLATES).map(([key, config]) => ({
        name: `${config.name} - ${config.description}`,
        value: key,
      })),
    },
  ]);

  if (template === "custom") {
    return await selectCustomModules();
  }

  return PROJECT_TEMPLATES[template as keyof typeof PROJECT_TEMPLATES].modules;
}

export async function selectCustomModules(): Promise<string[]> {
  const { default: inquirer } = await import("inquirer");

  const choices = AVAILABLE_MODULES.filter(
    (module) => module.requiredFlags.length > 0
  ) // Solo módulos opcionales
    .map((module) => ({
      name: `${module.name} - ${module.description}`,
      value: module.key,
      checked: false,
    }));

  const { modules } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "modules",
      message: "📦 Selecciona los módulos que quieres incluir:",
      choices: choices,
    },
  ]);

  // Siempre incluir módulos core
  return ["auth", "feature-flags", ...modules];
}

export async function confirmConfiguration(modules: string[]) {
  const { default: inquirer } = await import("inquirer");

  console.log("\n📋 Configuración seleccionada:");
  modules.forEach((moduleKey) => {
    const moduleInfo = AVAILABLE_MODULES.find((m) => m.key === moduleKey);
    console.log(`  ✅ ${moduleInfo?.name || moduleKey}`);
  });

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "¿Proceder con esta configuración?",
      default: true,
    },
  ]);

  return confirm;
}

// 🚀 Función principal
export async function main() {
  try {
    console.log("🧩 NEXTJS SEED - MODULE CONFIGURATOR");
    console.log("=====================================\n");

    // 1. Seleccionar módulos
    const selectedModules = await selectTemplate();

    // 2. Confirmar configuración
    const confirmed = await confirmConfiguration(selectedModules);
    if (!confirmed) {
      console.log("❌ Configuración cancelada");
      return;
    }

    // 3. Inicializar base de datos
    await initializeDatabase();

    // 4. Configurar módulos
    await configureModules(selectedModules);

    console.log("\n🎉 ¡Configuración completada exitosamente!");
    console.log("\n📋 Próximos pasos:");
    console.log("  1. npm run dev - Iniciar servidor de desarrollo");
    console.log("  2. Acceder a /dashboard para ver el panel admin");
    console.log("  3. Ir a /feature-flags para gestionar módulos\n");
  } catch (error) {
    console.error("\n❌ Error durante la configuración:", error);
    process.exit(1);
  }
}

// 🎯 Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}
