#!/usr/bin/env tsx
/**
 * 🏗️ ENTERPRISE MODULE GENERATOR V2.0
 * ====================================
 *
 * Script automatizado para generar módulos Enterprise siguiendo los patrones
 * documentados en ENTERPRISE_PATTERNS.md
 *
 * Características:
 * - Soporte para módulos Core y Feature Flag
 * - Generación completa de archivos con templates
 * - Integración automática con navegación
 * - Creación de schema Prisma
 * - Configuración de feature flags
 *
 * Usage: npm run generate:module
 */

import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";
import {
  generateConstants,
  generateConfig,
  generateLogger,
  generateReducer,
  generateHook,
} from "./templates/module-generators";
import {
  generateServerActions,
  generateTypes,
  generateSchemas,
  generateUIComponents,
} from "./templates/additional-generators";

// 🎯 Types para el generador
interface ModuleConfig {
  name: string;
  displayName: string;
  description: string;
  type: "core" | "feature";
  icon: string;
  route: string;
  requiredRole: "user" | "admin" | "super_admin" | "none";
  category: "core" | "feature" | "admin";
  order: number;
  prismaFields: PrismaField[];
}

interface PrismaField {
  name: string;
  type: "String" | "Int" | "Boolean" | "DateTime" | "Json";
  optional: boolean;
  unique: boolean;
  default?: string;
}

// 🎨 Utilidades de colores
const log = {
  success: (msg: string) => console.log(chalk.green(`✅ ${msg}`)),
  error: (msg: string) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg: string) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  warning: (msg: string) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  step: (msg: string) => console.log(chalk.cyan(`🔧 ${msg}`)),
};

// 🎯 Iconos disponibles de Lucide React
const AVAILABLE_ICONS = [
  "Home",
  "Users",
  "Upload",
  "Sliders",
  "Database",
  "Shield",
  "Bell",
  "Search",
  "BarChart3",
  "MessageCircle",
  "Calendar",
  "Settings",
  "FileText",
  "Image",
  "Video",
  "Music",
  "Download",
  "Share",
  "Heart",
  "Star",
  "Bookmark",
  "Tag",
  "Archive",
  "Trash",
  "Edit",
  "Copy",
  "Cut",
  "Paste",
  "Save",
  "Print",
  "Mail",
  "Phone",
  "MapPin",
  "Globe",
  "Wifi",
  "Bluetooth",
  "Camera",
  "Mic",
  "Speaker",
  "Monitor",
  "Smartphone",
  "Tablet",
  "CreditCard",
  "ShoppingCart",
  "Package",
  "Truck",
  "Plane",
  "Car",
];

/**
 * 🚀 FUNCIÓN PRINCIPAL
 */
async function generateModule(): Promise<void> {
  console.log(
    chalk.bold.blue(`
🏗️  ENTERPRISE MODULE GENERATOR V2.0
====================================

Generando módulo con patrones Enterprise...
`)
  );

  try {
    // 1. Recopilar información del módulo
    const moduleConfig = await collectModuleInfo();

    // 2. Validar configuración
    validateModuleConfig(moduleConfig);

    // 3. Crear estructura de directorios
    await createModuleStructure(moduleConfig);

    // 4. Generar archivos base
    await generateModuleFiles(moduleConfig);

    // 5. Crear schema Prisma
    await generatePrismaSchema(moduleConfig);

    // 6. Integrar con navegación
    await integrateWithNavigation(moduleConfig);

    // 7. Actualizar feature flags (si aplica)
    if (moduleConfig.type === "feature") {
      await updateFeatureFlags(moduleConfig);
    }

    // 8. Formatear código generado
    await formatGeneratedCode(moduleConfig);

    // 9. Mostrar resumen
    showGenerationSummary(moduleConfig);
  } catch (error) {
    log.error(`Error durante la generación: ${error}`);
    process.exit(1);
  }
}

/**
 * 📝 RECOPILAR INFORMACIÓN DEL MÓDULO
 */
async function collectModuleInfo(): Promise<ModuleConfig> {
  log.step("Recopilando información del módulo...");

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "📝 Nombre del módulo (kebab-case):",
      validate: (input: string) => {
        if (!input.trim()) return "El nombre es requerido";
        if (!/^[a-z][a-z0-9-]*$/.test(input)) {
          return "Usar kebab-case (ej: user-management, file-upload)";
        }
        return true;
      },
      filter: (input: string) => input.trim().toLowerCase(),
    },
    {
      type: "input",
      name: "displayName",
      message: "🏷️  Nombre para mostrar:",
      validate: (input: string) =>
        input.trim() ? true : "El nombre para mostrar es requerido",
      filter: (input: string) => input.trim(),
    },
    {
      type: "input",
      name: "description",
      message: "📄 Descripción del módulo:",
      validate: (input: string) =>
        input.trim() ? true : "La descripción es requerida",
      filter: (input: string) => input.trim(),
    },
    {
      type: "list",
      name: "type",
      message: "🔧 Tipo de módulo:",
      choices: [
        {
          name: "🔧 Feature Flag - Experimental/Opcional (puede ser deshabilitado)",
          value: "feature",
        },
        {
          name: "🏗️  Core - Crítico/Esencial (siempre activo)",
          value: "core",
        },
      ],
    },
    {
      type: "list",
      name: "icon",
      message: "🎨 Ícono (Lucide React):",
      choices: AVAILABLE_ICONS.map((icon) => ({
        name: `${icon}`,
        value: icon,
      })),
      pageSize: 15,
    },
    {
      type: "input",
      name: "route",
      message: "🛣️  Ruta base (ej: /my-module):",
      default: (answers: any) => `/${answers.name}`,
      validate: (input: string) => {
        if (!input.startsWith("/")) return "La ruta debe empezar con /";
        if (!/^\/[a-z][a-z0-9-]*$/.test(input)) {
          return "Usar formato /kebab-case";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "requiredRole",
      message: "🛡️  Rol requerido:",
      choices: [
        { name: "👤 User - Cualquier usuario autenticado", value: "user" },
        { name: "👨‍💼 Admin - Solo administradores", value: "admin" },
        {
          name: "👨‍💻 Super Admin - Solo super administradores",
          value: "super_admin",
        },
        { name: "🌍 None - Sin restricciones", value: "none" },
      ],
    },
    {
      type: "list",
      name: "category",
      message: "📂 Categoría:",
      choices: [
        { name: "🏗️  Core - Funcionalidad base", value: "core" },
        { name: "🔧 Feature - Funcionalidad específica", value: "feature" },
        { name: "👨‍💼 Admin - Administración", value: "admin" },
      ],
    },
    {
      type: "number",
      name: "order",
      message: "🔢 Orden en navegación (1-100):",
      default: 50,
      validate: (input: number) => {
        if (input < 1 || input > 100)
          return "El orden debe estar entre 1 y 100";
        return true;
      },
    },
  ]);

  // Preguntas adicionales para Prisma
  const prismaAnswers = await inquirer.prompt([
    {
      type: "confirm",
      name: "createPrismaModel",
      message: "🗄️  ¿Crear modelo de base de datos (Prisma)?",
      default: true,
    },
  ]);

  let prismaFields: PrismaField[] = [];

  if (prismaAnswers.createPrismaModel) {
    log.info("Configurando campos de base de datos...");

    const addMoreFields = async (): Promise<void> => {
      const fieldAnswers = await inquirer.prompt([
        {
          type: "input",
          name: "fieldName",
          message: "📝 Nombre del campo:",
          validate: (input: string) => {
            if (!input.trim()) return "El nombre del campo es requerido";
            if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(input)) {
              return "Usar camelCase (ej: fileName, isActive)";
            }
            return true;
          },
        },
        {
          type: "list",
          name: "fieldType",
          message: "🔧 Tipo de dato:",
          choices: [
            { name: "📝 String - Texto", value: "String" },
            { name: "🔢 Int - Número entero", value: "Int" },
            { name: "✅ Boolean - Verdadero/Falso", value: "Boolean" },
            { name: "📅 DateTime - Fecha y hora", value: "DateTime" },
            { name: "📊 Json - Datos JSON", value: "Json" },
          ],
        },
        {
          type: "confirm",
          name: "optional",
          message: "❓ ¿Campo opcional?",
          default: false,
        },
        {
          type: "confirm",
          name: "unique",
          message: "🔑 ¿Valor único?",
          default: false,
        },
        {
          type: "input",
          name: "defaultValue",
          message: "⚙️  Valor por defecto (opcional):",
          when: (answers: any) => answers.optional,
        },
      ]);

      prismaFields.push({
        name: fieldAnswers.fieldName,
        type: fieldAnswers.fieldType,
        optional: fieldAnswers.optional,
        unique: fieldAnswers.unique,
        default: fieldAnswers.defaultValue,
      });

      const continueAdding = await inquirer.prompt([
        {
          type: "confirm",
          name: "addMore",
          message: "➕ ¿Agregar otro campo?",
          default: false,
        },
      ]);

      if (continueAdding.addMore) {
        await addMoreFields();
      }
    };

    await addMoreFields();
  }

  return {
    name: answers.name,
    displayName: answers.displayName,
    description: answers.description,
    type: answers.type,
    icon: answers.icon,
    route: answers.route,
    requiredRole: answers.requiredRole,
    category: answers.category,
    order: answers.order,
    prismaFields,
  };
}

/**
 * ✅ VALIDAR CONFIGURACIÓN DEL MÓDULO
 */
function validateModuleConfig(config: ModuleConfig): void {
  log.step("Validando configuración...");

  // Verificar que el módulo no exista
  const moduleBasePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  if (fs.existsSync(moduleBasePath)) {
    throw new Error(
      `El módulo '${config.name}' ya existe en ${moduleBasePath}`
    );
  }

  log.success("Configuración validada");
}

/**
 * 📁 CREAR ESTRUCTURA DE DIRECTORIOS
 */
async function createModuleStructure(config: ModuleConfig): Promise<void> {
  log.step("Creando estructura de directorios...");

  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const directories = [
    "constants",
    "config",
    "utils",
    "reducers",
    "hooks",
    "server/actions",
    "server/services",
    "server/queries",
    "server/mappers",
    "ui/components/shared",
    "ui/routes",
    "types",
    "schemas",
    "__tests__",
  ];

  for (const dir of directories) {
    const dirPath = path.join(basePath, dir);
    await fs.ensureDir(dirPath);
  }

  log.success(`Estructura creada en: ${basePath}`);
}

/**
 * 📄 GENERAR ARCHIVOS DEL MÓDULO
 */
async function generateModuleFiles(config: ModuleConfig): Promise<void> {
  log.step("Generando archivos del módulo...");

  const generators = [
    () => generateConstants(config),
    () => generateConfig(config),
    () => generateLogger(config),
    () => generateReducer(config),
    () => generateHook(config),
    () => generateServerActions(config),
    () => generateTypes(config),
    () => generateSchemas(config),
    () => generateUIComponents(config),
    () => generateBarrelExports(config),
    () => generateDocumentation(config),
  ];

  for (const generator of generators) {
    await generator();
  }

  log.success("Archivos generados exitosamente");
}

/**
 * 📄 GENERAR BARREL EXPORTS
 */
async function generateBarrelExports(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "index.ts";
  const filePath = path.join(basePath, fileName);
  const pascalName = toPascalCase(config.name);

  const content = `/**
 * 📄 ${config.displayName.toUpperCase()} - ENTERPRISE EXPORTS
 */

// 🎯 Core Hook
export { default as use${
    config.type === "core" ? "Core" : ""
  }${pascalName} } from "./hooks/use${
    config.type === "core" ? "Core" : ""
  }${pascalName}";

// 📝 Types & Interfaces
export type * from "./types";

// 🏗️ Configuration System
export { ${config.type === "core" ? "core" : ""}${toCamelCase(
    config.name
  )}Config } from "./config";

// 📊 Constants
export * from "./constants";

// 🎯 Server Actions
export * from "./server/actions";

// 📋 Schemas
export * from "./schemas";

// 🧩 UI Components
export { default as ${pascalName}View } from "./ui/routes/${pascalName}View";

// 📝 Logging System
export { ${toCamelCase(config.name)}Logger } from "./utils/logger";`;

  await fs.writeFile(filePath, content);
}

/**
 * 📚 GENERAR DOCUMENTACIÓN
 */
async function generateDocumentation(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const readmePath = path.join(basePath, "README.md");
  const readmeContent = `# ${config.displayName}

${config.description}

## Tipo de Módulo
- **Tipo**: ${
    config.type === "core"
      ? "Core (Infraestructura)"
      : "Feature Flag (Experimental)"
  }
- **Categoría**: ${config.category}
- **Rol requerido**: ${config.requiredRole}

## Uso

\`\`\`typescript
import { use${config.type === "core" ? "Core" : ""}${toPascalCase(
    config.name
  )} } from "@/${config.type === "core" ? "features" : "modules"}/${
    config.name
  }";

const { data, isLoading, performOperation } = use${
    config.type === "core" ? "Core" : ""
  }${toPascalCase(config.name)}();
\`\`\`

Generado con **Enterprise Patterns V2.0** - ${
    new Date().toISOString().split("T")[0]
  }
`;

  await fs.writeFile(readmePath, readmeContent);
}

/**
 * 🗄️ GENERAR SCHEMA PRISMA
 */
async function generatePrismaSchema(config: ModuleConfig): Promise<void> {
  if (config.prismaFields.length === 0) return;

  const schemaPath = path.join(
    process.cwd(),
    "src",
    "core",
    "database",
    "prisma",
    "schema.prisma"
  );
  const modelName = toPascalCase(config.name);

  const modelContent = `
model ${modelName} {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ${config.prismaFields.map((field) => generatePrismaField(field)).join("\n  ")}

  @@map("${config.name.replace(/-/g, "_")}")
}`;

  // Añadir al schema existente
  const currentSchema = await fs.readFile(schemaPath, "utf-8");
  const updatedSchema = currentSchema + modelContent;
  await fs.writeFile(schemaPath, updatedSchema);

  log.success(`Schema Prisma actualizado con modelo ${modelName}`);
}

/**
 * 🧭 INTEGRAR CON NAVEGACIÓN
 */
async function integrateWithNavigation(config: ModuleConfig): Promise<void> {
  const navigationPath = path.join(
    process.cwd(),
    "src",
    "core",
    "navigation",
    "constants.ts"
  );

  let content = await fs.readFile(navigationPath, "utf-8");

  // Agregar importación del ícono si no existe
  if (!content.includes(config.icon)) {
    content = content.replace(
      /import { ([^}]+) } from "lucide-react";/,
      `import { $1, ${config.icon} } from "lucide-react";`
    );
  }

  // Agregar item de navegación
  const navigationItem = `  {
    id: "${config.name}",
    href: "${config.route}",
    icon: ${config.icon},
    label: "${config.displayName}",
    description: "${config.description}",
    requiresAuth: true,
    requiredRole: ${
      config.requiredRole === "none" ? "null" : `"${config.requiredRole}"`
    },
    requiredFeature: ${
      config.type === "feature" ? `"${toCamelCase(config.name)}"` : "null"
    },
    isCore: ${config.type === "core"},
    category: "${config.category}",
    order: ${config.order},
  },`;

  content = content.replace(/(\];)/, `  ${navigationItem}\n$1`);
  await fs.writeFile(navigationPath, content);
  log.success("Integrado con sistema de navegación");
}

/**
 * 🎛️ ACTUALIZAR FEATURE FLAGS
 */
async function updateFeatureFlags(config: ModuleConfig): Promise<void> {
  const flagsPath = path.join(
    process.cwd(),
    "src",
    "core",
    "config",
    "feature-flags.ts"
  );

  let content = await fs.readFile(flagsPath, "utf-8");

  const flagLine = `  ${toCamelCase(config.name)}: MODULE_CONFIG.${toCamelCase(
    config.name
  )}.enabled,`;

  content = content.replace(
    /(\/\/ 🧩 MODULE FEATURES[\s\S]*?)(\/\/ 🧪 EXPERIMENTAL)/,
    `$1  ${flagLine}\n\n  $2`
  );

  await fs.writeFile(flagsPath, content);
  log.success("Feature flag agregado");
}

/**
 * 🎨 FORMATEAR CÓDIGO
 */
async function formatGeneratedCode(config: ModuleConfig): Promise<void> {
  try {
    const basePath =
      config.type === "core"
        ? path.join(process.cwd(), "src", "features", config.name)
        : path.join(process.cwd(), "src", "modules", config.name);

    execSync(`npx prettier --write "${basePath}/**/*.{ts,tsx}"`, {
      stdio: "ignore",
    });
    log.success("Código formateado");
  } catch (error) {
    log.warning("No se pudo formatear el código automáticamente");
  }
}

/**
 * 📊 MOSTRAR RESUMEN
 */
function showGenerationSummary(config: ModuleConfig): void {
  const basePath = config.type === "core" ? "src/features" : "src/modules";

  console.log(
    chalk.bold.green(`
🎉 ¡MÓDULO GENERADO EXITOSAMENTE!
================================

📝 Información del Módulo:
  • Nombre: ${config.displayName}
  • Tipo: ${
    config.type === "core"
      ? "Core (Infraestructura)"
      : "Feature Flag (Experimental)"
  }
  • Ubicación: ${basePath}/${config.name}
  • Ruta: ${config.route}

🏗️ Archivos Generados:
  • ✅ Configuración Enterprise completa
  • ✅ Hook React 19 compliance
  • ✅ Server Actions con logging
  • ✅ UI Components optimizados
  • ✅ Schemas Zod validation
  ${config.prismaFields.length > 0 ? "  • ✅ Prisma schema actualizado" : ""}
  • ✅ Navegación integrada
  ${config.type === "feature" ? "• ✅ Feature flag configurado" : ""}

🚀 Próximos Pasos:
  1. npm run db:push (si usas Prisma)
  2. Implementar lógica específica
  3. Personalizar componentes UI
  4. Agregar tests

¡Listo para usar! 🚀
`)
  );
}

// 🎯 Utility functions
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

function generatePrismaField(field: PrismaField): string {
  let prismaType = field.type;
  let attributes = "";

  if (field.optional) {
    prismaType += "?";
  }

  if (field.unique) {
    attributes += " @unique";
  }

  if (field.default) {
    attributes += ` @default(${field.default})`;
  }

  return `${field.name} ${prismaType}${attributes}`;
}

export { generateModule };

// 🚀 Ejecutar si se llama directamente
if (require.main === module) {
  generateModule().catch(console.error);
}
