/**
 * 🔧 ADDITIONAL MODULE GENERATORS
 * ===============================
 *
 * Funciones adicionales para generar archivos del módulo Enterprise.
 * Server Actions, Types, Schemas, UI Components, etc.
 *
 * Created: 2025-01-17 - Enterprise Module Generator
 */

import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import chalk from "chalk";

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

const log = {
  success: (msg: string) => console.log(chalk.green(`✅ ${msg}`)),
  error: (msg: string) => console.log(chalk.red(`❌ ${msg}`)),
  info: (msg: string) => console.log(chalk.blue(`ℹ️  ${msg}`)),
  warning: (msg: string) => console.log(chalk.yellow(`⚠️  ${msg}`)),
  step: (msg: string) => console.log(chalk.cyan(`🔧 ${msg}`)),
};

/**
 * 🏗️ GENERAR SERVER ACTIONS
 */
export async function generateServerActions(
  config: ModuleConfig
): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "server/actions/index.ts";
  const filePath = path.join(basePath, fileName);
  const pascalName = toPascalCase(config.name);

  const content = `/**
 * 🏗️ ${config.displayName.toUpperCase()} SERVER ACTIONS
 * ${"=".repeat(50)}
 * 
 * Server Actions para ${config.displayName}.
 * React 19 compliance con logging estructurado.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } server actions
 */

"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidateTag, revalidatePath } from "next/cache";
import { ${toCamelCase(
    config.name
  )}ServerActionLogger } from "../../utils/logger";
import { CACHE_TAGS } from "../../constants";

// 🎯 Action Result Interface
export interface ${pascalName}ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

// 🎯 Operation Input Interface
export interface ${pascalName}OperationInput {
  name: string;
  metadata?: Record<string, unknown>;
  ${config.prismaFields
    .map(
      (field) =>
        `${field.name}${field.optional ? "?" : ""}: ${getTypeScriptType(
          field.type
        )};`
    )
    .join("\n  ")}
}

/**
 * 📊 GET ${config.displayName.toUpperCase()} DATA
 */
export async function get${pascalName}DataServerAction(): Promise<${pascalName}ActionResult> {
  const requestId = \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  
  ${toCamelCase(
    config.name
  )}ServerActionLogger.timeStart(\`Get Data \${requestId}\`);
  ${toCamelCase(config.name)}ServerActionLogger.info("Getting ${
    config.displayName
  } data", { requestId });

  try {
    // 1. Authentication & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      ${toCamelCase(
        config.name
      )}ServerActionLogger.error("Unauthorized access attempt", null, { requestId });
      return { 
        success: false, 
        error: "No autorizado", 
        timestamp: new Date().toISOString(),
        requestId 
      };
    }

    ${toCamelCase(config.name)}ServerActionLogger.debug("User authenticated", {
      requestId,
      userId: session.user.id,
    });

    // 2. Business Logic - Get data
    // TODO: Implement actual data fetching logic
    const data = [
      {
        id: "example-1",
        name: "Ejemplo ${config.displayName}",
        userId: session.user.id,
        createdAt: new Date().toISOString(),
        ${config.prismaFields
          .map((field) => `${field.name}: ${getDefaultValue(field)}`)
          .join(",\n        ")}
      }
    ];

    ${toCamelCase(
      config.name
    )}ServerActionLogger.info("Data retrieved successfully", {
      requestId,
      dataCount: data.length,
    });

    ${toCamelCase(
      config.name
    )}ServerActionLogger.timeEnd(\`Get Data \${requestId}\`);
    
    return { 
      success: true, 
      data, 
      timestamp: new Date().toISOString(),
      requestId 
    };
  } catch (error) {
    ${toCamelCase(config.name)}ServerActionLogger.error("Failed to get ${
    config.displayName
  } data", error, { requestId });
    ${toCamelCase(
      config.name
    )}ServerActionLogger.timeEnd(\`Get Data \${requestId}\`);
    
    return { 
      success: false, 
      error: "Error al obtener datos", 
      timestamp: new Date().toISOString(),
      requestId 
    };
  }
}

/**
 * ⚡ PERFORM ${config.displayName.toUpperCase()} OPERATION
 */
export async function perform${pascalName}OperationServerAction(
  input: ${pascalName}OperationInput
): Promise<${pascalName}ActionResult> {
  const requestId = \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  
  ${toCamelCase(
    config.name
  )}ServerActionLogger.timeStart(\`Operation \${requestId}\`);
  ${toCamelCase(config.name)}ServerActionLogger.info("Starting ${
    config.displayName
  } operation", { 
    requestId,
    operation: "perform",
    inputType: typeof input,
  });

  try {
    // 1. Authentication & Authorization
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      ${toCamelCase(
        config.name
      )}ServerActionLogger.error("Unauthorized operation attempt", null, { requestId });
      return { 
        success: false, 
        error: "No autorizado", 
        timestamp: new Date().toISOString(),
        requestId 
      };
    }

    ${toCamelCase(
      config.name
    )}ServerActionLogger.debug("User authorized for operation", {
      requestId,
      userId: session.user.id,
      operation: "perform",
    });

    // 2. Input Validation
    if (!input.name?.trim()) {
      ${toCamelCase(
        config.name
      )}ServerActionLogger.warn("Invalid input: missing name", { requestId, input });
      return {
        success: false,
        error: "Nombre es requerido",
        timestamp: new Date().toISOString(),
        requestId
      };
    }

    // 3. Business Logic - Perform operation
    // TODO: Implement actual operation logic
    const result = {
      id: \`\${config.name}-\${Date.now()}\`,
      name: input.name,
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: input.metadata || {},
      ${config.prismaFields
        .map(
          (field) =>
            `${field.name}: input.${field.name} ${
              field.optional ? "|| null" : ""
            }`
        )
        .join(",\n      ")}
    };

    ${toCamelCase(
      config.name
    )}ServerActionLogger.info("Operation completed successfully", {
      requestId,
      resultId: result.id,
      operation: "perform",
    });

    // 4. Cache Invalidation
    revalidateTag(CACHE_TAGS.DATA);
    revalidatePath("${config.route}");
    
    ${toCamelCase(config.name)}ServerActionLogger.debug("Cache invalidated", {
      requestId,
      tags: [CACHE_TAGS.DATA],
      paths: ["${config.route}"],
    });

    ${toCamelCase(
      config.name
    )}ServerActionLogger.timeEnd(\`Operation \${requestId}\`);

    return { 
      success: true, 
      data: result, 
      timestamp: new Date().toISOString(),
      requestId 
    };
  } catch (error) {
    ${toCamelCase(config.name)}ServerActionLogger.error("${
    config.displayName
  } operation failed", error, { 
      requestId,
      input 
    });
    ${toCamelCase(
      config.name
    )}ServerActionLogger.timeEnd(\`Operation \${requestId}\`);
    
    return { 
      success: false, 
      error: "Error en la operación", 
      timestamp: new Date().toISOString(),
      requestId 
    };
  }
}

/**
 * 🗑️ DELETE ${config.displayName.toUpperCase()} ITEM
 */
export async function delete${pascalName}ItemServerAction(
  itemId: string
): Promise<${pascalName}ActionResult> {
  const requestId = \`req-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
  
  ${toCamelCase(
    config.name
  )}ServerActionLogger.timeStart(\`Delete \${requestId}\`);
  ${toCamelCase(config.name)}ServerActionLogger.info("Deleting ${
    config.displayName
  } item", { 
    requestId,
    itemId,
  });

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { 
        success: false, 
        error: "No autorizado", 
        timestamp: new Date().toISOString(),
        requestId 
      };
    }

    // TODO: Implement actual deletion logic
    ${toCamelCase(
      config.name
    )}ServerActionLogger.info("Item deleted successfully", {
      requestId,
      itemId,
    });

    revalidateTag(CACHE_TAGS.DATA);
    revalidatePath("${config.route}");

    ${toCamelCase(
      config.name
    )}ServerActionLogger.timeEnd(\`Delete \${requestId}\`);

    return { 
      success: true, 
      timestamp: new Date().toISOString(),
      requestId 
    };
  } catch (error) {
    ${toCamelCase(
      config.name
    )}ServerActionLogger.error("Delete operation failed", error, { 
      requestId,
      itemId 
    });
    ${toCamelCase(
      config.name
    )}ServerActionLogger.timeEnd(\`Delete \${requestId}\`);
    
    return { 
      success: false, 
      error: "Error al eliminar", 
      timestamp: new Date().toISOString(),
      requestId 
    };
  }
}`;

  await fs.writeFile(filePath, content);
}

/**
 * 📝 GENERAR TYPES
 */
export async function generateTypes(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "types/index.ts";
  const filePath = path.join(basePath, fileName);
  const pascalName = toPascalCase(config.name);

  const content = `/**
 * 📝 ${config.displayName.toUpperCase()} TYPES
 * ${"=".repeat(50)}
 * 
 * TypeScript interfaces para ${config.displayName}.
 * Types enterprise con validaciones y metadatos.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } types
 */

// 🎯 Base ${config.displayName} Item
export interface ${pascalName}Item {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  metadata?: Record<string, unknown>;
  ${config.prismaFields
    .map(
      (field) =>
        `${field.name}${field.optional ? "?" : ""}: ${getTypeScriptType(
          field.type
        )};`
    )
    .join("\n  ")}
}

// 🔧 Create Input
export interface ${pascalName}CreateInput {
  name: string;
  metadata?: Record<string, unknown>;
  ${config.prismaFields
    .filter((f) => !f.optional)
    .map((field) => `${field.name}: ${getTypeScriptType(field.type)};`)
    .join("\n  ")}
  ${config.prismaFields
    .filter((f) => f.optional)
    .map((field) => `${field.name}?: ${getTypeScriptType(field.type)};`)
    .join("\n  ")}
}

// ✏️ Update Input
export interface ${pascalName}UpdateInput extends Partial<${pascalName}CreateInput> {
  id: string;
}

// 🔍 Filter Options
export interface ${pascalName}FilterOptions {
  search?: string;
  sortBy?: keyof ${pascalName}Item;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  userId?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// 📊 Statistics Interface
export interface ${pascalName}Stats {
  total: number;
  active: number;
  completed: number;
  errors: number;
  lastUpdated: string;
  averageProcessingTime?: number;
  successRate?: number;
}

// 🎯 Operation Context
export interface ${pascalName}OperationContext {
  userId: string;
  requestId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// 📈 Performance Metrics
export interface ${pascalName}PerformanceMetrics {
  operationDuration: number;
  cacheHitRate: number;
  errorRate: number;
  throughput: number;
  lastMeasurement: string;
}

// 🔧 Configuration Types
export interface ${pascalName}Config {
  enableOptimisticUI: boolean;
  enableAutoRefresh: boolean;
  enableCaching: boolean;
  enableLogging: boolean;
  maxRetries: number;
  timeoutMs: number;
}

// 🎭 User Permissions
export interface ${pascalName}Permissions {
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManage: boolean;
}

// 📱 UI State Types
export interface ${pascalName}UIState {
  selectedItems: string[];
  viewMode: 'grid' | 'list' | 'table';
  filters: ${pascalName}FilterOptions;
  sorting: {
    field: keyof ${pascalName}Item;
    direction: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

// 🎯 Helper Types
export type ${pascalName}Status = 'idle' | 'loading' | 'success' | 'error';
export type ${pascalName}Operation = 'create' | 'read' | 'update' | 'delete' | 'refresh';
export type ${pascalName}SortField = keyof ${pascalName}Item;
export type ${pascalName}ViewMode = ${pascalName}UIState['viewMode'];

// 🔄 State Management Types
export interface ${pascalName}State {
  items: ${pascalName}Item[];
  status: ${pascalName}Status;
  error?: string;
  ui: ${pascalName}UIState;
  stats: ${pascalName}Stats;
  config: ${pascalName}Config;
  permissions: ${pascalName}Permissions;
}

// 📊 Analytics Types
export interface ${pascalName}Analytics {
  totalOperations: number;
  operationsByType: Record<${pascalName}Operation, number>;
  performanceMetrics: ${pascalName}PerformanceMetrics;
  userActivity: {
    activeUsers: number;
    averageSessionDuration: number;
    mostUsedFeatures: string[];
  };
}

// 🚨 Error Types
export interface ${pascalName}Error {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, unknown>;
  timestamp: string;
  recoverable: boolean;
}

// 🎯 Event Types
export interface ${pascalName}Event {
  type: ${pascalName}Operation;
  payload: unknown;
  timestamp: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

// 📦 Export convenience types
export type Create${pascalName}Input = ${pascalName}CreateInput;
export type Update${pascalName}Input = ${pascalName}UpdateInput;
export type ${pascalName}Filter = ${pascalName}FilterOptions;`;

  await fs.writeFile(filePath, content);
}

/**
 * 📋 GENERAR SCHEMAS
 */
export async function generateSchemas(config: ModuleConfig): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  const fileName = "schemas/index.ts";
  const filePath = path.join(basePath, fileName);
  const pascalName = toPascalCase(config.name);

  const content = `/**
 * 📋 ${config.displayName.toUpperCase()} SCHEMAS
 * ${"=".repeat(50)}
 * 
 * Zod validation schemas para ${config.displayName}.
 * Validaciones enterprise con mensajes personalizados.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } schemas
 */

import { z } from "zod";

// 🎯 Create Schema
export const ${toCamelCase(config.name)}CreateSchema = z.object({
  name: z
    .string()
    .min(1, "Nombre es requerido")
    .max(100, "Nombre debe tener máximo 100 caracteres")
    .trim(),
  metadata: z.record(z.unknown()).optional(),
  ${config.prismaFields.map((field) => generateZodField(field)).join(",\n  ")}
});

// ✏️ Update Schema
export const ${toCamelCase(config.name)}UpdateSchema = ${toCamelCase(
    config.name
  )}CreateSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID es requerido"),
  });

// 🔍 Filter Schema
export const ${toCamelCase(config.name)}FilterSchema = z.object({
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  userId: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
});

// 📊 Stats Schema
export const ${toCamelCase(config.name)}StatsSchema = z.object({
  total: z.number().min(0),
  active: z.number().min(0),
  completed: z.number().min(0),
  errors: z.number().min(0),
  lastUpdated: z.string().datetime(),
  averageProcessingTime: z.number().optional(),
  successRate: z.number().min(0).max(1).optional(),
});

// 🔧 Config Schema
export const ${toCamelCase(config.name)}ConfigSchema = z.object({
  enableOptimisticUI: z.boolean(),
  enableAutoRefresh: z.boolean(),
  enableCaching: z.boolean(),
  enableLogging: z.boolean(),
  maxRetries: z.number().min(0).max(10),
  timeoutMs: z.number().min(1000).max(60000),
});

// 📱 UI State Schema
export const ${toCamelCase(config.name)}UIStateSchema = z.object({
  selectedItems: z.array(z.string()),
  viewMode: z.enum(["grid", "list", "table"]),
  filters: ${toCamelCase(config.name)}FilterSchema,
  sorting: z.object({
    field: z.string(),
    direction: z.enum(["asc", "desc"]),
  }),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    total: z.number().min(0),
  }),
});

// 🚨 Error Schema
export const ${toCamelCase(config.name)}ErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
  recoverable: z.boolean(),
});

// 🎯 Event Schema
export const ${toCamelCase(config.name)}EventSchema = z.object({
  type: z.enum(["create", "read", "update", "delete", "refresh"]),
  payload: z.unknown(),
  timestamp: z.string().datetime(),
  userId: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

// 🔍 ID Schema (for params)
export const ${toCamelCase(config.name)}IdSchema = z.object({
  id: z.string().min(1, "ID es requerido"),
});

// 📦 Bulk Operations Schema
export const ${toCamelCase(config.name)}BulkCreateSchema = z.object({
  items: z.array(${toCamelCase(config.name)}CreateSchema).min(1).max(50),
});

export const ${toCamelCase(config.name)}BulkUpdateSchema = z.object({
  items: z.array(${toCamelCase(config.name)}UpdateSchema).min(1).max(50),
});

export const ${toCamelCase(config.name)}BulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(50),
});

// 🎭 Permission Schema
export const ${toCamelCase(config.name)}PermissionsSchema = z.object({
  canCreate: z.boolean(),
  canRead: z.boolean(),
  canUpdate: z.boolean(),
  canDelete: z.boolean(),
  canManage: z.boolean(),
});

// 📊 Analytics Schema
export const ${toCamelCase(config.name)}AnalyticsSchema = z.object({
  totalOperations: z.number().min(0),
  operationsByType: z.record(z.number()),
  performanceMetrics: z.object({
    operationDuration: z.number(),
    cacheHitRate: z.number().min(0).max(1),
    errorRate: z.number().min(0).max(1),
    throughput: z.number(),
    lastMeasurement: z.string().datetime(),
  }),
  userActivity: z.object({
    activeUsers: z.number().min(0),
    averageSessionDuration: z.number(),
    mostUsedFeatures: z.array(z.string()),
  }),
});

// 🎯 Export Type Inference
export type ${pascalName}CreateInput = z.infer<typeof ${toCamelCase(
    config.name
  )}CreateSchema>;
export type ${pascalName}UpdateInput = z.infer<typeof ${toCamelCase(
    config.name
  )}UpdateSchema>;
export type ${pascalName}FilterInput = z.infer<typeof ${toCamelCase(
    config.name
  )}FilterSchema>;
export type ${pascalName}StatsInput = z.infer<typeof ${toCamelCase(
    config.name
  )}StatsSchema>;
export type ${pascalName}ConfigInput = z.infer<typeof ${toCamelCase(
    config.name
  )}ConfigSchema>;
export type ${pascalName}UIStateInput = z.infer<typeof ${toCamelCase(
    config.name
  )}UIStateSchema>;
export type ${pascalName}ErrorInput = z.infer<typeof ${toCamelCase(
    config.name
  )}ErrorSchema>;
export type ${pascalName}EventInput = z.infer<typeof ${toCamelCase(
    config.name
  )}EventSchema>;
export type ${pascalName}IdInput = z.infer<typeof ${toCamelCase(
    config.name
  )}IdSchema>;
export type ${pascalName}BulkCreateInput = z.infer<typeof ${toCamelCase(
    config.name
  )}BulkCreateSchema>;
export type ${pascalName}BulkUpdateInput = z.infer<typeof ${toCamelCase(
    config.name
  )}BulkUpdateSchema>;
export type ${pascalName}BulkDeleteInput = z.infer<typeof ${toCamelCase(
    config.name
  )}BulkDeleteSchema>;
export type ${pascalName}PermissionsInput = z.infer<typeof ${toCamelCase(
    config.name
  )}PermissionsSchema>;
export type ${pascalName}AnalyticsInput = z.infer<typeof ${toCamelCase(
    config.name
  )}AnalyticsSchema>;

// 🔧 Validation Helper Functions
export const validate${pascalName}Create = (data: unknown) => 
  ${toCamelCase(config.name)}CreateSchema.safeParse(data);

export const validate${pascalName}Update = (data: unknown) => 
  ${toCamelCase(config.name)}UpdateSchema.safeParse(data);

export const validate${pascalName}Filter = (data: unknown) => 
  ${toCamelCase(config.name)}FilterSchema.safeParse(data);

export const validate${pascalName}Id = (data: unknown) => 
  ${toCamelCase(config.name)}IdSchema.safeParse(data);

// 🎯 Parse Helpers (throws on error)
export const parse${pascalName}Create = (data: unknown) => 
  ${toCamelCase(config.name)}CreateSchema.parse(data);

export const parse${pascalName}Update = (data: unknown) => 
  ${toCamelCase(config.name)}UpdateSchema.parse(data);

export const parse${pascalName}Filter = (data: unknown) => 
  ${toCamelCase(config.name)}FilterSchema.parse(data);

export const parse${pascalName}Id = (data: unknown) => 
  ${toCamelCase(config.name)}IdSchema.parse(data);`;

  await fs.writeFile(filePath, content);
}

/**
 * 🧩 GENERAR UI COMPONENTS
 */
export async function generateUIComponents(
  config: ModuleConfig
): Promise<void> {
  const basePath =
    config.type === "core"
      ? path.join(process.cwd(), "src", "features", config.name)
      : path.join(process.cwd(), "src", "modules", config.name);

  // 1. Generar componente principal
  const mainComponentPath = path.join(
    basePath,
    `ui/routes/${toPascalCase(config.name)}View.tsx`
  );
  const mainContent = `/**
 * 🎯 ${config.displayName.toUpperCase()} VIEW - MAIN COMPONENT
 * ${"=".repeat(50)}
 * 
 * Componente principal para ${config.displayName}.
 * Enterprise patterns con performance optimization.
 * 
 * Created: ${new Date().toISOString().split("T")[0]} - ${
    config.displayName
  } view
 */

"use client";

import React, { useState } from "react";
import { ${config.icon} } from "lucide-react";
import { use${config.type === "core" ? "Core" : ""}${toPascalCase(
    config.name
  )} } from "../../hooks/use${
    config.type === "core" ? "Core" : ""
  }${toPascalCase(config.name)}";
import { ${toPascalCase(
    config.name
  )}CreateForm } from "../components/${toPascalCase(config.name)}CreateForm";
import { ${toPascalCase(config.name)}List } from "../components/${toPascalCase(
    config.name
  )}List";
import { ${toPascalCase(config.name)}Stats } from "../components/${toPascalCase(
    config.name
  )}Stats";

export default function ${toPascalCase(config.name)}View() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const {
    data,
    isLoading,
    error,
    stats,
    performOperation,
    refresh,
    activeItems,
  } = use${config.type === "core" ? "Core" : ""}${toPascalCase(config.name)}();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ${config.displayName}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <${config.icon} className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-red-800 font-medium">Error al cargar ${
                config.displayName
              }</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={refresh}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <${config.icon} className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">${
                config.displayName
              }</h1>
              <p className="text-gray-600 mt-1">${config.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={refresh}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Actualizar
            </button>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showCreateForm ? 'Cancelar' : 'Nuevo'}
            </button>
          </div>
        </div>
        
        {/* Active Operations Indicator */}
        {activeItems.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              <span className="text-blue-800 text-sm font-medium">
                {activeItems.length} operación{activeItems.length !== 1 ? 'es' : ''} en progreso
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <${toPascalCase(config.name)}Stats stats={stats} />

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-8">
          <${toPascalCase(config.name)}CreateForm
            onSubmit={async (input) => {
              const result = await performOperation(input);
              if (result.success) {
                setShowCreateForm(false);
              }
              return result;
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Items List */}
      <${toPascalCase(config.name)}List
        items={data}
        onRefresh={refresh}
      />
    </div>
  );
}`;

  await fs.writeFile(mainComponentPath, mainContent);

  // 2. Generar componentes adicionales
  await generateUISubComponents(config, basePath);
}

async function generateUISubComponents(
  config: ModuleConfig,
  basePath: string
): Promise<void> {
  const pascalName = toPascalCase(config.name);

  // Create Form Component
  const createFormPath = path.join(
    basePath,
    `ui/components/${pascalName}CreateForm.tsx`
  );
  const createFormContent = `/**
 * 🎯 ${config.displayName.toUpperCase()} CREATE FORM
 */

"use client";

import React, { useState } from "react";
import { ${pascalName}CreateInput, ${pascalName}ActionResult } from "../../types";

interface ${pascalName}CreateFormProps {
  onSubmit: (input: ${pascalName}CreateInput) => Promise<${pascalName}ActionResult>;
  onCancel: () => void;
}

export function ${pascalName}CreateForm({ onSubmit, onCancel }: ${pascalName}CreateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const input: ${pascalName}CreateInput = {
      name: formData.get('name') as string,
      ${config.prismaFields
        .map(
          (field) =>
            `${field.name}: formData.get('${
              field.name
            }') as ${getTypeScriptType(field.type)}`
        )
        .join(",\n      ")}
    };

    try {
      const result = await onSubmit(input);
      if (!result.success) {
        setError(result.error || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Crear ${config.displayName}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa el nombre"
          />
        </div>

        ${config.prismaFields
          .map(
            (field) => `
        <div>
          <label htmlFor="${
            field.name
          }" className="block text-sm font-medium text-gray-700 mb-1">
            ${field.name}
          </label>
          <input
            type="${getHTMLInputType(field.type)}"
            id="${field.name}"
            name="${field.name}"
            ${field.optional ? "" : "required"}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>`
          )
          .join("")}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}`;

  await fs.writeFile(createFormPath, createFormContent);

  // List Component
  const listPath = path.join(basePath, `ui/components/${pascalName}List.tsx`);
  const listContent = `/**
 * 📋 ${config.displayName.toUpperCase()} LIST
 */

"use client";

import React from "react";
import { ${pascalName}Item } from "../../types";

interface ${pascalName}ListProps {
  items: ${pascalName}Item[];
  onRefresh: () => void;
}

export function ${pascalName}List({ items, onRefresh }: ${pascalName}ListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay elementos aún</p>
        <p className="text-gray-400 text-sm mt-2">
          Crea tu primer ${config.displayName.toLowerCase()} para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          ${config.displayName} ({items.length})
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
            
            ${config.prismaFields
              .slice(0, 2)
              .map(
                (field) => `
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">${field.name}:</span> {item.${field.name}}
            </p>`
              )
              .join("")}
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Creado: {new Date(item.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`;

  await fs.writeFile(listPath, listContent);

  // Stats Component
  const statsPath = path.join(basePath, `ui/components/${pascalName}Stats.tsx`);
  const statsContent = `/**
 * 📊 ${config.displayName.toUpperCase()} STATS
 */

"use client";

import React from "react";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";

interface ${pascalName}StatsProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    errors: number;
    progress?: number;
  };
}

export function ${pascalName}Stats({ stats }: ${pascalName}StatsProps) {
  const statItems = [
    {
      label: "Total",
      value: stats.total,
      icon: BarChart3,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Activos",
      value: stats.active,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Completados",
      value: stats.completed,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Errores",
      value: stats.errors,
      icon: Clock,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className={\`\${item.bg} p-2 rounded-md\`}>
                <Icon className={\`w-5 h-5 \${item.color}\`} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}`;

  await fs.writeFile(statsPath, statsContent);
}

// 🎯 Utility functions
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function toPascalCase(str: string): string {
  const camelCase = toCamelCase(str);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
}

function getTypeScriptType(prismaType: string): string {
  switch (prismaType) {
    case "String":
      return "string";
    case "Int":
      return "number";
    case "Boolean":
      return "boolean";
    case "DateTime":
      return "string";
    case "Json":
      return "Record<string, unknown>";
    default:
      return "unknown";
  }
}

function getHTMLInputType(prismaType: string): string {
  switch (prismaType) {
    case "String":
      return "text";
    case "Int":
      return "number";
    case "Boolean":
      return "checkbox";
    case "DateTime":
      return "datetime-local";
    case "Json":
      return "text";
    default:
      return "text";
  }
}

function getDefaultValue(field: PrismaField): string {
  if (field.default) return field.default;

  switch (field.type) {
    case "String":
      return '"Ejemplo"';
    case "Int":
      return "0";
    case "Boolean":
      return "false";
    case "DateTime":
      return "new Date().toISOString()";
    case "Json":
      return "{}";
    default:
      return "null";
  }
}

function generateZodField(field: PrismaField): string {
  let zodType = "";
  switch (field.type) {
    case "String":
      zodType = 'z.string().min(1, "Campo requerido")';
      break;
    case "Int":
      zodType = 'z.number().int("Debe ser un número entero")';
      break;
    case "Boolean":
      zodType = "z.boolean()";
      break;
    case "DateTime":
      zodType = 'z.string().datetime("Fecha inválida")';
      break;
    case "Json":
      zodType = "z.record(z.unknown())";
      break;
  }

  if (field.optional) {
    zodType += ".optional()";
  }

  return `${field.name}: ${zodType}`;
}

