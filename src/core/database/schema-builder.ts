// 🏗️ DYNAMIC SCHEMA BUILDER
// =========================
// Construye schema.prisma dinámicamente basado en feature flags activos

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📋 Configuración de módulos disponibles
export interface ModuleDefinition {
  key: string;
  name: string;
  prismaFile: string;
  dependencies: string[];
  requiredFlags: string[];
  description: string;
}

export const AVAILABLE_MODULES: ModuleDefinition[] = [
  {
    key: "auth",
    name: "Authentication",
    prismaFile: "models/auth.prisma",
    dependencies: [],
    requiredFlags: [], // Siempre activo
    description: "Core authentication models - always active",
  },
  {
    key: "feature-flags",
    name: "Feature Flags",
    prismaFile: "models/feature-flags.prisma",
    dependencies: [],
    requiredFlags: [], // Siempre activo
    description: "Feature flag management - always active",
  },
  {
    key: "file-upload",
    name: "File Upload System",
    prismaFile: "models/file-upload.prisma",
    dependencies: ["auth"],
    requiredFlags: ["fileUpload"],
    description: "File upload and management system",
  },
  // 🚧 Módulos futuros
  // {
  //   key: 'billing',
  //   name: 'Billing & Payments',
  //   prismaFile: 'models/billing.prisma',
  //   dependencies: ['auth'],
  //   requiredFlags: ['billing'],
  //   description: 'Stripe integration and payment processing'
  // },
  // {
  //   key: 'messaging',
  //   name: 'Real-time Messaging',
  //   prismaFile: 'models/messaging.prisma',
  //   dependencies: ['auth'],
  //   requiredFlags: ['messaging'],
  //   description: 'Chat and messaging system'
  // }
];

// 🎛️ Obtener módulos activos basado en feature flags
export async function getActiveModules(
  enabledFlags: string[]
): Promise<ModuleDefinition[]> {
  const activeModules: ModuleDefinition[] = [];

  for (const moduleItem of AVAILABLE_MODULES) {
    // Core modules (sin requiredFlags) siempre están activos
    if (moduleItem.requiredFlags.length === 0) {
      activeModules.push(moduleItem);
      continue;
    }

    // Verificar si todos los flags requeridos están activos
    const hasAllRequiredFlags = moduleItem.requiredFlags.every((flag) =>
      enabledFlags.includes(flag)
    );

    if (hasAllRequiredFlags) {
      activeModules.push(moduleItem);
    }
  }

  return activeModules;
}

// 🏗️ Construir schema.prisma dinámicamente
export async function buildDynamicSchema(
  activeModules: ModuleDefinition[]
): Promise<string> {
  const prismaDir = path.join(__dirname, "prisma");
  const baseSchemaPath = path.join(prismaDir, "schema.prisma");

  // Leer schema base (generator + datasource)
  const baseSchema = fs.readFileSync(baseSchemaPath, "utf-8");

  // Limpiar comentarios de modelos existentes (líneas que empiezan con // 📁)
  const lines = baseSchema.split("\n");
  const cleanedLines = lines.filter(
    (line) =>
      !line.trim().startsWith("// 📁") &&
      !line.trim().startsWith("// 🔐") &&
      !line.trim().startsWith("// 💳") &&
      !line.trim().startsWith("// 📦")
  );

  let schema = cleanedLines.join("\n");

  // Agregar comentario de generación automática
  schema += "\n\n// ⚡ AUTOMATICALLY GENERATED SCHEMA\n";
  schema += "// ================================\n";
  schema +=
    "// This schema is built dynamically based on active feature flags\n";
  schema += `// Generated at: ${new Date().toISOString()}\n`;
  schema += `// Active modules: ${activeModules
    .map((m) => m.key)
    .join(", ")}\n\n`;

  // Incluir modelos de módulos activos
  for (const moduleItem of activeModules) {
    const modelPath = path.join(prismaDir, moduleItem.prismaFile);

    if (fs.existsSync(modelPath)) {
      const modelContent = fs.readFileSync(modelPath, "utf-8");

      schema += `// 📁 ${moduleItem.name.toUpperCase()}\n`;
      schema += `// ${"=".repeat(moduleItem.name.length + 4)}\n`;
      schema += `// ${moduleItem.description}\n\n`;
      schema += modelContent;
      schema += "\n\n";
    } else {
      console.warn(`⚠️  Prisma model file not found: ${modelPath}`);
    }
  }

  return schema;
}

// 💾 Escribir schema generado
export async function writeGeneratedSchema(schema: string): Promise<void> {
  const outputPath = path.join(__dirname, "prisma", "generated-schema.prisma");
  fs.writeFileSync(outputPath, schema, "utf-8");
  console.log(`✅ Generated schema written to: ${outputPath}`);
}

// 🔄 Proceso completo de generación
export async function regenerateSchema(enabledFlags: string[]): Promise<void> {
  try {
    console.log("🏗️  Building dynamic Prisma schema...");
    console.log("🎛️  Enabled flags:", enabledFlags);

    // 1. Obtener módulos activos
    const activeModules = await getActiveModules(enabledFlags);
    console.log(
      "📦 Active modules:",
      activeModules.map((m) => m.key)
    );

    // 2. Construir schema
    const schema = await buildDynamicSchema(activeModules);

    // 3. Escribir schema generado
    await writeGeneratedSchema(schema);

    console.log("✅ Dynamic schema generation completed!");
  } catch (error) {
    console.error("❌ Error generating schema:", error);
    throw error;
  }
}
